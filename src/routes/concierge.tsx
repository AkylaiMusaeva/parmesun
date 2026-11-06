import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUp, Check, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ConciergeScenario, ConciergeStep, ConciergeSuggestion } from "@/domain/types";
import { conciergeScenariosQuery, directionsQuery, tiersQuery } from "@/services/queries";
import { matchScenario } from "@/lib/concierge";
import { directionPath } from "@/lib/journey";
import { nextTier, pointsForVisit, tierForPoints } from "@/lib/loyalty";
import { formatNumber } from "@/lib/format";
import { session, useSession } from "@/store/session";
import { DemoBadge, DemoNotice } from "@/components/brand/DemoBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAIReply, getAIStatus } from "@/services/ai";

export const Route = createFileRoute("/concierge")({
  head: () => ({
    meta: [
      { title: "AI Консьерж (демо) — PARMESUN ONE" },
      {
        name: "description",
        content: "Демонстрация AI Консьержа PARMESUN: подбор ужина, праздника, подарка или планов на выходные по готовым сценариям.",
      },
      { property: "og:title", content: "AI Консьерж PARMESUN — демо" },
      { property: "og:description", content: "Консьерж подбирает впечатления во всей экосистеме PARMESUN. Демо-сценарии." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(conciergeScenariosQuery()),
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
    ]),
  component: ConciergePage,
});

type Msg =
  | { id: number; role: "guest"; text: string }
  | { id: number; role: "concierge"; text: string; step?: ConciergeStep; scenarioId?: string; intro?: boolean };

let msgId = 0;
const nid = () => ++msgId;

const INTRO = "Здравствуйте, Алина! Я консьерж PARMESUN. Расскажите, что планируете, — подберу формат во всей экосистеме.";

function ConciergePage() {
  const { data: scenarios, source } = useSuspenseQuery(conciergeScenariosQuery()).data;
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const s = useSession();
  const tier = tierForPoints(s.earned, tiers);
  const next = nextTier(s.earned, tiers);
  const path = directionPath(s.interactions);
  const dirBySlug = Object.fromEntries(directions.map((d) => [d.slug, d]));

  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: "concierge", text: INTRO, intro: true }]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [aiConfigured, setAIConfigured] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  useEffect(() => {
    void getAIStatus().then((status) => setAIConfigured(status.configured));
  }, []);

  function reply(build: () => Msg) {
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, build()]);
    }, 700);
  }

  function personalize(scenario: ConciergeScenario, step: ConciergeStep): string {
    if (scenario.id === "tier" && next) {
      return `Сейчас у вас уровень ${tier.name}, до ${next.name} — ${formatNumber(next.threshold - s.earned)} баллов. ${step.message}`;
    }
    return step.message;
  }

  function startScenario(scenario: ConciergeScenario, text: string) {
    if (typing) return;
    setMessages((m) => [...m, { id: nid(), role: "guest", text }]);
    session.addConcierge(scenario.steps[scenario.start]?.suggestions?.[0]?.direction ?? "events", `Запрос консьержу: ${scenario.title.toLowerCase()}`);
    const step = scenario.steps[scenario.start]!;
    reply(() => ({ id: nid(), role: "concierge", text: personalize(scenario, step), step, scenarioId: scenario.id }));
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    const found = matchScenario(text, scenarios);
    if (found) return startScenario(found, text);
    setMessages((m) => [...m, { id: nid(), role: "guest", text }]);
    if (!aiConfigured) {
      reply(() => ({
        id: nid(),
        role: "concierge",
        text: "ИИ-сервис пока не настроен. Подключите OPENAI_API_KEY, и я смогу отвечать на свободные запросы. Пока выберите один из подготовленных сценариев.",
        intro: true,
      }));
      return;
    }

    setTyping(true);
    void getAIReply({
      data: {
        messages: [
          {
            role: "system",
            content: `Ты — AI-консьерж экосистемы PARMESUN. Отвечай кратко и по-русски, предлагай релевантные направления: гастрономия, подарки, wellness, досуг, мероприятия и клубная программа. Уровень гостя: ${tier.name}, баланс: ${s.points}. Не выдавай себя за сервис бронирования и не утверждай, что бронь уже оформлена.`,
          },
          ...messages
            .filter((message) => message.role === "guest" || message.role === "concierge")
            .slice(-10)
            .map((message) => ({ role: message.role === "guest" ? "user" as const : "assistant" as const, content: message.text })),
          { role: "user" as const, content: text },
        ],
      },
    }).then((result) => {
      setTyping(false);
      if (!result.ok) {
        setMessages((m) => [...m, {
          id: nid(),
          role: "concierge",
          text: `Не удалось получить ответ ИИ: ${result.message}`,
          intro: true,
        }]);
        return;
      }
      setMessages((m) => [...m, { id: nid(), role: "concierge", text: result.message, intro: true }]);
    });
  }

  function choose(scenarioId: string, label: string, nextId: string) {
    if (typing) return;
    const scenario = scenarios.find((x) => x.id === scenarioId)!;
    const step = scenario.steps[nextId]!;
    setMessages((m) => [...m, { id: nid(), role: "guest", text: label }]);
    reply(() => ({ id: nid(), role: "concierge", text: personalize(scenario, step), step, scenarioId }));
  }

  function act(key: string, sug: ConciergeSuggestion) {
    if (done.includes(key)) return;
    const isBooking = /заброн/i.test(sug.actionLabel);
    if (isBooking) session.addBooking(sug.direction, `Бронь: ${sug.title}`);
    else session.addRequest(sug.direction, `Заявка: ${sug.title}`);
    setDone((d) => [...d, key]);
    toast.success(isBooking ? "Бронь оформлена (демо)" : "Заявка отправлена (демо)", {
      description: `${sug.title} — уже в истории вашего кабинета.`,
      action: { label: "Открыть", onClick: () => (window.location.href = "/dashboard") },
    });
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    setTyping(false);
    setDone([]);
    setMessages([{ id: nid(), role: "concierge", text: INTRO, intro: true }]);
  }

  const last = messages[messages.length - 1];

  return (
    <div className="container-editorial pt-10 md:pt-16">
      <DemoNotice>
        {aiConfigured
          ? "ИИ подключён. Ответы могут быть неполными, а бронь и заявки остаются демо-действиями."
          : "ИИ пока не подключён: консьерж отвечает по сценариям либо сообщает о необходимости настройки ключа."}
      </DemoNotice>

      <section className="mt-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-accent">AI Консьерж</p>
          <h1 className="mt-4 text-5xl md:text-7xl">
            Чем вас <em className="italic">порадовать?</em>
          </h1>
        </div>
        <Button variant="outline" onClick={restart}>
          <RotateCcw /> Начать заново
        </Button>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-12">
        {/* Chat */}
        <div className="flex min-h-[36rem] flex-col border border-border bg-card lg:col-span-8">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-espresso text-ivory">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="font-display text-xl leading-none">Консьерж PARMESUN</p>
                <p className="mt-1 text-xs text-muted-foreground">{typing ? "печатает…" : "на связи"}</p>
              </div>
            </div>
            <DemoBadge source={source} />
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
            {messages.map((m) =>
              m.role === "guest" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-espresso px-4 py-3 text-sm text-ivory">{m.text}</p>
                </div>
              ) : (
                <div key={m.id} className="max-w-[92%] animate-rise space-y-3">
                  <p className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm leading-relaxed">{m.text}</p>

                  {m.intro && m === last && (
                    <div className="flex flex-wrap gap-2">
                      {scenarios.map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          disabled={typing}
                          onClick={() => startScenario(sc, sc.prompt)}
                          className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-foreground disabled:opacity-50"
                        >
                          {sc.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.step?.options && m === last && (
                    <div className="flex flex-wrap gap-2">
                      {m.step.options.map((o) => (
                        <button
                          key={o.next}
                          type="button"
                          disabled={typing}
                          onClick={() => choose(m.scenarioId!, o.label, o.next)}
                          className="rounded-full border border-espresso px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-espresso hover:text-ivory disabled:opacity-50"
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.step?.suggestions && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {m.step.suggestions.map((sug, i) => {
                        const key = `${m.id}-${i}`;
                        const d = dirBySlug[sug.direction];
                        const isDone = done.includes(key);
                        const pts = sug.points ? pointsForVisit(sug.points, tier) : 0;
                        return (
                          <div key={key} className="flex flex-col border border-border bg-background">
                            {d && (
                              <div className="relative h-24 overflow-hidden">
                                <img src={d.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                                <div className="card-veil absolute inset-0" />
                                <span className="eyebrow absolute bottom-2 left-3 text-on-photo">{d.titleRu}</span>
                              </div>
                            )}
                            <div className="flex flex-1 flex-col p-4">
                              <p className="font-display text-xl leading-tight">{sug.title}</p>
                              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{sug.description}</p>
                              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                                <span className="text-xs text-accent">{pts ? `+${pts} баллов` : "без баллов"}</span>
                                <Button size="sm" variant={isDone ? "sage" : "default"} onClick={() => act(key, sug)}>
                                  {isDone ? (
                                    <>
                                      <Check /> Готово
                                    </>
                                  ) : (
                                    sug.actionLabel
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {m.step?.suggestions && m === last && (
                    <button
                      type="button"
                      onClick={() =>
                        setMessages((ms) => [
                          ...ms,
                          { id: nid(), role: "concierge", text: "Чем ещё могу помочь?", intro: true },
                        ])
                      }
                      className="text-xs font-medium text-accent underline-offset-4 hover:underline"
                    >
                      Другой запрос →
                    </button>
                  )}
                </div>
              ),
            )}
            {typing && (
              <div className="flex w-fit gap-1 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3" aria-label="Консьерж печатает">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-accent"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
              placeholder="Например: ужин на годовщину, подарок другу…"
              aria-label="Сообщение консьержу"
              className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || typing} aria-label="Отправить">
              <ArrowUp />
            </Button>
          </form>
        </div>

        {/* Context */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="bg-espresso p-6 text-ivory md:p-8">
            <p className="eyebrow text-sage">Что учитывает консьерж</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-ivory/15 pb-3">
                <dt className="text-ivory/65">Уровень</dt>
                <dd className="font-display text-2xl">{tier.name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-ivory/15 pb-3">
                <dt className="text-ivory/65">Баланс</dt>
                <dd className="font-display text-2xl tabular-nums">{formatNumber(s.points)}</dd>
              </div>
              <div>
                <dt className="text-ivory/65">Уже знакомы</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {path.map((p) => (
                    <span key={p} className="rounded-full border border-ivory/25 px-2.5 py-0.5 text-xs">
                      {dirBySlug[p]?.titleRu}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border border-border bg-card p-6 md:p-8">
            <p className="eyebrow text-accent">Попробуйте спросить</p>
            <ul className="mt-5 space-y-1">
              {scenarios.map((sc) => (
                <li key={sc.id}>
                  <button
                    type="button"
                    disabled={typing}
                    onClick={() => startScenario(sc, sc.prompt)}
                    className="w-full border-b border-border py-3 text-left text-sm transition-colors hover:text-accent disabled:opacity-50"
                  >
                    «{sc.prompt}»
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">Брони и заявки в кабинете</Link>
          </Button>
        </aside>
      </section>
    </div>
  );
}

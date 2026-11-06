import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Gift, MessageCircle, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { DirectionSlug, InteractionKind } from "@/domain/types";
import { clientsQuery, directionsQuery, offersQuery, tiersQuery } from "@/services/queries";
import { nextTier, tierForPoints, tierRank } from "@/lib/loyalty";
import { directionPath, nextBestDirection } from "@/lib/journey";
import { formatDate, formatDateYear, formatNumber } from "@/lib/format";
import { demoCustomer } from "@/data/demo/customer";
import { DEMO_TODAY, session, useSession } from "@/store/session";
import { DemoNotice } from "@/components/brand/DemoBadge";
import { TierProgress } from "@/components/loyalty/TierProgress";
import { OfferCard } from "@/components/loyalty/OfferCard";
import { InteractionRow, kindLabels } from "@/components/loyalty/InteractionRow";
import { VisitDialog } from "@/components/loyalty/VisitDialog";
import { DirectionCard } from "@/components/ecosystem/DirectionCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createOdooTestCustomer, getOdooStatus, type OdooTestWriteResult } from "@/services/odoo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Личный кабинет (демо) — PARMESUN ONE" },
      {
        name: "description",
        content: "Демонстрационный кабинет гостя PARMESUN: уровень Circle, баланс, история взаимодействий и персональный путь.",
      },
      { property: "og:title", content: "Личный кабинет гостя — PARMESUN ONE" },
      { property: "og:description", content: "Демо-кабинет: баллы, история, предложения и путь гостя в экосистеме." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
      context.queryClient.ensureQueryData(offersQuery()),
      context.queryClient.ensureQueryData(clientsQuery()),
      getOdooStatus(),
    ]),
  component: DashboardPage,
});

type Period = "all" | "30" | "90";
const periods: { id: Period; label: string }[] = [
  { id: "all", label: "Всё время" },
  { id: "90", label: "90 дней" },
  { id: "30", label: "30 дней" },
];
const kinds: InteractionKind[] = ["visit", "booking", "request", "offer", "reward", "concierge"];
const PAGE = 8;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "border-espresso bg-espresso text-ivory" : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function DashboardPage() {
  const [, , , , odooStatus] = Route.useLoaderData();
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const { data: offers } = useSuspenseQuery(offersQuery()).data;
  const { data: clients } = useSuspenseQuery(clientsQuery()).data;
  const s = useSession();
  const [odooWriteTest, setOdooWriteTest] = useState<OdooTestWriteResult | null>(null);
  const [odooWriteLoading, setOdooWriteLoading] = useState(false);

  const [dir, setDir] = useState<DirectionSlug | "all">("all");
  const [kind, setKind] = useState<InteractionKind | "all">("all");
  const [period, setPeriod] = useState<Period>("all");
  const [limit, setLimit] = useState(PAGE);

  const tier = tierForPoints(s.earned, tiers);
  const next = nextTier(s.earned, tiers);
  const rank = tierRank(tier.id, tiers);
  const dirBySlug = Object.fromEntries(directions.map((d) => [d.slug, d]));
  const path = directionPath(s.interactions);
  const suggestion = nextBestDirection(path, clients, directions.map((d) => d.slug));
  const suggestionDir = suggestion ? dirBySlug[suggestion] : undefined;
  const recommendations = directions.filter((d) => !path.includes(d.slug));
  const monthPoints = s.interactions
    .filter((v) => v.points > 0 && v.date >= "2026-10-01")
    .reduce((sum, v) => sum + v.points, 0);

  const filtered = useMemo(() => {
    const from = period === "all" ? null : new Date(DEMO_TODAY).getTime() - Number(period) * 86_400_000;
    return s.interactions.filter(
      (i) =>
        (dir === "all" || i.direction === dir) &&
        (kind === "all" || i.kind === kind) &&
        (from === null || new Date(i.date).getTime() >= from),
    );
  }, [s.interactions, dir, kind, period]);
  const filteredEarned = filtered.filter((i) => i.points > 0).reduce((a, i) => a + i.points, 0);
  const filteredSpent = filtered.filter((i) => i.points < 0).reduce((a, i) => a - i.points, 0);
  const anyFilter = dir !== "all" || kind !== "all" || period !== "all";

  function resetFilters() {
    setDir("all");
    setKind("all");
    setPeriod("all");
    setLimit(PAGE);
  }

  function toggleOffer(id: string, direction: DirectionSlug, title: string) {
    const on = session.toggleOffer(id, direction, title);
    toast[on ? "success" : "info"](on ? "Предложение активировано" : "Предложение отменено", { description: title });
  }

  async function runOdooWriteTest() {
    if (odooWriteLoading || !odooStatus.connected) return;
    setOdooWriteLoading(true);
    try {
      const result = await createOdooTestCustomer();
      setOdooWriteTest(result);
      toast[result.ok ? "success" : "error"](result.message);
    } finally {
      setOdooWriteLoading(false);
    }
  }

  return (
    <div className="container-editorial pt-10 md:pt-16">
      <DemoNotice>
        Кабинет вымышленного гостя. Действия сохраняются только в этом браузере.{" "}
        <button
          type="button"
          className="font-semibold underline underline-offset-4"
          onClick={() => {
            session.reset();
            resetFilters();
            toast("Демо-данные сброшены");
          }}
        >
          <RotateCcw className="mr-1 inline size-3.5" />
          Сбросить
        </button>
      </DemoNotice>

      <section className="mt-6 border border-border bg-card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-accent">Odoo</p>
            <p className="mt-2 text-sm font-semibold">
              {odooStatus.connected ? "Подключение работает" : "Подключение не готово"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{odooStatus.message}</p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold",
              odooStatus.connected ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800",
            )}
          >
            {odooStatus.connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
        {odooStatus.connected && (
          <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            {[
              ["Contacts", "contacts"],
              ["CRM", "crm"],
              ["Sales", "sale_management"],
              ["Loyalty", "loyalty"],
            ].map(([label, key]) => (
              <div key={key} className="rounded-lg border border-border px-3 py-2">
                <span>{label}: </span>
                <strong className={odooStatus.modules[key] ? "text-emerald-700" : "text-red-700"}>
                  {odooStatus.modules[key] ? "установлено" : "не найдено"}
                </strong>
              </div>
            ))}
          </div>
        )}
        {odooStatus.connected && (
          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" size="sm" onClick={runOdooWriteTest} disabled={odooWriteLoading}>
              <Plus />
              {odooWriteLoading ? "Создание..." : "Создать тестового клиента в Odoo"}
            </Button>
            {odooWriteTest && (
              <p className={cn("text-xs", odooWriteTest.ok ? "text-emerald-700" : "text-red-700")}>
                {odooWriteTest.message}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Greeting */}
      <section className="mt-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-accent">Личный кабинет</p>
          <h1 className="mt-4 text-5xl md:text-7xl">
            Доброе утро, <em className="italic">{demoCustomer.firstName}</em>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {demoCustomer.firstName} {demoCustomer.lastName} · в PARMESUN с {formatDateYear(demoCustomer.memberSince)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <VisitDialog
            directions={directions}
            tiers={tiers}
            trigger={
              <Button>
                <Plus /> Отметить визит
              </Button>
            }
          />
          <Button asChild variant="outline">
            <Link to="/concierge">
              <MessageCircle /> Консьерж
            </Link>
          </Button>
        </div>
      </section>

      {/* Tier + balance */}
      <section className="mt-12 grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 bg-espresso p-6 text-ivory sm:p-8 md:p-10 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-sage">Уровень Circle</p>
              <p className="mt-4 font-display text-7xl">{tier.name}</p>
              <p className="mt-2 text-sm text-ivory/70">
                ×{tier.multiplier.toLocaleString("ru-RU")} к баллам за визит · уровень {rank + 1} из {tiers.length}
              </p>
            </div>
            <Button asChild variant="hero-outline" size="sm">
              <Link to="/circle">Привилегии</Link>
            </Button>
          </div>
          <div className="mt-10">
            <TierProgress points={s.earned} tiers={tiers} tone="dark" />
          </div>
          <p className="text-sm text-ivory/80">
            {next
              ? `Накоплено за всё время: ${formatNumber(s.earned)}. До уровня ${next.name} — ${formatNumber(next.threshold - s.earned)} баллов.`
              : "Вы на высшем уровне программы."}
          </p>
        </div>

        <div className="flex min-w-0 flex-col border border-border bg-card p-6 sm:p-8 md:p-10">
          <p className="eyebrow text-accent">Баланс</p>
          <p className="mt-4 font-display text-7xl tabular-nums">{formatNumber(s.points)}</p>
          <p className="mt-1 text-sm text-muted-foreground">баллов можно потратить</p>
          <dl className="mb-8 mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">С октября</dt>
              <dd className="mt-1 font-display text-3xl">+{formatNumber(monthPoints)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Направлений</dt>
              <dd className="mt-1 font-display text-3xl">
                {path.length}/{directions.length}
              </dd>
            </div>
          </dl>
          <Button asChild className="mt-auto w-full" variant="secondary">
            <Link to="/circle" hash="rewards">
              <Gift /> Потратить баллы
            </Link>
          </Button>
        </div>
      </section>

      {/* My journey */}
      <section className="mt-24">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-accent">Мой путь</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Как вы открываете PARMESUN</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Направления в том порядке, в котором вы их попробовали. Пунктиром — следующий шаг, который чаще всего
            выбирают гости с похожим путём.
          </p>
        </div>
        <ol className="mt-10 flex gap-3 overflow-x-auto pb-4">
          {path.map((slug, i) => {
            const d = dirBySlug[slug]!;
            const first = [...s.interactions].reverse().find((x) => x.direction === slug && (x.kind === "visit" || x.kind === "booking"));
            return (
              <li key={slug} className="flex shrink-0 items-center gap-3">
                <Link
                  to="/ecosystem/$slug"
                  params={{ slug }}
                  className="group block w-48 border border-border bg-card p-5 transition-colors hover:border-foreground/40"
                >
                  <span className="eyebrow text-accent">Шаг {String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-4 font-display text-2xl leading-tight">{d.titleRu}</p>
                  <p className="mt-2 text-xs text-muted-foreground">с {first ? formatDate(first.date) : "—"}</p>
                </Link>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </li>
            );
          })}
          {suggestionDir ? (
            <li className="shrink-0">
              <Link
                to="/ecosystem/$slug"
                params={{ slug: suggestionDir.slug }}
                className="block w-56 border border-dashed border-accent bg-secondary/60 p-5 transition-colors hover:bg-secondary"
              >
                <span className="eyebrow text-accent">Следующий шаг</span>
                <p className="mt-4 font-display text-2xl leading-tight">{suggestionDir.titleRu}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  +{Math.round(suggestionDir.pointsPerVisit * tier.multiplier)} баллов за первый визит
                </p>
              </Link>
            </li>
          ) : (
            <li className="flex shrink-0 items-center border border-sage bg-sage-soft/50 p-5 text-sm">
              Вы открыли все направления экосистемы
            </li>
          )}
        </ol>
      </section>

      {/* Offers */}
      <section className="mt-20">
        <h2 className="text-4xl md:text-5xl">Доступные предложения</h2>
        <p className="mt-3 text-sm text-muted-foreground">Подобраны по вашей истории визитов и уровню.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              direction={dirBySlug[o.direction]}
              requiredTier={tiers.find((t) => t.id === o.minTier)}
              locked={tierRank(o.minTier, tiers) > rank}
              activated={s.activatedOffers.includes(o.id)}
              onActivate={() => toggleOffer(o.id, o.direction, o.title)}
            />
          ))}
        </div>
      </section>

      {/* History + recommendations */}
      <section className="mt-24 grid gap-14 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl md:text-5xl">История взаимодействий</h2>
            {anyFilter && (
              <Button variant="link" size="sm" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap gap-2" aria-label="Период">
              {periods.map((p) => (
                <Chip key={p.id} active={period === p.id} onClick={() => { setPeriod(p.id); setLimit(PAGE); }}>
                  {p.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Направление">
              <Chip active={dir === "all"} onClick={() => { setDir("all"); setLimit(PAGE); }}>
                Все направления
              </Chip>
              {directions.map((d) => (
                <Chip key={d.slug} active={dir === d.slug} onClick={() => { setDir(d.slug); setLimit(PAGE); }}>
                  {d.titleRu}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Тип">
              <Chip active={kind === "all"} onClick={() => { setKind("all"); setLimit(PAGE); }}>
                Все типы
              </Chip>
              {kinds.map((k) => (
                <Chip key={k} active={kind === k} onClick={() => { setKind(k); setLimit(PAGE); }}>
                  {kindLabels[k]}
                </Chip>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Найдено: {filtered.length} · начислено +{formatNumber(filteredEarned)} · потрачено −{formatNumber(filteredSpent)}
          </p>

          {filtered.length ? (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {filtered.slice(0, limit).map((v) => (
                <InteractionRow key={v.id} item={v} direction={dirBySlug[v.direction]} />
              ))}
            </ul>
          ) : (
            <div className="mt-4 border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              Ничего не найдено. Попробуйте другой фильтр.
            </div>
          )}
          {filtered.length > limit && (
            <Button variant="outline" className="mt-6" onClick={() => setLimit((l) => l + PAGE)}>
              Показать ещё ({filtered.length - limit})
            </Button>
          )}
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-4xl md:text-5xl">Рекомендуем открыть</h2>
          <p className="mt-3 text-sm text-muted-foreground">Направления, где вы ещё не были.</p>
          {recommendations.length ? (
            <div className="mt-8 grid grid-cols-2 gap-3">
              {recommendations.slice(0, 4).map((d) => (
                <DirectionCard key={d.slug} direction={d} compact />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm">Вы уже побывали во всех направлениях — загляните в Circle за наградами.</p>
          )}
        </div>
      </section>
    </div>
  );
}

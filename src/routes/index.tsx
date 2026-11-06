import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-table.jpg";
import circleImg from "@/assets/circle-still.jpg";
import { directionsQuery, tiersQuery } from "@/services/queries";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { EcosystemOrbit } from "@/components/ecosystem/EcosystemOrbit";
import { DirectionCard } from "@/components/ecosystem/DirectionCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PARMESUN ONE — единая гастрономическая экосистема" },
      {
        name: "description",
        content:
          "Кофейня, мастер-классы, события, кейтеринг, обучение и партнёры PARMESUN — в одной экосистеме с программой лояльности Circle.",
      },
      { property: "og:title", content: "PARMESUN ONE — единая гастрономическая экосистема" },
      {
        property: "og:description",
        content: "Все направления PARMESUN и программа лояльности Circle в одном месте.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
    ]),
  component: HomePage,
});

const benefits = [
  {
    title: "Один профиль",
    text: "Гость узнаётся в кофейне, на мастер-классе и на банкете — без повторных анкет и разрозненных карт.",
  },
  {
    title: "Общие баллы",
    text: "Баллы за утренний кофе можно потратить на ужин с шефом. Ценность растёт с каждым новым направлением.",
  },
  {
    title: "Личные предложения",
    text: "Приглашения формируются по реальным привычкам гостя, а не по общей рассылке.",
  },
  {
    title: "Новые впечатления",
    text: "Экосистема мягко ведёт от знакомого к новому: от кофе — к пасте своими руками, от ужина — к собственному событию.",
  },
];

function HomePage() {
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <img
          src={heroImg}
          alt="Гости за общим столом PARMESUN"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="photo-veil absolute inset-0 -z-10" />
        <div className="container-editorial flex min-h-[88vh] flex-col justify-end pb-16 pt-32 text-on-photo md:pb-24">
          <p className="eyebrow animate-rise text-on-photo/80">Гастрономическая экосистема</p>
          <h1 className="mt-6 max-w-5xl animate-rise text-6xl [animation-delay:120ms] sm:text-7xl md:text-[8.5rem]">
            PARMESUN <em className="font-normal italic">One</em>
          </h1>
          <div className="mt-8 flex animate-rise flex-col gap-8 [animation-delay:240ms] md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-lg leading-relaxed text-on-photo/90">
              Кофейня, кухня, события, обучение и друзья-производители — одна история гостя и одна
              программа лояльности для всего, что мы делаем.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/ecosystem">
                  Открыть экосистему <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/circle">Программа Circle</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section className="container-editorial grid gap-12 py-24 md:grid-cols-12 md:py-36">
        <p className="eyebrow text-accent md:col-span-3">Концепция</p>
        <div className="md:col-span-9">
          <p className="font-display text-3xl leading-[1.2] md:text-5xl">
            Наши гости уже любят PARMESUN — но каждое направление знает их по-своему.{" "}
            <span className="text-accent italic">PARMESUN ONE</span> соединяет кофейню, мастер-классы,
            события и кейтеринг в единый опыт, где каждый визит открывает следующий.
          </p>
          <div className="mt-14 grid gap-10 border-t border-border pt-10 sm:grid-cols-3">
            {[
              ["6", "направлений в одной экосистеме"],
              ["1", "профиль и баланс баллов для гостя"],
              ["3", "уровня программы Circle"],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="font-display text-6xl">{n}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem visual */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="container-editorial grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Карта экосистемы"
              title={
                <>
                  Шесть направлений — <em className="italic">один круг</em>
                </>
              }
              lead="Каждое направление — самостоятельная дверь в PARMESUN. Вместе они образуют путь гостя: от первой чашки кофе до собственного праздника, организованного нашей командой."
            />
            <Button asChild variant="outline" size="lg" className="mt-10">
              <Link to="/ecosystem">
                Все направления <ArrowRight />
              </Link>
            </Button>
          </div>
          <EcosystemOrbit directions={directions} />
        </div>
      </section>

      {/* Directions */}
      <section className="container-editorial py-24 md:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Направления" title="Чем живёт PARMESUN" />
          <Link to="/ecosystem" className="text-sm underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground">
            Подробнее о каждом
          </Link>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {directions.map((d, i) => (
            <DirectionCard key={d.slug} direction={d} index={i} />
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container-editorial py-16 md:py-24">
        <SectionHeading eyebrow="Зачем единая система" title="Что меняется для гостя" />
        <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div key={b.title} className="bg-background p-8">
              <p className="font-display text-5xl text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-8 text-3xl">{b.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Circle CTA */}
      <section className="container-editorial pt-16 md:pt-24">
        <div className="grid overflow-hidden bg-espresso text-ivory md:grid-cols-2">
          <img
            src={circleImg}
            alt="Сервировка PARMESUN"
            loading="lazy"
            width={1280}
            height={1600}
            className="h-72 w-full object-cover md:h-full"
          />
          <div className="flex flex-col justify-center p-8 md:p-16">
            <p className="eyebrow text-sage">Программа лояльности</p>
            <h2 className="mt-6 text-5xl md:text-7xl">
              PARMESUN <em className="italic">Circle</em>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-ivory/80">
              Три уровня — {tiers.map((t) => t.name).join(", ")}. Баллы копятся во всех направлениях,
              а привилегии растут вместе с вашим кругом впечатлений.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/circle">
                  Узнать о Circle <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/dashboard">Демо-кабинет</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

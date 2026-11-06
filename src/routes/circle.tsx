import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import circleImg from "@/assets/circle-still.jpg";
import { directionsQuery, offersQuery, rewardsQuery, tiersQuery } from "@/services/queries";
import { tierForPoints } from "@/lib/loyalty";
import { useSession } from "@/store/session";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { DemoBadge, DemoNotice } from "@/components/brand/DemoBadge";
import { TierCard } from "@/components/loyalty/TierCard";
import { PointsCalculator } from "@/components/loyalty/PointsCalculator";
import { OfferCard } from "@/components/loyalty/OfferCard";
import { LiveCircleCard } from "@/components/loyalty/LiveCircleCard";
import { RewardsCatalog } from "@/components/loyalty/RewardsCatalog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/circle")({
  head: () => ({
    meta: [
      { title: "PARMESUN Circle — единая программа лояльности" },
      {
        name: "description",
        content: "Три уровня Guest, Insider и Circle: баллы во всех направлениях PARMESUN, обмен на награды и персональные привилегии.",
      },
      { property: "og:title", content: "PARMESUN Circle — единая программа лояльности" },
      { property: "og:description", content: "Баллы во всех направлениях PARMESUN, награды и привилегии трёх уровней." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
      context.queryClient.ensureQueryData(offersQuery()),
      context.queryClient.ensureQueryData(rewardsQuery()),
    ]),
  component: CirclePage,
});

const principles = [
  ["Копите везде", "Каждый визит в любом направлении пополняет единый баланс."],
  ["Тратьте где угодно", "Баллы за кофе превращаются в место на гастро-ужине или скидку на кейтеринг."],
  ["Открывайте новое", "Чем больше направлений вы пробуете, тем быстрее растёт уровень."],
];

function CirclePage() {
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const { data: offers } = useSuspenseQuery(offersQuery()).data;
  const { data: rewards } = useSuspenseQuery(rewardsQuery()).data;
  const { earned } = useSession();
  const currentTier = tierForPoints(earned, tiers);

  return (
    <>
      <section className="container-editorial grid items-center gap-12 pb-20 pt-16 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-7">
          <SectionHeading
            as="h1"
            eyebrow="Программа лояльности"
            title={
              <>
                PARMESUN <em className="italic">Circle</em>
              </>
            }
            lead="Одна программа для всей экосистемы. Circle помнит, что вы любите, вознаграждает за любопытство и с каждым уровнем приближает вас к кухне PARMESUN."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#status">
                Мой статус <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#calculator">Рассчитать баллы</a>
            </Button>
          </div>
        </div>
        <div className="md:col-span-5">
          <img
            src={circleImg}
            alt="Десерт с грушей и чашка кофе — приглашение в Circle"
            width={1280}
            height={1600}
            className="aspect-[4/5] w-full object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-editorial grid gap-10 md:grid-cols-3">
          {principles.map(([title, text], i) => (
            <div key={title} className="border-t border-foreground/20 pt-6">
              <p className="eyebrow text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-4 text-4xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="status" className="container-editorial scroll-mt-24 pt-24">
        <SectionHeading
          eyebrow="Интерактивно"
          title="Ваш Circle сейчас"
          lead="Отметьте визит или обменяйте баллы — баланс, уровень и история в кабинете обновятся сразу."
        />
        <div className="mt-12">
          <LiveCircleCard directions={directions} tiers={tiers} />
        </div>
      </section>

      <section className="container-editorial py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Уровни" title="Три уровня близости" />
          <DemoBadge />
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <TierCard key={t.id} tier={t} index={i} highlighted={t.id === "circle"} current={t.id === currentTier.id} />
          ))}
        </div>
      </section>

      <section id="rewards" className="container-editorial scroll-mt-24 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Награды"
            title="На что потратить баллы"
            lead="Награды доступны во всех направлениях. Часть из них открывается только на уровнях Insider и Circle."
          />
          <DemoBadge />
        </div>
        <div className="mt-12">
          <RewardsCatalog rewards={rewards} directions={directions} tiers={tiers} />
        </div>
      </section>

      <section id="calculator" className="container-editorial scroll-mt-24 py-24">
        <SectionHeading
          eyebrow="Накопление бонусов"
          title="Как растёт ваш баланс"
          lead="Выберите, как часто вы бываете в разных направлениях. За каждое дополнительное направление действует бонус +10% — так Circle поощряет открывать экосистему целиком."
        />
        <div className="mt-12">
          <PointsCalculator directions={directions} tiers={tiers} />
        </div>
        <div className="mt-6">
          <DemoNotice>Правила начисления и пороги уровней — демонстрационные и будут утверждены отдельно.</DemoNotice>
        </div>
      </section>

      <section className="container-editorial pb-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Персональные предложения"
            title="Примеры приглашений"
            lead="Предложения подбираются по истории визитов: гостю кофейни — мастер-класс, гостю ужинов — организация собственного события."
          />
          <Button asChild variant="outline">
            <Link to="/dashboard">Активировать в кабинете</Link>
          </Button>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.slice(0, 4).map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              direction={directions.find((d) => d.slug === o.direction)}
              requiredTier={tiers.find((t) => t.id === o.minTier)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

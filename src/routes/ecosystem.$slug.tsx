import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { directionsQuery, findDirection, offersQuery, tiersQuery } from "@/services/queries";
import { Button } from "@/components/ui/button";
import { RequestDialog } from "@/components/ecosystem/RequestDialog";
import { DirectionCard } from "@/components/ecosystem/DirectionCard";
import { OfferCard } from "@/components/loyalty/OfferCard";
import { DemoBadge } from "@/components/brand/DemoBadge";

export const Route = createFileRoute("/ecosystem/$slug")({
  loader: async ({ context, params }) => {
    const [directions] = await Promise.all([
      context.queryClient.ensureQueryData(directionsQuery()),
      context.queryClient.ensureQueryData(offersQuery()),
      context.queryClient.ensureQueryData(tiersQuery()),
    ]);
    const direction = findDirection(directions.data, params.slug);
    if (!direction) throw notFound();
    return { title: direction.title, titleRu: direction.titleRu, description: direction.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.titleRu} — PARMESUN ONE` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} · ${loaderData.titleRu} — PARMESUN` },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Направление недоступно — PARMESUN ONE" }, { name: "robots", content: "noindex" }],
  }),
  component: DirectionPage,
});

function DirectionPage() {
  const { slug } = Route.useParams();
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;
  const { data: offers } = useSuspenseQuery(offersQuery()).data;
  const { data: tiers } = useSuspenseQuery(tiersQuery()).data;
  const direction = findDirection(directions, slug)!;
  const related = offers.filter((o) => o.direction === direction.slug);
  const others = directions.filter((d) => d.slug !== direction.slug).slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={direction.image}
          alt={direction.titleRu}
          width={1024}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="photo-veil absolute inset-0 -z-10" />
        <div className="container-editorial flex min-h-[70vh] flex-col justify-between py-10 text-on-photo md:py-14">
          <Link to="/ecosystem" className="inline-flex w-fit items-center gap-2 text-sm text-on-photo/85 hover:text-on-photo">
            <ArrowLeft className="size-4" /> Все направления
          </Link>
          <div>
            <p className="eyebrow text-on-photo/75">{direction.titleRu}</p>
            <h1 className="mt-5 text-6xl md:text-8xl">{direction.title}</h1>
            <p className="mt-4 font-display text-2xl italic text-on-photo/90 md:text-3xl">{direction.tagline}</p>
          </div>
        </div>
      </section>

      <section className="container-editorial grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <p className="font-display text-3xl leading-snug md:text-4xl">{direction.description}</p>
          <h2 className="eyebrow mt-14 text-accent">Форматы</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {direction.formats.map((f, i) => (
              <li key={f} className="flex items-baseline gap-6 py-5">
                <span className="font-display text-xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="md:col-span-5">
          <div className="sticky top-28 border border-border bg-card p-8">
            <DemoBadge />
            <p className="eyebrow mt-6 text-accent">PARMESUN Circle</p>
            <p className="mt-4 font-display text-6xl">+{direction.pointsPerVisit}</p>
            <p className="mt-1 text-sm text-muted-foreground">баллов за каждый визит или заказ</p>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80">
              Баллы суммируются со всеми направлениями экосистемы и приближают вас к уровням Insider и Circle.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <RequestDialog
                topic={direction.ctaLabel}
                direction={direction.slug}
                trigger={
                  <Button size="lg" className="w-full">
                    {direction.ctaLabel}
                  </Button>
                }
              />
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/circle">Как работают баллы</Link>
              </Button>
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="container-editorial pb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl">Предложения направления</h2>
            <DemoBadge />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <OfferCard key={o.id} offer={o} requiredTier={tiers.find((t) => t.id === o.minTier)} />
            ))}
          </div>
        </section>
      )}

      <section className="container-editorial pt-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-4xl md:text-5xl">Продолжить путь</h2>
          <Link to="/ecosystem" className="hidden items-center gap-2 text-sm sm:inline-flex">
            Вся экосистема <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((d) => (
            <DirectionCard key={d.slug} direction={d} />
          ))}
        </div>
      </section>
    </>
  );
}

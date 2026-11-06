import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { directionsQuery } from "@/services/queries";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecosystem/")({
  head: () => ({
    meta: [
      { title: "Экосистема PARMESUN — шесть направлений" },
      {
        name: "description",
        content: "Кофейня, кулинарные мастер-классы, гастрономия и события, кейтеринг, обучение и партнёрские проекты PARMESUN.",
      },
      { property: "og:title", content: "Экосистема PARMESUN — шесть направлений" },
      { property: "og:description", content: "Все направления PARMESUN на одной странице." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(directionsQuery()),
  component: EcosystemPage,
});

function EcosystemPage() {
  const { data: directions } = useSuspenseQuery(directionsQuery()).data;

  return (
    <>
      <section className="container-editorial pb-16 pt-16 md:pb-24 md:pt-28">
        <SectionHeading
          as="h1"
          eyebrow="Ecosystem"
          title={
            <>
              Экосистема <em className="italic">PARMESUN</em>
            </>
          }
          lead="Шесть направлений, объединённых одной философией: честный продукт, внимательный сервис и общий стол. Баллы Circle начисляются в каждом из них."
        />
        <nav className="mt-12 flex flex-wrap gap-2" aria-label="Направления">
          {directions.map((d) => (
            <a
              key={d.slug}
              href={`#${d.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-foreground"
            >
              {d.titleRu}
            </a>
          ))}
        </nav>
      </section>

      <div className="container-editorial space-y-6 md:space-y-10">
        {directions.map((d, i) => (
          <article
            key={d.slug}
            id={d.slug}
            className={cn(
              "grid scroll-mt-28 overflow-hidden border border-border bg-card md:grid-cols-2",
            )}
          >
            <Link
              to="/ecosystem/$slug"
              params={{ slug: d.slug }}
              className={cn("group block overflow-hidden", i % 2 === 1 && "md:order-2")}
            >
              <img
                src={d.image}
                alt={d.titleRu}
                loading="lazy"
                width={1024}
                height={1280}
                className="aspect-[4/3] h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03] md:aspect-auto md:max-h-[34rem]"
              />
            </Link>
            <div className="flex flex-col justify-center p-8 md:p-14">
              <p className="eyebrow text-accent">
                {String(i + 1).padStart(2, "0")} · {d.titleRu}
              </p>
              <h2 className="mt-5 text-5xl md:text-6xl">{d.title}</h2>
              <p className="mt-3 font-display text-2xl italic text-muted-foreground">{d.tagline}</p>
              <p className="mt-6 leading-relaxed text-foreground/80">{d.description}</p>
              <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {d.formats.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-1 rounded-full bg-accent" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Button asChild size="lg">
                  <Link to="/ecosystem/$slug" params={{ slug: d.slug }}>
                    {d.ctaLabel} <ArrowRight />
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">+{d.pointsPerVisit} баллов Circle за визит*</span>
              </div>
            </div>
          </article>
        ))}
        <p className="text-xs text-muted-foreground">* Демонстрационные значения начисления баллов.</p>
      </div>
    </>
  );
}

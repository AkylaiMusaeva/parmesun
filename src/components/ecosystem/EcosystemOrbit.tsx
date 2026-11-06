import { Link } from "@tanstack/react-router";
import type { Direction } from "@/domain/types";

/** Circular map of the ecosystem: PARMESUN ONE in the centre, directions around it. */
export function EcosystemOrbit({ directions }: { directions: Direction[] }) {
  const n = directions.length;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <div className="absolute inset-[8%] rounded-full border border-foreground/15" />
      <div className="absolute inset-[24%] rounded-full border border-dashed border-foreground/20 animate-orbit" />
      <div className="absolute inset-[36%] flex flex-col items-center justify-center rounded-full bg-espresso text-center text-ivory shadow-soft">
        <span className="font-display text-xl tracking-[0.12em] md:text-2xl">PARMESUN</span>
        <span className="eyebrow mt-1 text-[0.6rem] text-sage">One · Circle</span>
      </div>

      {directions.map((d, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = 42; // % from centre
        const left = 50 + r * Math.cos(angle);
        const top = 50 + r * Math.sin(angle);
        return (
          <Link
            key={d.slug}
            to="/ecosystem/$slug"
            params={{ slug: d.slug }}
            style={{ left: `${left}%`, top: `${top}%` }}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
          >
            <span className="block size-14 overflow-hidden sm:size-16 rounded-full border-2 border-background shadow-soft ring-1 ring-foreground/10 transition-transform duration-500 group-hover:scale-110 md:size-20">
              <img src={d.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </span>
            <span className="max-w-[6.5rem] rounded-xl bg-background/90 px-2 py-0.5 text-center text-[0.65rem] font-medium leading-tight sm:max-w-none sm:whitespace-nowrap sm:rounded-full sm:px-2.5 md:text-xs">
              {d.titleRu}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

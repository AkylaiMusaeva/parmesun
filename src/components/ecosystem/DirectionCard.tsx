import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Direction } from "@/domain/types";
import { cn } from "@/lib/utils";

interface Props {
  direction: Direction;
  index?: number;
  className?: string;
  compact?: boolean;
}

export function DirectionCard({ direction, index, className, compact }: Props) {
  return (
    <Link
      to="/ecosystem/$slug"
      params={{ slug: direction.slug }}
      className={cn("group relative block overflow-hidden bg-secondary", className)}
    >
      <img
        src={direction.image}
        alt={direction.titleRu}
        loading="lazy"
        width={1024}
        height={1280}
        className="aspect-[4/5] h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
      />
      <div className="card-veil absolute inset-0" />
      <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 text-on-photo", compact ? "p-4" : "p-6")}>
        <div>
          {index !== undefined && (
            <p className="eyebrow mb-3 text-on-photo/70">{String(index + 1).padStart(2, "0")}</p>
          )}
          <h3 className={compact ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"}>{direction.title}</h3>
          <p className={cn("mt-1 text-on-photo/80", compact ? "text-xs" : "text-sm")}>{direction.titleRu}</p>
        </div>
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full border border-on-photo/50 transition-all group-hover:bg-on-photo group-hover:text-espresso", compact && "hidden")}>
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

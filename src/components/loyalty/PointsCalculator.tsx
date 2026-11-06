import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Direction, LoyaltyTier } from "@/domain/types";
import { formatNumber } from "@/lib/format";
import { nextTier, tierForPoints } from "@/lib/loyalty";
import { TierProgress } from "./TierProgress";
import { Button } from "@/components/ui/button";

const MONTHS = 6;

/** Interactive demo: how points accumulate when guests use several directions. */
export function PointsCalculator({ directions, tiers }: { directions: Direction[]; tiers: LoyaltyTier[] }) {
  const [visits, setVisits] = useState<Record<string, number>>({ coffee: 4, workshops: 0, events: 1 });

  const monthly = useMemo(
    () => directions.reduce((sum, d) => sum + (visits[d.slug] ?? 0) * d.pointsPerVisit, 0),
    [directions, visits],
  );
  const used = directions.filter((d) => (visits[d.slug] ?? 0) > 0).length;
  // Demo rule: +10% for every additional direction used beyond the first
  const crossBonus = used > 1 ? (used - 1) * 0.1 : 0;
  const total = Math.round(monthly * (1 + crossBonus) * MONTHS);
  const tier = tierForPoints(total, tiers);
  const next = nextTier(total, tiers);

  const change = (slug: string, delta: number) =>
    setVisits((v) => ({ ...v, [slug]: Math.max(0, Math.min(20, (v[slug] ?? 0) + delta)) }));

  return (
    <div className="grid gap-px bg-border lg:grid-cols-[1.1fr_1fr]">
      <div className="bg-card p-6 md:p-10">
        <p className="eyebrow text-accent">Визитов в месяц</p>
        <ul className="mt-6 divide-y divide-border">
          {directions.map((d) => (
            <li key={d.slug} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="font-medium">{d.titleRu}</p>
                <p className="text-xs text-muted-foreground">+{d.pointsPerVisit} баллов за визит</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => change(d.slug, -1)}
                  aria-label={`Меньше визитов: ${d.titleRu}`}
                >
                  <Minus />
                </Button>
                <span className="w-6 text-center font-display text-2xl tabular-nums">{visits[d.slug] ?? 0}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => change(d.slug, 1)}
                  aria-label={`Больше визитов: ${d.titleRu}`}
                >
                  <Plus />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col bg-espresso p-6 text-ivory md:p-10">
        <p className="eyebrow text-sage">Прогноз за {MONTHS} месяцев</p>
        <p className="mt-6 font-display text-7xl tabular-nums md:text-8xl">{formatNumber(total)}</p>
        <p className="mt-2 text-sm text-ivory/70">баллов Circle</p>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-ivory/15 pt-6 text-sm">
          <div>
            <dt className="text-ivory/60">Направлений</dt>
            <dd className="mt-1 font-display text-3xl">{used} из {directions.length}</dd>
          </div>
          <div>
            <dt className="text-ivory/60">Бонус за разнообразие</dt>
            <dd className="mt-1 font-display text-3xl">+{Math.round(crossBonus * 100)}%</dd>
          </div>
        </dl>

        <div className="mt-8">
          <TierProgress points={total} tiers={tiers} tone="dark" />
        </div>

        <p className="mt-auto pt-6 text-sm leading-relaxed text-ivory/80">
          Вы достигнете уровня <strong className="text-sage">{tier.name}</strong>
          {next ? `. До ${next.name} — ещё ${formatNumber(next.threshold - total)} баллов.` : " — высшего в программе."}
        </p>
      </div>
    </div>
  );
}

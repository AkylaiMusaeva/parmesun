import type { LoyaltyTier } from "@/domain/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Horizontal scale of all tiers with a marker for the given balance. */
export function TierProgress({
  points,
  tiers,
  tone = "light",
}: {
  points: number;
  tiers: LoyaltyTier[];
  tone?: "light" | "dark";
}) {
  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  const max = (sorted.at(-1)?.threshold ?? 1) * 1.2;
  const pct = Math.min(100, (points / max) * 100);

  return (
    <div className="pt-8">
      <div className={cn("relative h-1.5 rounded-full", tone === "dark" ? "bg-ivory/15" : "bg-secondary")}>
        <div
          className="bg-tier-gradient absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute -top-8 -translate-x-1/2 transition-[left] duration-700 ease-out"
          style={{ left: `${pct}%` }}
        >
          <span
            className={cn(
              "whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
              tone === "dark" ? "bg-ivory text-espresso" : "bg-espresso text-ivory",
            )}
          >
            {formatNumber(points)}
          </span>
        </div>
        {sorted.map((t) => (
          <span
            key={t.id}
            className={cn(
              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
              points >= t.threshold ? "border-brown bg-brown" : tone === "dark" ? "border-ivory/40 bg-espresso" : "border-border bg-background",
            )}
            style={{ left: `${(t.threshold / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mb-4 mt-4 h-9 text-xs">
        {sorted.map((t, i) => (
          <div
            key={t.id}
            className={cn("absolute", i === 0 ? "translate-x-0" : "-translate-x-1/2", tone === "dark" ? "text-ivory/70" : "text-muted-foreground")}
            style={{ left: `${(t.threshold / max) * 100}%` }}
          >
            <span className="block font-semibold">{t.name}</span>
            <span>{formatNumber(t.threshold)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

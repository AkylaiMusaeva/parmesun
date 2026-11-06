import { Check } from "lucide-react";
import type { LoyaltyTier } from "@/domain/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  tier: LoyaltyTier;
  index: number;
  highlighted?: boolean;
  current?: boolean;
}

export function TierCard({ tier, index, highlighted, current }: Props) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col border p-8 transition-colors md:p-10",
        highlighted ? "border-espresso bg-espresso text-ivory" : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn("eyebrow", highlighted ? "text-sage" : "text-accent")}>
          Уровень {String(index + 1).padStart(2, "0")}
        </span>
        {current && (
          <span className="rounded-full bg-sage px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-espresso">
            Ваш уровень
          </span>
        )}
      </div>
      <h3 className="mt-8 text-6xl">{tier.name}</h3>
      <p className={cn("mt-3 text-sm", highlighted ? "text-ivory/70" : "text-muted-foreground")}>
        {tier.threshold === 0 ? "С первого визита" : `от ${formatNumber(tier.threshold)} баллов`} ·{" "}
        ×{tier.multiplier.toLocaleString("ru-RU")} к баллам
      </p>
      <p className={cn("mt-6 leading-relaxed", highlighted ? "text-ivory/85" : "text-foreground/80")}>
        {tier.summary}
      </p>
      <ul className={cn("mt-8 space-y-3 border-t pt-8 text-sm", highlighted ? "border-ivory/15" : "border-border")}>
        {tier.privileges.map((p) => (
          <li key={p} className="flex gap-3">
            <Check className={cn("mt-0.5 size-4 shrink-0", highlighted ? "text-sage" : "text-accent")} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

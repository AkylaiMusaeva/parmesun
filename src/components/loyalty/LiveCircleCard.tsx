import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Direction, LoyaltyTier } from "@/domain/types";
import { nextTier, tierForPoints } from "@/lib/loyalty";
import { formatNumber } from "@/lib/format";
import { useSession } from "@/store/session";
import { TierProgress } from "./TierProgress";
import { VisitDialog } from "./VisitDialog";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/brand/DemoBadge";

/** Live status of the demo guest: tier, balance, progress and a quick way to earn points. */
export function LiveCircleCard({ directions, tiers }: { directions: Direction[]; tiers: LoyaltyTier[] }) {
  const s = useSession();
  const tier = tierForPoints(s.earned, tiers);
  const next = nextTier(s.earned, tiers);

  return (
    <div className="grid gap-px bg-border lg:grid-cols-[1.4fr_1fr]">
      <div className="bg-espresso p-6 text-ivory sm:p-8 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow text-sage">Ваш статус · Алина</p>
          <DemoBadge />
        </div>
        <p className="mt-4 font-display text-7xl">{tier.name}</p>
        <div className="mt-8">
          <TierProgress points={s.earned} tiers={tiers} tone="dark" />
        </div>
        <p className="text-sm text-ivory/80">
          {next
            ? `До уровня ${next.name} — ${formatNumber(next.threshold - s.earned)} баллов. Уровень растёт от всех накопленных баллов, обмен его не снижает.`
            : "Вы в ближнем круге PARMESUN — все привилегии открыты."}
        </p>
      </div>
      <div className="flex flex-col bg-card p-6 sm:p-8 md:p-10">
        <p className="eyebrow text-accent">Баланс</p>
        <p className="mt-4 font-display text-7xl tabular-nums">{formatNumber(s.points)}</p>
        <p className="mt-1 text-sm text-muted-foreground">баллов можно обменять ниже</p>
        <div className="mt-auto flex flex-wrap gap-3 pt-8">
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
            <Link to="/dashboard">В кабинет</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import type { Direction, DirectionSlug, LoyaltyTier } from "@/domain/types";
import { pointsForVisit, tierForPoints } from "@/lib/loyalty";
import { session, useSession } from "@/store/session";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DemoBadge } from "@/components/brand/DemoBadge";
import { cn } from "@/lib/utils";

interface Props {
  directions: Direction[];
  tiers: LoyaltyTier[];
  trigger: React.ReactNode;
  initial?: DirectionSlug;
}

/** Simulates a visit: the guest picks a direction, sees the points and confirms. Demo only. */
export function VisitDialog({ directions, tiers, trigger, initial }: Props) {
  const { earned } = useSession();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState<DirectionSlug>(initial ?? directions[0]!.slug);
  const tier = tierForPoints(earned, tiers);
  const chosen = directions.find((d) => d.slug === slug)!;
  const pts = pointsForVisit(chosen.pointsPerVisit, tier);

  function confirm() {
    const got = session.addVisit(slug);
    toast.success(`+${got} баллов`, { description: `Визит «${chosen.titleRu}» добавлен в историю (демо).` });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-background sm:max-w-lg">
        <DialogHeader>
          <DemoBadge className="w-fit" />
          <DialogTitle className="font-display text-3xl font-medium">Отметить визит</DialogTitle>
          <DialogDescription>
            В рабочей версии визит фиксируется на кассе автоматически. Здесь можно смоделировать его и увидеть, как
            меняются баланс и уровень.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Направление">
          {directions.map((d) => (
            <button
              key={d.slug}
              type="button"
              role="radio"
              aria-checked={slug === d.slug}
              onClick={() => setSlug(d.slug)}
              className={cn(
                "border px-3 py-3 text-left text-sm transition-colors",
                slug === d.slug ? "border-espresso bg-espresso text-ivory" : "border-border bg-card hover:border-foreground/40",
              )}
            >
              <span className="block font-medium">{d.titleRu}</span>
              <span className={cn("text-xs", slug === d.slug ? "text-ivory/70" : "text-muted-foreground")}>
                {d.pointsPerVisit} баз. баллов
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-end justify-between border-t border-border pt-5">
          <div>
            <p className="eyebrow text-accent">Начислим</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {chosen.pointsPerVisit} × {tier.multiplier.toLocaleString("ru-RU")} (уровень {tier.name})
            </p>
          </div>
          <p className="font-display text-5xl tabular-nums">+{pts}</p>
        </div>
        <DialogFooter>
          <Button onClick={confirm} className="w-full sm:w-auto">
            Подтвердить визит
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Lock, Sparkles } from "lucide-react";
import type { Direction, LoyaltyTier, Offer } from "@/domain/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  offer: Offer;
  direction?: Direction | undefined;
  requiredTier?: LoyaltyTier | undefined;
  locked?: boolean;
  activated?: boolean;
  onActivate?: () => void;
}

export function OfferCard({ offer, direction, requiredTier, locked, activated, onActivate }: Props) {
  return (
    <article className={cn("flex h-full flex-col border border-border bg-card", locked && "opacity-75")}>
      {direction && (
        <div className="relative h-36 overflow-hidden">
          <img src={direction.image} alt="" loading="lazy" className="h-full w-full object-cover" />
          <div className="card-veil absolute inset-0" />
          <span className="absolute bottom-3 left-4 eyebrow text-on-photo">{direction.titleRu}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {offer.reason && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-accent">
            <Sparkles className="size-3.5" /> {offer.reason}
          </p>
        )}
        <h3 className="text-2xl leading-tight">{offer.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="text-xs text-muted-foreground">до {formatDate(offer.validUntil)}</span>
          {onActivate &&
            (locked ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" /> С уровня {requiredTier?.name}
              </span>
            ) : (
              <Button size="sm" variant={activated ? "sage" : "default"} onClick={onActivate}>
                {activated ? "Активировано ✓" : "Активировать"}
              </Button>
            ))}
          {!onActivate && requiredTier && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{requiredTier.name}+</span>
          )}
        </div>
      </div>
    </article>
  );
}

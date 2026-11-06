import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { demoTiers } from "@/data/demo/loyalty";
import { session, useSession } from "@/store/session";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/brand/DemoBadge";

/** Celebrates a tier upgrade triggered by any demo action. Mounted once in the root layout. */
export function TierUpDialog() {
  const { tierUp } = useSession();
  const tier = demoTiers.find((t) => t.id === tierUp);

  return (
    <Dialog open={!!tier} onOpenChange={(o) => !o && session.clearTierUp()}>
      <DialogContent className="border-none bg-espresso p-0 text-ivory sm:max-w-lg">
        {tier && (
          <div className="p-8 md:p-10">
            <DialogHeader className="text-left">
              <DemoBadge className="w-fit" />
              <p className="eyebrow mt-6 flex items-center gap-2 text-sage">
                <Sparkles className="size-4" /> Новый уровень
              </p>
              <DialogTitle className="mt-3 font-display text-6xl font-medium text-ivory">{tier.name}</DialogTitle>
              <DialogDescription className="text-ivory/75">
                Поздравляем! Теперь каждый визит приносит ×{tier.multiplier.toLocaleString("ru-RU")} баллов, а вам
                открылись новые привилегии.
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-8 space-y-2 border-t border-ivory/15 pt-6 text-sm text-ivory/85">
              {tier.privileges.map((p) => (
                <li key={p}>— {p}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" onClick={() => session.clearTierUp()}>
                <Link to="/circle" hash="rewards">
                  Смотреть награды
                </Link>
              </Button>
              <Button variant="hero-outline" onClick={() => session.clearTierUp()}>
                Отлично
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

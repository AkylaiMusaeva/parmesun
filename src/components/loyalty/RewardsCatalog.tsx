import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Direction, DirectionSlug, LoyaltyTier, Reward } from "@/domain/types";
import { canRedeem } from "@/lib/loyalty";
import { formatNumber } from "@/lib/format";
import { session, useSession } from "@/store/session";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Props {
  rewards: Reward[];
  directions: Direction[];
  tiers: LoyaltyTier[];
}

/** Rewards the demo guest can exchange points for, with live balance and tier checks. */
export function RewardsCatalog({ rewards, directions, tiers }: Props) {
  const s = useSession();
  const [dir, setDir] = useState<DirectionSlug | "all">("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [pending, setPending] = useState<Reward | null>(null);
  const dirBySlug = Object.fromEntries(directions.map((d) => [d.slug, d]));
  const usedDirs = directions.filter((d) => rewards.some((r) => r.direction === d.slug));

  const list = rewards.filter(
    (r) => (dir === "all" || r.direction === dir) && (!onlyAvailable || canRedeem(r, s.points, s.earned, tiers).ok),
  );

  function confirm() {
    if (!pending) return;
    const res = session.redeem(pending);
    if (res.ok) {
      toast.success("Баллы обменяны", {
        description: `${pending.title}: −${formatNumber(pending.cost)} баллов. Покажите код в кабинете на месте (демо).`,
      });
    }
    setPending(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {[{ slug: "all" as const, titleRu: "Все" }, ...usedDirs].map((d) => (
          <button
            key={d.slug}
            type="button"
            aria-pressed={dir === d.slug}
            onClick={() => setDir(d.slug)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              dir === d.slug ? "border-espresso bg-espresso text-ivory" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {d.titleRu}
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="size-4 accent-[var(--brown)]"
          />
          Только доступные мне
        </label>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => {
          const check = canRedeem(r, s.points, s.earned, tiers);
          const times = s.redeemedRewards.filter((x) => x === r.id).length;
          const tierName = tiers.find((t) => t.id === r.minTier)?.name;
          return (
            <article key={r.id} className="flex flex-col border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="eyebrow text-accent">{dirBySlug[r.direction]?.titleRu}</span>
                {times > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.65rem] font-semibold text-demo-foreground">
                    <Check className="size-3" /> Обменяно{times > 1 ? ` ×${times}` : ""}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-2xl leading-tight">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                <p>
                  <span className="font-display text-3xl tabular-nums">{formatNumber(r.cost)}</span>
                  <span className="ml-1 text-xs text-muted-foreground">баллов</span>
                </p>
                {check.ok ? (
                  <Button size="sm" onClick={() => setPending(r)}>
                    Обменять
                  </Button>
                ) : check.reason === "tier" ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Lock className="size-3.5" /> С уровня {tierName}
                  </span>
                ) : (
                  <span className="text-right text-xs text-muted-foreground">
                    Не хватает
                    <br />
                    {formatNumber(r.cost - s.points)}
                  </span>
                )}
              </div>
            </article>
          );
        })}
        {!list.length && (
          <p className="border border-dashed border-border p-8 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            Сейчас нет наград по этому фильтру. Отметьте визит в кабинете, чтобы накопить баллы.
          </p>
        )}
      </div>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-3xl font-medium">{pending?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Спишем {formatNumber(pending?.cost ?? 0)} баллов. После обмена останется{" "}
              {formatNumber(s.points - (pending?.cost ?? 0))}. Демо-режим: настоящие баллы не списываются.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Отмена</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={confirm}>
              Обменять
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

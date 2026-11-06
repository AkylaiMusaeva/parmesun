import type { LoyaltyTier, Reward, TierId } from "@/domain/types";

const sortTiers = (tiers: LoyaltyTier[]) => [...tiers].sort((a, b) => a.threshold - b.threshold);

/** Highest tier whose threshold the lifetime earned points have reached. */
export function tierForPoints(earned: number, tiers: LoyaltyTier[]): LoyaltyTier {
  const sorted = sortTiers(tiers);
  let current = sorted[0];
  if (!current) throw new Error("No loyalty tiers configured");
  for (const tier of sorted) if (earned >= tier.threshold) current = tier;
  return current;
}

export function nextTier(earned: number, tiers: LoyaltyTier[]): LoyaltyTier | null {
  return sortTiers(tiers).find((t) => t.threshold > earned) ?? null;
}

/** Progress 0..100 from current tier threshold to the next one. 100 when at top tier. */
export function progressToNext(earned: number, tiers: LoyaltyTier[]): number {
  const current = tierForPoints(earned, tiers);
  const next = nextTier(earned, tiers);
  if (!next) return 100;
  const span = next.threshold - current.threshold;
  return Math.min(100, Math.max(0, ((earned - current.threshold) / span) * 100));
}

export function tierRank(id: TierId, tiers: LoyaltyTier[]): number {
  return sortTiers(tiers).findIndex((t) => t.id === id);
}

/** Points for one visit: base points of the direction × tier multiplier, rounded. */
export function pointsForVisit(base: number, tier: LoyaltyTier): number {
  return Math.round(base * tier.multiplier);
}

export type RedeemCheck = { ok: true } | { ok: false; reason: "tier" | "balance" };

/** A reward can be redeemed when the tier is high enough and the balance covers the cost. */
export function canRedeem(reward: Reward, balance: number, earned: number, tiers: LoyaltyTier[]): RedeemCheck {
  const tier = tierForPoints(earned, tiers);
  if (tierRank(tier.id, tiers) < tierRank(reward.minTier, tiers)) return { ok: false, reason: "tier" };
  if (balance < reward.cost) return { ok: false, reason: "balance" };
  return { ok: true };
}

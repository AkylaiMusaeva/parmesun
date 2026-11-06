import { describe, expect, it } from "vitest";
import { nextTier, progressToNext, tierForPoints } from "@/lib/loyalty";
import { demoTiers } from "@/data/demo/loyalty";

describe("loyalty tiers", () => {
  it("a new guest starts at Guest", () => {
    expect(tierForPoints(0, demoTiers).id).toBe("guest");
  });

  it("reaching a threshold unlocks the tier", () => {
    expect(tierForPoints(1500, demoTiers).id).toBe("insider");
    expect(tierForPoints(1499, demoTiers).id).toBe("guest");
  });

  it("top tier has no next tier and full progress", () => {
    expect(nextTier(9000, demoTiers)).toBeNull();
    expect(progressToNext(9000, demoTiers)).toBe(100);
  });

  it("progress is measured between current and next threshold", () => {
    expect(progressToNext(3250, demoTiers)).toBe(50);
  });
});

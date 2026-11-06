import type { ConciergeScenario } from "@/domain/types";

/** Picks the scenario whose keywords best match free-text input; null if nothing matches. */
export function matchScenario(text: string, scenarios: ConciergeScenario[]): ConciergeScenario | null {
  const q = text.toLowerCase();
  let best: ConciergeScenario | null = null;
  let score = 0;
  for (const s of scenarios) {
    const hits = s.keywords.filter((k) => q.includes(k)).length;
    if (hits > score) {
      score = hits;
      best = s;
    }
  }
  return best;
}

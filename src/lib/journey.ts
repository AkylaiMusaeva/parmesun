import type { ClientRecord, DirectionSlug, Interaction } from "@/domain/types";

/** Directions in the order the guest first used them (visits and bookings). */
export function directionPath(interactions: Interaction[]): DirectionSlug[] {
  const sorted = [...interactions].sort((a, b) => a.date.localeCompare(b.date));
  const seen: DirectionSlug[] = [];
  for (const i of sorted) {
    if ((i.kind === "visit" || i.kind === "booking") && !seen.includes(i.direction)) seen.push(i.direction);
  }
  return seen;
}

export interface Transition {
  from: DirectionSlug;
  to: DirectionSlug;
  count: number;
  clients: string[];
}

/**
 * Transitions between consecutive directions in each client's path.
 * step = 1 → first→second, 2 → second→third; step = "all" → every consecutive pair.
 */
export function transitions(clients: ClientRecord[], step: number | "all" = "all"): Transition[] {
  const map = new Map<string, Transition>();
  for (const c of clients) {
    const path = directionPath(c.interactions);
    const pairs: [DirectionSlug, DirectionSlug][] = [];
    if (step === "all") for (let i = 1; i < path.length; i++) pairs.push([path[i - 1]!, path[i]!]);
    else if (path.length > step) pairs.push([path[step - 1]!, path[step]!]);
    for (const [from, to] of pairs) {
      const key = `${from}>${to}`;
      const t = map.get(key) ?? { from, to, count: 0, clients: [] };
      t.count += 1;
      t.clients.push(c.id);
      map.set(key, t);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Share of clients (0..1) who used at least `min` directions. */
export function crossUsageShare(clients: ClientRecord[], min = 2): number {
  if (!clients.length) return 0;
  return clients.filter((c) => directionPath(c.interactions).length >= min).length / clients.length;
}

/** Distribution of path length: index 0 = 1 direction, ... index 4 = 5+ directions. */
export function breadthFunnel(clients: ClientRecord[]): number[] {
  const out = [0, 0, 0, 0, 0];
  for (const c of clients) {
    const n = directionPath(c.interactions).length;
    for (let i = 0; i < Math.min(n, 5); i++) out[i]! += 1;
  }
  return out;
}

/** Most common next direction after `last`, excluding already visited ones. */
export function nextBestDirection(
  path: DirectionSlug[],
  base: ClientRecord[],
  all: DirectionSlug[],
): DirectionSlug | null {
  const remaining = all.filter((d) => !path.includes(d));
  if (!remaining.length) return null;
  const last = path[path.length - 1];
  if (!last) return remaining[0]!;
  const counts = new Map<DirectionSlug, number>();
  for (const t of transitions(base, "all")) {
    if (t.from === last && remaining.includes(t.to)) counts.set(t.to, (counts.get(t.to) ?? 0) + t.count);
  }
  let best: DirectionSlug = remaining[0]!;
  let max = -1;
  for (const d of remaining) {
    const c = counts.get(d) ?? 0;
    if (c > max) {
      max = c;
      best = d;
    }
  }
  return best;
}

/** Keep only interactions newer than `days` before `ref`; drop clients with nothing left. */
export function withinPeriod(clients: ClientRecord[], days: number | null, ref: string): ClientRecord[] {
  if (days === null) return clients;
  const from = new Date(ref).getTime() - days * 86_400_000;
  return clients
    .map((c) => ({ ...c, interactions: c.interactions.filter((i) => new Date(i.date).getTime() >= from) }))
    .filter((c) => c.interactions.length > 0);
}

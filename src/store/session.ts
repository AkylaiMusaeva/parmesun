/**
 * DEMO SESSION — client-side state for the prototype's interactive actions
 * (visits, bookings, rewards, offers, concierge requests).
 * Persisted to localStorage only; nothing leaves the browser.
 * In production these actions become server mutations with the same shapes.
 */
import { useSyncExternalStore } from "react";
import type { ClientRecord, DirectionSlug, Interaction, InteractionKind, LoyaltyTier, Reward } from "@/domain/types";
import { demoCustomer } from "@/data/demo/customer";
import { demoTiers } from "@/data/demo/loyalty";
import { demoDirections } from "@/data/demo/directions";
import { canRedeem, pointsForVisit, tierForPoints, tierRank } from "@/lib/loyalty";

export interface SessionState {
  points: number;
  earned: number;
  interactions: Interaction[]; // newest first
  activatedOffers: string[];
  redeemedRewards: string[];
  /** Set when an action lifts the guest to a higher tier; cleared by the UI */
  tierUp: LoyaltyTier["id"] | null;
}

const KEY = "parmesun-one-demo-session-v1";
const TODAY = "2026-11-01";

const initial: SessionState = {
  points: demoCustomer.points,
  earned: demoCustomer.earned,
  interactions: demoCustomer.interactions,
  activatedOffers: [],
  redeemedRewards: [],
  tierUp: null,
};

let state: SessionState = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...(JSON.parse(raw) as SessionState), tierUp: null };
  } catch {
    state = initial;
  }
}

function set(next: SessionState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...next, tierUp: null }));
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

let seq = 0;
function interaction(kind: InteractionKind, direction: DirectionSlug, title: string, points: number): Interaction {
  seq += 1;
  return { id: `s-${Date.now()}-${seq}`, date: TODAY, direction, kind, title, points };
}

function withEarned(extra: number, item: Interaction): SessionState {
  const before = tierForPoints(state.earned, demoTiers);
  const earned = state.earned + extra;
  const after = tierForPoints(earned, demoTiers);
  return {
    ...state,
    earned,
    points: state.points + extra,
    interactions: [item, ...state.interactions],
    tierUp: tierRank(after.id, demoTiers) > tierRank(before.id, demoTiers) ? after.id : state.tierUp,
  };
}

export const session = {
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => {
    load();
    return state;
  },
  getServer: () => initial,

  addVisit(direction: DirectionSlug, title?: string) {
    const d = demoDirections.find((x) => x.slug === direction)!;
    const pts = pointsForVisit(d.pointsPerVisit, tierForPoints(state.earned, demoTiers));
    set(withEarned(pts, interaction("visit", direction, title ?? `Визит: ${d.titleRu}`, pts)));
    return pts;
  },
  addBooking(direction: DirectionSlug, title: string) {
    set({ ...state, interactions: [interaction("booking", direction, title, 0), ...state.interactions] });
  },
  addRequest(direction: DirectionSlug, title: string) {
    set({ ...state, interactions: [interaction("request", direction, title, 0), ...state.interactions] });
  },
  addConcierge(direction: DirectionSlug, title: string) {
    set({ ...state, interactions: [interaction("concierge", direction, title, 0), ...state.interactions] });
  },
  redeem(reward: Reward) {
    const check = canRedeem(reward, state.points, state.earned, demoTiers);
    if (!check.ok) return check;
    set({
      ...state,
      points: state.points - reward.cost,
      redeemedRewards: [...state.redeemedRewards, reward.id],
      interactions: [interaction("reward", reward.direction, `Обмен: ${reward.title}`, -reward.cost), ...state.interactions],
    });
    return check;
  },
  toggleOffer(id: string, direction: DirectionSlug, title: string) {
    const on = state.activatedOffers.includes(id);
    set({
      ...state,
      activatedOffers: on ? state.activatedOffers.filter((x) => x !== id) : [...state.activatedOffers, id],
      interactions: on ? state.interactions : [interaction("offer", direction, `Активировано: ${title}`, 0), ...state.interactions],
    });
    return !on;
  },
  clearTierUp() {
    set({ ...state, tierUp: null });
  },
  reset() {
    set(initial);
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(session.subscribe, session.get, session.getServer);
}

export const DEMO_TODAY = TODAY;

/** The demo guest as seen by the business interface — so guest actions show up for the team. */
export function sessionAsClient(s: SessionState): ClientRecord {
  return {
    id: demoCustomer.id,
    name: `${demoCustomer.firstName} ${demoCustomer.lastName.charAt(0)}.`,
    city: "Бишкек",
    joined: demoCustomer.memberSince,
    earned: s.earned,
    points: s.points,
    interactions: [...s.interactions].sort((a, b) => a.date.localeCompare(b.date)),
    consent: true,
  };
}

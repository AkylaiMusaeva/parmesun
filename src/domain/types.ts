/**
 * Core domain model for PARMESUN ONE.
 * Data sources (demo now, real API later) must return these shapes,
 * so pages never depend on where the data comes from.
 */

export type DirectionSlug =
  | "coffee"
  | "workshops"
  | "events"
  | "catering"
  | "education"
  | "partnerships";

export interface Direction {
  slug: DirectionSlug;
  title: string;
  titleRu: string;
  tagline: string;
  description: string;
  formats: string[];
  /** Demo: points a guest receives for one visit / order in this direction */
  pointsPerVisit: number;
  ctaLabel: string;
  image: string;
}

export type TierId = "guest" | "insider" | "circle";

export interface LoyaltyTier {
  id: TierId;
  name: string;
  /** Lifetime earned points needed to reach this tier */
  threshold: number;
  /** Multiplier applied to base visit points */
  multiplier: number;
  summary: string;
  privileges: string[];
}

export type InteractionKind = "visit" | "booking" | "offer" | "reward" | "concierge" | "request";

export interface Interaction {
  id: string;
  date: string; // ISO
  direction: DirectionSlug;
  kind: InteractionKind;
  title: string;
  /** Positive = earned, negative = spent, 0 = no points */
  points: number;
}

/** @deprecated kept for compatibility — use Interaction with kind "visit" */
export type Visit = Interaction;

export interface Offer {
  id: string;
  direction: DirectionSlug;
  title: string;
  description: string;
  validUntil: string; // ISO
  minTier: TierId;
  /** Why this offer is shown — reserved for future segmentation / AI */
  reason?: string;
}

export interface Reward {
  id: string;
  direction: DirectionSlug;
  title: string;
  description: string;
  cost: number;
  minTier: TierId;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  memberSince: string; // ISO
  /** Spendable balance */
  points: number;
  /** Lifetime earned points — defines the tier */
  earned: number;
  interactions: Interaction[];
  favoriteDirections: DirectionSlug[];
}

/** Lightweight customer record for the business interface */
export interface ClientRecord {
  id: string;
  name: string;
  city: string;
  joined: string; // ISO
  earned: number;
  points: number;
  /** Chronological interactions, oldest first */
  interactions: Interaction[];
  consent: boolean;
}

export interface ConciergeOption {
  label: string;
  next: string; // step id
}

export interface ConciergeSuggestion {
  direction: DirectionSlug;
  title: string;
  description: string;
  points: number;
  actionLabel: string;
}

export interface ConciergeStep {
  id: string;
  message: string;
  options?: ConciergeOption[];
  suggestions?: ConciergeSuggestion[];
}

export interface ConciergeScenario {
  id: string;
  title: string;
  prompt: string;
  keywords: string[];
  start: string;
  steps: Record<string, ConciergeStep>;
}

/** Every payload carries its origin so UI can mark demo content explicitly. */
export type DataSource = "demo" | "live";

export interface Sourced<T> {
  source: DataSource;
  data: T;
}

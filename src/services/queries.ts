/**
 * Data access layer. Pages read data ONLY through these query options.
 * Today every source is demo data; to go live, swap a queryFn for a
 * server function (createServerFn) returning the same Sourced<T> shape.
 */
import { queryOptions } from "@tanstack/react-query";
import type {
  ClientRecord,
  ConciergeScenario,
  Customer,
  Direction,
  LoyaltyTier,
  Offer,
  Reward,
  Sourced,
} from "@/domain/types";
import { demoDirections } from "@/data/demo/directions";
import { demoOffers, demoRewards, demoTiers } from "@/data/demo/loyalty";
import { demoCustomer } from "@/data/demo/customer";
import { demoClients } from "@/data/demo/business";
import { demoScenarios } from "@/data/demo/concierge";

const demo = <T,>(data: T): Sourced<T> => ({ source: "demo", data });

export const directionsQuery = () =>
  queryOptions({
    queryKey: ["directions"],
    queryFn: async (): Promise<Sourced<Direction[]>> => demo(demoDirections),
    staleTime: Infinity,
  });

export const tiersQuery = () =>
  queryOptions({
    queryKey: ["loyalty", "tiers"],
    queryFn: async (): Promise<Sourced<LoyaltyTier[]>> => demo(demoTiers),
    staleTime: Infinity,
  });

export const offersQuery = () =>
  queryOptions({
    queryKey: ["loyalty", "offers"],
    queryFn: async (): Promise<Sourced<Offer[]>> => demo(demoOffers),
    staleTime: Infinity,
  });

export const rewardsQuery = () =>
  queryOptions({
    queryKey: ["loyalty", "rewards"],
    queryFn: async (): Promise<Sourced<Reward[]>> => demo(demoRewards),
    staleTime: Infinity,
  });

export const currentCustomerQuery = () =>
  queryOptions({
    queryKey: ["customer", "current"],
    queryFn: async (): Promise<Sourced<Customer>> => demo(demoCustomer),
    staleTime: Infinity,
  });

export const clientsQuery = () =>
  queryOptions({
    queryKey: ["business", "clients"],
    queryFn: async (): Promise<Sourced<ClientRecord[]>> => demo(demoClients),
    staleTime: Infinity,
  });

export const conciergeScenariosQuery = () =>
  queryOptions({
    queryKey: ["concierge", "scenarios"],
    queryFn: async (): Promise<Sourced<ConciergeScenario[]>> => demo(demoScenarios),
    staleTime: Infinity,
  });

export function findDirection(list: Direction[], slug: string) {
  return list.find((d) => d.slug === slug);
}

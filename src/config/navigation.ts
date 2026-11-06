/**
 * Product modules registry. Navigation for each interface mode is derived from here.
 * "planned" modules are reserved for upcoming stages so new sections plug in
 * without reworking the layout.
 */
/** Only paths that have a route file. Add new paths here together with their route. */
export type AppPath =
  | "/"
  | "/ecosystem"
  | "/circle"
  | "/concierge"
  | "/dashboard";

export type InterfaceMode = "client" | "business";

export interface ProductModule {
  id: string;
  label: string;
  to?: AppPath;
  status: "live" | "planned";
  mode: InterfaceMode;
}

export const productModules: ProductModule[] = [
  { id: "ecosystem", label: "Экосистема", to: "/ecosystem", status: "live", mode: "client" },
  { id: "circle", label: "Circle", to: "/circle", status: "live", mode: "client" },
  { id: "concierge", label: "AI Консьерж", to: "/concierge", status: "live", mode: "client" },
  { id: "dashboard", label: "Кабинет", to: "/dashboard", status: "live", mode: "client" },
  { id: "overview", label: "Обзор", status: "planned", mode: "business" },
  { id: "journey", label: "Customer Journey", status: "planned", mode: "business" },
  { id: "clients", label: "Клиенты", status: "planned", mode: "business" },
  { id: "segments", label: "Сегменты", status: "planned", mode: "business" },
  { id: "campaigns", label: "Кампании", status: "planned", mode: "business" },
];

type LiveModule = ProductModule & { to: AppPath };

export const navFor = (mode: InterfaceMode): LiveModule[] =>
  productModules.filter((m): m is LiveModule => m.status === "live" && m.mode === mode && !!m.to);

export const plannedFor = (mode: InterfaceMode) =>
  productModules.filter((m) => m.status === "planned" && m.mode === mode);

/** Backwards-compatible client navigation */
export const mainNav = navFor("client");
export const plannedModules = productModules.filter((m) => m.status === "planned");

export const modeFromPath = (pathname: string): InterfaceMode =>
  pathname.startsWith("/business") ? "business" : "client";

/** Where the interface switch leads for each mode */
export const modeHome: Partial<Record<InterfaceMode, AppPath>> = { client: "/dashboard" };

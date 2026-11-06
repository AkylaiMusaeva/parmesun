/**
 * DEMO DATA — synthetic client base for the business interface.
 * Generated deterministically (fixed seed) so numbers are stable between reloads.
 * Names are fictional; no real customer data.
 */
import type { ClientRecord, DirectionSlug, Interaction } from "@/domain/types";
import { demoDirections } from "./directions";

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstNames = [
  "Айгерим", "Тимур", "Елена", "Нурлан", "Мадина", "Арслан", "Дарья", "Бекзат", "Камила", "Эмиль",
  "София", "Данияр", "Алия", "Руслан", "Виктория", "Азамат", "Жанна", "Илья", "Асель", "Марат",
  "Ксения", "Эрлан", "Диана", "Самат", "Анна", "Чынгыз", "Медина", "Артём", "Бермет", "Олжас",
  "Наргиза", "Максим", "Айдана", "Кирилл", "Зарина", "Адилет", "Полина", "Улан", "Сабина", "Алмаз",
];
const lastInitials = "АБВГДЕЖЗИКЛМНОПРСТУЧ";
const cities = ["Бишкек", "Бишкек", "Бишкек", "Алматы", "Ош", "Бишкек"];

/** Likely next direction from a given one — mirrors the intended cross-sell paths. */
const affinity: Record<DirectionSlug, Partial<Record<DirectionSlug, number>>> = {
  coffee: { workshops: 5, events: 3, education: 2, partnerships: 2, catering: 1 },
  workshops: { events: 4, education: 3, coffee: 2, partnerships: 2, catering: 1 },
  events: { catering: 5, workshops: 2, partnerships: 2, coffee: 2, education: 1 },
  catering: { events: 4, coffee: 2, partnerships: 1, workshops: 1, education: 1 },
  education: { workshops: 3, coffee: 2, events: 2, partnerships: 2, catering: 1 },
  partnerships: { events: 3, workshops: 3, coffee: 2, catering: 1, education: 1 },
};
const entryWeights: Record<DirectionSlug, number> = {
  coffee: 12, events: 6, catering: 4, workshops: 4, education: 2, partnerships: 1,
};

function pick<T extends string>(weights: Partial<Record<T, number>>, r: () => number, exclude: Set<T>): T | null {
  const entries = (Object.entries(weights) as [T, number][]).filter(([k]) => !exclude.has(k));
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (!total) return null;
  let x = r() * total;
  for (const [k, w] of entries) {
    x -= w;
    if (x <= 0) return k;
  }
  return entries[entries.length - 1]![0];
}

const visitTitles: Record<DirectionSlug, string[]> = {
  coffee: ["Утренний кофе", "Завтрак", "Кофейная дегустация", "Кофе с собой"],
  workshops: ["Мастер-класс «Паста фреска»", "Мастер-класс по десертам", "Мастер-класс для двоих"],
  events: ["Гастро-ужин с шефом", "Сезонный сет", "Частный ужин"],
  catering: ["Кофе-брейк для офиса", "Домашний приём", "Банкет"],
  education: ["Курс бариста", "Лекция о продукте", "Школа сервиса"],
  partnerships: ["Фермерский маркет", "Ужин на ферме", "Коллаборация с брендом"],
};

const REF = new Date("2026-11-01").getTime();
const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

function generate(): ClientRecord[] {
  const r = rng(20261101);
  const pts = Object.fromEntries(demoDirections.map((d) => [d.slug, d.pointsPerVisit])) as Record<DirectionSlug, number>;

  return firstNames.map((first, i) => {
    const joinedDaysAgo = 30 + Math.floor(r() * 520);
    const joined = REF - joinedDaysAgo * DAY;
    const breadth = 1 + Math.floor(Math.pow(r(), 1.4) * 5); // 1..5 directions, skewed low
    const used = new Set<DirectionSlug>();
    const path: DirectionSlug[] = [];
    let cur = pick(entryWeights, r, used)!;
    for (let k = 0; k < breadth && cur; k++) {
      path.push(cur);
      used.add(cur);
      cur = pick(affinity[cur], r, used) as DirectionSlug;
    }

    const interactions: Interaction[] = [];
    let t = joined;
    path.forEach((dir, step) => {
      const repeats = dir === "coffee" ? 2 + Math.floor(r() * 6) : 1 + Math.floor(r() * 3);
      for (let k = 0; k < repeats; k++) {
        t += (3 + Math.floor(r() * (joinedDaysAgo / (breadth * 3 + 1)))) * DAY;
        if (t > REF - DAY) t = REF - Math.floor(r() * 20 + 1) * DAY;
        const titles = visitTitles[dir];
        interactions.push({
          id: `c${i}-${step}-${k}`,
          date: iso(t),
          direction: dir,
          kind: "visit",
          title: titles[Math.floor(r() * titles.length)]!,
          points: pts[dir],
        });
      }
    });
    interactions.sort((a, b) => a.date.localeCompare(b.date));
    const earned = interactions.reduce((s, x) => s + Math.max(0, x.points), 0);
    const spent = Math.floor((r() * earned) / 3 / 100) * 100;

    return {
      id: `cl-${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${lastInitials[Math.floor(r() * lastInitials.length)]}.`,
      city: cities[Math.floor(r() * cities.length)]!,
      joined: iso(joined),
      earned,
      points: earned - spent,
      interactions,
      consent: r() > 0.2,
    };
  });
}

export const demoClients: ClientRecord[] = generate();
export const DEMO_REFERENCE_DATE = "2026-11-01";

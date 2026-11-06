/**
 * DEMO DATA — a fictional customer for the dashboard prototype.
 * Not a real person; no personal data is stored or transmitted.
 */
import type { Customer } from "@/domain/types";

export const demoCustomer: Customer = {
  id: "demo-0001",
  firstName: "Алина",
  lastName: "Садыкова",
  memberSince: "2025-03-14",
  points: 2440,
  earned: 2840,
  favoriteDirections: ["coffee", "events"],
  interactions: [
    { id: "i-12", date: "2026-10-30", direction: "events", kind: "concierge", title: "Запрос консьержу: ужин на годовщину", points: 0 },
    { id: "i-11", date: "2026-10-28", direction: "coffee", kind: "visit", title: "Флэт уайт и круассан", points: 40 },
    { id: "i-10", date: "2026-10-24", direction: "events", kind: "visit", title: "Гастро-ужин «Осенний урожай»", points: 400 },
    { id: "i-9", date: "2026-10-22", direction: "coffee", kind: "reward", title: "Обмен: десерт от шеф-кондитера", points: -400 },
    { id: "i-8", date: "2026-10-19", direction: "coffee", kind: "visit", title: "Кофейная дегустация: Эфиопия", points: 60 },
    { id: "i-7", date: "2026-10-15", direction: "events", kind: "booking", title: "Бронь: гастро-ужин 24 октября", points: 0 },
    { id: "i-6", date: "2026-10-11", direction: "partnerships", kind: "visit", title: "Фермерский маркет PARMESUN", points: 150 },
    { id: "i-5", date: "2026-10-03", direction: "coffee", kind: "visit", title: "Завтрак с подругой", points: 40 },
    { id: "i-4", date: "2026-09-20", direction: "events", kind: "visit", title: "Частный ужин на день рождения", points: 900 },
    { id: "i-3", date: "2026-09-12", direction: "events", kind: "request", title: "Заявка: частный ужин на 12 гостей", points: 0 },
    { id: "i-2", date: "2026-09-08", direction: "coffee", kind: "visit", title: "Капучино на вынос", points: 40 },
    { id: "i-1", date: "2025-03-14", direction: "coffee", kind: "visit", title: "Итог визитов: март 2025 — август 2026", points: 1210 },
  ],
};

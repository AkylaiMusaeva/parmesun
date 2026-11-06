/**
 * DEMO DATA — illustrative loyalty programme parameters.
 * Thresholds and rates are placeholders until the business sets real rules.
 */
import type { LoyaltyTier, Offer, Reward } from "@/domain/types";

export const demoTiers: LoyaltyTier[] = [
  {
    id: "guest",
    name: "Guest",
    threshold: 0,
    multiplier: 1,
    summary: "Знакомство с экосистемой. Уровень открывается с первого визита.",
    privileges: [
      "Баллы за визиты во всех направлениях",
      "Приветственный напиток в кофейне",
      "Анонсы событий раньше остальных",
    ],
  },
  {
    id: "insider",
    name: "Insider",
    threshold: 1500,
    multiplier: 1.25,
    summary: "Для тех, кто уже открыл несколько направлений PARMESUN.",
    privileges: [
      "Повышенное начисление баллов",
      "Приоритетная запись на мастер-классы",
      "Комплимент от шефа на гастро-ужинах",
      "Закрытые предложения партнёров",
    ],
  },
  {
    id: "circle",
    name: "Circle",
    threshold: 5000,
    multiplier: 1.5,
    summary: "Ближний круг PARMESUN — личный подход и закрытые события.",
    privileges: [
      "Максимальное начисление баллов",
      "Персональный менеджер для событий и кейтеринга",
      "Приглашения на закрытые ужины Circle",
      "Гарантированное место на сезонных сетах",
      "Подарок в день рождения",
    ],
  },
];

export const demoOffers: Offer[] = [
  {
    id: "of-1",
    direction: "workshops",
    title: "Мастер-класс «Паста фреска» −20%",
    description: "Вы часто бываете в кофейне — попробуйте приготовить пасту вместе с шефом.",
    validUntil: "2026-11-30",
    minTier: "guest",
    reason: "Ещё не посещали мастер-классы",
  },
  {
    id: "of-2",
    direction: "events",
    title: "Двойные баллы на ноябрьский гастро-ужин",
    description: "Сет из шести подач с сезонными овощами, дичью и десертом из груши. 21 ноября, 19:00.",
    validUntil: "2026-11-21",
    minTier: "insider",
    reason: "Любите вечерние форматы",
  },
  {
    id: "of-3",
    direction: "catering",
    title: "Дегустация кейтеринг-меню для двоих",
    description: "Бесплатная дегустация перед заказом кейтеринга на праздник или деловую встречу.",
    validUntil: "2026-12-15",
    minTier: "insider",
    reason: "Сезон новогодних событий",
  },
  {
    id: "of-4",
    direction: "coffee",
    title: "Каждый шестой кофе — в подарок",
    description: "Действует во всех кофейнях PARMESUN при оплате с картой Circle.",
    validUntil: "2026-12-31",
    minTier: "guest",
  },
  {
    id: "of-5",
    direction: "partnerships",
    title: "Ужин на ферме «Ала-Тоо»",
    description: "Закрытый ужин у партнёров-фермеров: 12 гостей, урожай сезона и разговор с теми, кто его вырастил.",
    validUntil: "2026-12-05",
    minTier: "circle",
    reason: "Только для уровня Circle",
  },
];

export const demoRewards: Reward[] = [
  {
    id: "rw-1",
    direction: "coffee",
    title: "Любой напиток в кофейне",
    description: "Спешелти-кофе, чай или сезонный напиток на ваш выбор.",
    cost: 200,
    minTier: "guest",
  },
  {
    id: "rw-2",
    direction: "coffee",
    title: "Десерт от шеф-кондитера",
    description: "Сезонный десерт к кофе — груша, ягоды или шоколад.",
    cost: 400,
    minTier: "guest",
  },
  {
    id: "rw-3",
    direction: "workshops",
    title: "Место на мастер-классе",
    description: "Любой открытый мастер-класс по пасте, соусам или десертам.",
    cost: 1500,
    minTier: "guest",
  },
  {
    id: "rw-4",
    direction: "events",
    title: "Пейринг к гастро-ужину",
    description: "Авторские напитки к каждой подаче сета от команды бара.",
    cost: 900,
    minTier: "insider",
  },
  {
    id: "rw-5",
    direction: "catering",
    title: "−15% на кейтеринг",
    description: "Скидка на домашний приём или деловую встречу до 30 гостей.",
    cost: 2000,
    minTier: "insider",
  },
  {
    id: "rw-6",
    direction: "education",
    title: "Лекция «Культура гостеприимства»",
    description: "Вечерняя лекция с ведущими сервиса PARMESUN.",
    cost: 700,
    minTier: "guest",
  },
  {
    id: "rw-7",
    direction: "events",
    title: "Стол шефа на двоих",
    description: "Ужин за кухонной стойкой с персональными подачами от шефа.",
    cost: 4000,
    minTier: "circle",
  },
];

/**
 * DEMO DATA — illustrative content for the prototype.
 * Replace via src/services/* when real data sources are connected.
 */
import type { Direction } from "@/domain/types";
import coffee from "@/assets/dir-coffee.jpg";
import workshops from "@/assets/dir-workshops.jpg";
import events from "@/assets/dir-events.jpg";
import catering from "@/assets/dir-catering.jpg";
import education from "@/assets/dir-education.jpg";
import partners from "@/assets/dir-partners.jpg";

export const demoDirections: Direction[] = [
  {
    slug: "coffee",
    title: "Coffee",
    titleRu: "Кофейня",
    tagline: "Утренний ритуал и место встречи",
    description:
      "Спешелти-кофе, домашняя выпечка и тихий зал, где начинается день. Самая частая точка контакта с экосистемой PARMESUN.",
    formats: ["Спешелти-кофе и альтернатива", "Выпечка собственного производства", "Завтраки до полудня", "Кофейные дегустации"],
    pointsPerVisit: 40,
    ctaLabel: "Заглянуть в кофейню",
    image: coffee,
  },
  {
    slug: "workshops",
    title: "Culinary Workshops",
    titleRu: "Кулинарные мастер-классы",
    tagline: "Готовить вместе с шефом",
    description:
      "Небольшие группы, свежая паста, соусы и десерты. Практика за общим столом и ужин из приготовленного своими руками.",
    formats: ["Паста и ризотто", "Домашние десерты", "Мастер-классы для двоих", "Детская кулинарная школа"],
    pointsPerVisit: 250,
    ctaLabel: "Выбрать мастер-класс",
    image: workshops,
  },
  {
    slug: "events",
    title: "Gastronomy & Events",
    titleRu: "Гастрономия и события",
    tagline: "Ужины, которые запоминаются",
    description:
      "Авторские гастро-ужины, сезонные сеты и частные события. От камерного ужина на 8 персон до торжества на 150 гостей.",
    formats: ["Гастро-ужины с шефом", "Частные праздники", "Корпоративные вечера", "Сезонные дегустационные сеты"],
    pointsPerVisit: 400,
    ctaLabel: "Запланировать событие",
    image: events,
  },
  {
    slug: "catering",
    title: "Catering",
    titleRu: "Кейтеринг",
    tagline: "PARMESUN там, где вы",
    description:
      "Выездная кухня и сервис для деловых встреч, свадеб и домашних приёмов. Тот же уровень подачи — за пределами ресторана.",
    formats: ["Кофе-брейки и фуршеты", "Банкетное обслуживание", "Домашние приёмы", "Боксы для офиса"],
    pointsPerVisit: 500,
    ctaLabel: "Рассчитать кейтеринг",
    image: catering,
  },
  {
    slug: "education",
    title: "Education",
    titleRu: "Обучение",
    tagline: "Профессия и глубокое знание",
    description:
      "Курсы для поваров, бариста и сервиса, а также лекции о продукте и культуре гостеприимства для всех, кто хочет понимать гастрономию глубже.",
    formats: ["Курс бариста", "Школа сервиса", "Лекции о продукте", "Программы для команд HoReCa"],
    pointsPerVisit: 300,
    ctaLabel: "Посмотреть программы",
    image: education,
  },
  {
    slug: "partnerships",
    title: "Partnerships",
    titleRu: "Партнёрские проекты",
    tagline: "Фермеры, мастера и бренды",
    description:
      "Совместные ужины с фермерами, коллаборации с брендами и локальными мастерами. Привилегии Circle действуют и у партнёров.",
    formats: ["Ужины с производителями", "Коллаборации с брендами", "Фермерские маркеты", "Привилегии у партнёров"],
    pointsPerVisit: 150,
    ctaLabel: "Узнать о партнёрах",
    image: partners,
  },
];

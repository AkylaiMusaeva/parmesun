/**
 * DEMO DATA — scripted AI Concierge scenarios.
 * No language model is connected: replies follow these predefined branches.
 */
import type { ConciergeScenario } from "@/domain/types";

export const demoScenarios: ConciergeScenario[] = [
  {
    id: "dinner",
    title: "Ужин на двоих",
    prompt: "Хочу поужинать вдвоём в особенный вечер",
    keywords: ["ужин", "двоих", "свидан", "годовщин", "романт", "вечер"],
    start: "occasion",
    steps: {
      occasion: {
        id: "occasion",
        message: "С удовольствием помогу. Подскажите, какой повод — так я подберу формат и атмосферу.",
        options: [
          { label: "Годовщина", next: "anniversary" },
          { label: "Просто хороший вечер", next: "casual" },
          { label: "Деловой ужин", next: "business" },
        ],
      },
      anniversary: {
        id: "anniversary",
        message:
          "Для годовщины советую камерный формат. Ближайший гастро-ужин — 21 ноября, а для уровня Circle доступен стол шефа.",
        suggestions: [
          { direction: "events", title: "Гастро-ужин «Ноябрь»", description: "Шесть подач, 21 ноября, 19:00. Двойные баллы для Insider.", points: 400, actionLabel: "Забронировать" },
          { direction: "events", title: "Стол шефа на двоих", description: "Ужин за кухонной стойкой с персональными подачами.", points: 0, actionLabel: "Оставить заявку" },
        ],
      },
      casual: {
        id: "casual",
        message: "Тогда предлагаю начать с дегустации в кофейне и продолжить сезонным сетом.",
        suggestions: [
          { direction: "coffee", title: "Вечерняя кофейная дегустация", description: "Пятница, 18:30. Три сорта и десерт.", points: 60, actionLabel: "Забронировать" },
          { direction: "events", title: "Сезонный сет", description: "Четыре подачи из урожая партнёров-фермеров.", points: 400, actionLabel: "Забронировать" },
        ],
      },
      business: {
        id: "business",
        message: "Для делового ужина подойдёт отдельный зал и короткий сет — без спешки, но точно ко времени.",
        suggestions: [
          { direction: "events", title: "Отдельный зал на 2–8 гостей", description: "Сет из трёх подач, сервис без лишних пауз.", points: 400, actionLabel: "Оставить заявку" },
        ],
      },
    },
  },
  {
    id: "party",
    title: "Праздник или событие",
    prompt: "Помогите организовать день рождения",
    keywords: ["праздник", "день рождения", "др", "торжеств", "свадьб", "банкет", "гостей", "событие"],
    start: "guests",
    steps: {
      guests: {
        id: "guests",
        message: "Поздравляю заранее! Сколько гостей вы ожидаете?",
        options: [
          { label: "До 12", next: "small" },
          { label: "12–40", next: "medium" },
          { label: "Больше 40", next: "large" },
        ],
      },
      small: {
        id: "small",
        message: "Для небольшой компании — частный ужин в нашем зале или мастер-класс, где гости готовят праздничный ужин сами.",
        suggestions: [
          { direction: "events", title: "Частный ужин до 12 гостей", description: "Меню согласуем с шефом, торт — от кондитера PARMESUN.", points: 900, actionLabel: "Оставить заявку" },
          { direction: "workshops", title: "Праздничный мастер-класс", description: "Паста и десерт своими руками, затем общий ужин.", points: 250, actionLabel: "Забронировать" },
        ],
      },
      medium: {
        id: "medium",
        message: "На 12–40 гостей отлично работает выездной кейтеринг у вас дома или в арендованном пространстве.",
        suggestions: [
          { direction: "catering", title: "Домашний приём", description: "Фуршет, сервис и посуда. Для Insider — дегустация меню бесплатно.", points: 500, actionLabel: "Оставить заявку" },
        ],
      },
      large: {
        id: "large",
        message: "Для большого торжества подключим менеджера событий и банкетную команду кейтеринга.",
        suggestions: [
          { direction: "catering", title: "Банкет от 40 гостей", description: "Полный цикл: меню, сервис, координация площадки.", points: 500, actionLabel: "Оставить заявку" },
          { direction: "events", title: "Встреча с менеджером событий", description: "Обсудим концепцию и бюджет за 30 минут.", points: 0, actionLabel: "Записаться" },
        ],
      },
    },
  },
  {
    id: "weekend",
    title: "Идеи на выходные",
    prompt: "Чем заняться в выходные?",
    keywords: ["выходн", "суббот", "воскрес", "заняться", "идеи", "скучно", "дети", "детьми"],
    start: "mood",
    steps: {
      mood: {
        id: "mood",
        message: "Какое настроение у этих выходных?",
        options: [
          { label: "Научиться новому", next: "learn" },
          { label: "Спокойно отдохнуть", next: "rest" },
          { label: "С детьми", next: "kids" },
        ],
      },
      learn: {
        id: "learn",
        message: "Вы ещё не были на мастер-классах — это отличный повод начать. За новое направление действует бонус Circle.",
        suggestions: [
          { direction: "workshops", title: "Мастер-класс «Паста фреска»", description: "Суббота, 12:00. Скидка 20% по вашему предложению.", points: 250, actionLabel: "Забронировать" },
          { direction: "education", title: "Лекция о сезонном продукте", description: "Воскресенье, 16:00. 90 минут и дегустация.", points: 300, actionLabel: "Забронировать" },
        ],
      },
      rest: {
        id: "rest",
        message: "Неспешный завтрак и прогулка по фермерскому маркету PARMESUN — идеальное воскресное утро.",
        suggestions: [
          { direction: "coffee", title: "Поздний завтрак", description: "Подаём до 14:00 по выходным.", points: 40, actionLabel: "Забронировать стол" },
          { direction: "partnerships", title: "Фермерский маркет", description: "Воскресенье, 10:00–15:00, двор PARMESUN.", points: 150, actionLabel: "Добавить в планы" },
        ],
      },
      kids: {
        id: "kids",
        message: "Для семьи у нас есть детская кулинарная школа — родители могут отдохнуть в кофейне рядом.",
        suggestions: [
          { direction: "workshops", title: "Детская кулинарная школа", description: "Суббота, 11:00. Возраст 6–12 лет.", points: 250, actionLabel: "Забронировать" },
        ],
      },
    },
  },
  {
    id: "tier",
    title: "Как повысить уровень",
    prompt: "Как быстрее перейти на следующий уровень Circle?",
    keywords: ["уровень", "circle", "баллы", "балл", "бонус", "insider", "накоп"],
    start: "advice",
    steps: {
      advice: {
        id: "advice",
        message:
          "Быстрее всего уровень растёт, когда вы открываете новые направления. Вот что ближе всего к вашим привычкам:",
        suggestions: [
          { direction: "workshops", title: "Первый мастер-класс", description: "+250 баллов и бонус за новое направление.", points: 250, actionLabel: "Забронировать" },
          { direction: "catering", title: "Кейтеринг для встречи", description: "+500 баллов за заказ — самый быстрый шаг.", points: 500, actionLabel: "Оставить заявку" },
          { direction: "education", title: "Вечерняя лекция", description: "+300 баллов и знакомство с командой.", points: 300, actionLabel: "Забронировать" },
        ],
      },
    },
  },
  {
    id: "gift",
    title: "Подарок",
    prompt: "Хочу сделать подарок другу",
    keywords: ["подар", "сертификат", "другу", "подруге", "маме", "коллег"],
    start: "type",
    steps: {
      type: {
        id: "type",
        message: "Прекрасная идея. Что ближе — впечатление или что-то, что можно забрать с собой?",
        options: [
          { label: "Впечатление", next: "experience" },
          { label: "Подарок с собой", next: "box" },
        ],
      },
      experience: {
        id: "experience",
        message: "Подарочный сертификат на мастер-класс или гастро-ужин — получатель сам выберет дату.",
        suggestions: [
          { direction: "workshops", title: "Сертификат на мастер-класс", description: "Действует 6 месяцев, любой формат.", points: 250, actionLabel: "Оформить" },
          { direction: "events", title: "Сертификат на гастро-ужин", description: "Для двоих, на любой сет сезона.", points: 400, actionLabel: "Оформить" },
        ],
      },
      box: {
        id: "box",
        message: "Соберём коробку из кофейни: зерно, выпечка и сезонный джем от партнёров-фермеров.",
        suggestions: [
          { direction: "coffee", title: "Кофейный бокс", description: "Зерно на выбор, выпечка, открытка от руки.", points: 40, actionLabel: "Заказать" },
        ],
      },
    },
  },
  {
    id: "team",
    title: "Для команды",
    prompt: "Нужен кофе-брейк для офиса",
    keywords: ["офис", "команд", "корпорат", "коллег", "кофе-брейк", "встреч", "конференц"],
    start: "format",
    steps: {
      format: {
        id: "format",
        message: "Что нужно команде?",
        options: [
          { label: "Кофе-брейк", next: "break" },
          { label: "Тимбилдинг", next: "teambuilding" },
          { label: "Обучение", next: "training" },
        ],
      },
      break: {
        id: "break",
        message: "Привезём кофе, выпечку и закуски к началу встречи — с сервисом или самовывозом.",
        suggestions: [
          { direction: "catering", title: "Кофе-брейк до 30 человек", description: "Бариста на месте, выпечка утром.", points: 500, actionLabel: "Оставить заявку" },
        ],
      },
      teambuilding: {
        id: "teambuilding",
        message: "Командный мастер-класс — лучший способ познакомиться ближе: готовим вместе и садимся за общий стол.",
        suggestions: [
          { direction: "workshops", title: "Командный мастер-класс", description: "8–20 человек, 3 часа, ужин в конце.", points: 250, actionLabel: "Оставить заявку" },
        ],
      },
      training: {
        id: "training",
        message: "Для HoReCa-команд у нас есть программы по сервису и кофе.",
        suggestions: [
          { direction: "education", title: "Школа сервиса для команды", description: "Два дня, выдаём сертификаты.", points: 300, actionLabel: "Оставить заявку" },
        ],
      },
    },
  },
];

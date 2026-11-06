const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const dateYearFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const numFmt = new Intl.NumberFormat("ru-RU");

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateYear = (iso: string) => dateYearFmt.format(new Date(iso));
export const formatNumber = (n: number) => numFmt.format(Math.round(n));

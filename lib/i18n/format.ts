import type { Locale } from "./types";
import { translate } from "./translate";
import type { Messages } from "./messages/en";

const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-US",
  pt: "pt-BR",
};

const CURRENCY_SYMBOL: Record<Locale, string> = {
  en: "$",
  pt: "R$",
};

export function formatMoney(messages: Messages, locale: Locale, value: number, hidden = false): string {
  const symbol = CURRENCY_SYMBOL[locale];
  if (hidden) return translate(messages, "money.hidden", { symbol });
  return `${symbol} ${value.toLocaleString(LOCALE_TAGS[locale], { minimumFractionDigits: 2 })}`;
}

export function htmlLang(locale: Locale): string {
  return locale === "pt" ? "pt-BR" : "en";
}

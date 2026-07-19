export type Locale = "en" | "pt";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "lifeline:locale";

export type MessageParams = Record<string, string | number>;

/** Dot-path keys into the nested messages object. */
export type MessageKey = string;

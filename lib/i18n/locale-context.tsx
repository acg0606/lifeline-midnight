"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Messages } from "./messages/en";
import { pt } from "./messages/pt";
import { translate, type TranslateFn } from "./translate";
import { htmlLang } from "./format";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale, type MessageParams } from "./types";

const catalogs: Record<Locale, Messages> = { en, pt };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "pt") return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = htmlLang(locale);
    document.title = catalogs[locale].meta.title;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const value = useMemo<LocaleContextValue>(() => {
    const messages = catalogs[locale];
    return {
      locale,
      setLocale: setLocaleState,
      messages,
      t: (key: string, params?: MessageParams) => translate(messages, key, params),
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT(): TranslateFn {
  return useLocale().t;
}

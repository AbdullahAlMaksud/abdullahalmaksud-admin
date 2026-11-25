"use client";

import "@/lib/i18n"; // initializes i18next once
import { useEffect, useState, useSyncExternalStore } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { LOCALES, type Locale, DEFAULT_LOCALE } from "@/lib/i18n";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function syncHtmlLang(lng?: string) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng === "bn" ? "bn" : "en";
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const isMounted = useMounted();

  useEffect(() => {
    syncHtmlLang(i18n.language);
    i18n.on("languageChanged", syncHtmlLang);
    return () => {
      i18n.off("languageChanged", syncHtmlLang);
    };
  }, []);

  if (!isMounted) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/**
 * Hook to get and set current locale, persists to localStorage and syncs `<html lang>`.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(
    () => (i18n.language as Locale) ?? DEFAULT_LOCALE
  );

  const changeLocale = (newLocale: Locale) => {
    i18n.changeLanguage(newLocale);
    localStorage.setItem("locale", newLocale);
    syncHtmlLang(newLocale);
    setLocaleState(newLocale);
  };

  return { locale, changeLocale, locales: LOCALES };
}

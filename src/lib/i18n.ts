import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import bn from "@/locales/bn.json";
import en from "@/locales/en.json";

// Supported locales
export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "bn";

const getStoredLocale = (): Locale => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("locale");
    if (stored && LOCALES.includes(stored as Locale)) return stored as Locale;
  }
  return DEFAULT_LOCALE;
};

// Each locale JSON file has top-level keys acting as namespaces.
// We flatten them into a single "translation" namespace keyed as "namespace.key".
// E.g. bn.books.title → t("books.title") with ns "translation"
const flattenToSingleNS = (obj: Record<string, Record<string, string>>) => {
  const result: Record<string, string> = {};
  for (const ns of Object.keys(obj)) {
    for (const key of Object.keys(obj[ns])) {
      result[`${ns}.${key}`] = (obj[ns] as Record<string, string>)[key];
    }
  }
  return result;
};

i18n.use(initReactI18next).init({
  resources: {
    bn: { translation: flattenToSingleNS(bn as Record<string, Record<string, string>>) },
    en: { translation: flattenToSingleNS(en as Record<string, Record<string, string>>) },
  },
  lng: getStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  ns: ["translation"],
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;

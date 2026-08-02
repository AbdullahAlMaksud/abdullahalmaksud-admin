---
name: i18n-localization
description: >
  Manages i18next-based localization for this project. Provides rules for
  adding, editing, and using translation strings. This skill is MANDATORY —
  any new user-visible text must use the t() hook from react-i18next, never
  raw strings.
---

# i18n Localization Skill — Abdullah Al Maksud Admin Portal

## MANDATORY RULE

> **Every user-visible string in this project MUST use the `t()` function from `react-i18next`.  
> Hardcoded UI strings are NOT allowed.**

---

## Architecture

### Locale Files (JSON — one per language)

| File | Language | Path |
|------|----------|------|
| `bn.json` | বাংলা (Bangla) | `src/locales/bn.json` |
| `en.json` | English | `src/locales/en.json` |

Each locale file is a **single JSON object** where top-level keys are *namespace groups* (e.g., `books`, `nav`, `settings`). These are flattened at runtime as `namespace.key`.

```json
// src/locales/bn.json
{
  "books": {
    "title": "বুক ম্যানেজমেন্ট",
    "addNew": "নতুন বই যোগ করুন"
  }
}
```

Access via: `t("books.title")`, `t("books.addNew")`.

### Configuration

- **`src/lib/i18n.ts`** — Initializes i18next, imports both locale files statically, flattens namespace groups.
- **`src/components/I18nProvider.tsx`** — Client component that wraps the app with `<I18nextProvider>`. Exports `useLocale()` for switching language.

---

## How to Use Translations in a Component

### Step 1 — Import the hook

```tsx
"use client"

import { useTranslation } from "react-i18next"

export function MyComponent() {
  const { t } = useTranslation()

  return <h1>{t("books.title")}</h1>
}
```

### Step 2 — Add strings to BOTH locale files

When adding a new key, you **must** add it to both `bn.json` and `en.json`:

```json
// bn.json  →  "books": { "newKey": "নতুন মান" }
// en.json  →  "books": { "newKey": "New Value" }
```

---

## How to Add a New Namespace / Section

1. Open `src/locales/bn.json` and add a top-level key:
   ```json
   "media": {
     "title": "মিডিয়া ম্যানেজমেন্ট"
   }
   ```
2. Mirror it in `src/locales/en.json`:
   ```json
   "media": {
     "title": "Media Management"
   }
   ```
3. Use `t("media.title")` in your component.  
   No further registration is needed — the flattening in `i18n.ts` handles it automatically.

---

## Language Switcher

Use the `useLocale()` hook exported from `src/components/I18nProvider.tsx`:

```tsx
"use client"

import { useLocale } from "@/components/I18nProvider"

export function LangSwitcher() {
  const { locale, changeLocale, locales } = useLocale()

  return (
    <div>
      {locales.map((l) => (
        <button key={l} onClick={() => changeLocale(l)} disabled={locale === l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
```

The selected locale is persisted in `localStorage` under the key `"locale"`.

---

## Supported Locales

| Code | Language | Default |
|------|----------|---------|
| `bn` | বাংলা (Bangla) | ✅ Yes |
| `en` | English | No |

---

## Adding a New Locale

1. Create `src/locales/<code>.json` with the same structure as `bn.json`.
2. In `src/lib/i18n.ts`, import the new file and add it to the `resources` object:
   ```ts
   import ar from "@/locales/ar.json";
   // ...
   resources: {
     bn: { ... },
     en: { ... },
     ar: { translation: flattenToSingleNS(ar) },
   }
   ```
3. Add the code to the `LOCALES` array in `i18n.ts`:
   ```ts
   export const LOCALES = ["bn", "en", "ar"] as const;
   ```

---

## Checklist for Code Review

- [ ] No raw Bangla or English strings in JSX — all wrapped with `t("...")`
- [ ] Both `bn.json` and `en.json` have the same keys
- [ ] New locale files imported and registered in `src/lib/i18n.ts`
- [ ] `"use client"` directive present on any component using `useTranslation()`

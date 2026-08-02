<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:i18n-rules -->
# Localization is MANDATORY

Before writing any component with user-visible text, read the i18n skill at `.agents/skills/i18n-localization/SKILL.md`.

Rules:
1. ALL user-visible strings MUST use `t("namespace.key")` from `react-i18next`. No raw hardcoded strings in JSX.
2. Every new key MUST be added to BOTH `src/locales/bn.json` AND `src/locales/en.json`.
3. Any component using `useTranslation()` must be a Client Component (`"use client"`).
4. Do NOT use `next/font/google` — local Purno font is already configured via CSS.

Locale files: `src/locales/bn.json` (default), `src/locales/en.json`
i18n config: `src/lib/i18n.ts`
Provider: `src/components/I18nProvider.tsx`
<!-- END:i18n-rules -->

<!-- BEGIN:font-rules -->
# Font: Purno (Local)

This project uses the **Purno** typeface (`.ttf`) located in `public/fonts/`.
- Do NOT import fonts from Google Fonts or any CDN.
- The font is registered via `@font-face` in `src/app/globals.css` and applied globally via `font-family: var(--font-purno)`.
- Variants available: Regular (400), Italic (400i), Bold (700), Bold-Italic (700i).
<!-- END:font-rules -->

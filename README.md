# Dashboard App

A Next.js 16 + TypeScript + Tailwind v4 project with shadcn/ui's `dashboard-01` block installed (sidebar, charts, and a data table).

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects to `/dashboard`.

## Notes

- Built with `create-next-app` (App Router, `src/` directory, Tailwind v4) and shadcn/ui's **new-york** style with the **neutral** base color.
- All shadcn/ui primitives used by the block live in `src/components/ui/`.
- The dashboard-01 block itself lives in `src/components/dashboard-01/`, wired up at `src/app/dashboard/page.tsx`.
- To add more shadcn/ui components later, run `npx shadcn@latest add <component>` from the project root (requires network access to ui.shadcn.com).

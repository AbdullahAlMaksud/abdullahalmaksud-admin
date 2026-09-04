# Abdullah Al Maksud - Admin Portal

Modern and robust Admin Portal for managing portfolio content, blogs, books, case studies, designs, projects, and site settings.

---

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [tw-animate-css](https://github.com)
- **UI Primitives:** [Radix UI](https://www.radix-ui.com/)
- **Icons:** [Lucide React](https://lucide.dev/) & [Tabler Icons](https://tabler.io/icons)
- **Tables & Charts:** [TanStack Table v8](https://tanstack.com/table), [Recharts](https://recharts.org/)
- **Internationalization:** [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/) (English & Bengali)
- **Package Manager:** Strictly [pnpm](https://pnpm.io/) (Enforced via `only-allow`)

---

## 🌐 Local Architecture & Ports

| Application | Directory | Port | Default URL |
| :--- | :--- | :--- | :--- |
| **Portfolio Web** | `AbdullahAlMaksudWeb` | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Admin Portal** | `AbdullahAlMaksudAdmin` | `3001` | [http://localhost:3001](http://localhost:3001) |
| **Backend API Server** | `AbdullahAlMaksudServer` | `4000` | [http://localhost:4000](http://localhost:4000) |

---

## 📦 Getting Started

### 1. Prerequisites

Ensure **pnpm** is installed globally:
```bash
corepack enable
# or
npm install -g pnpm
```

### 2. Install Dependencies

> ⚠️ Only `pnpm` is allowed in this repository.

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root if you want to connect to a custom backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> If not provided, it defaults to `http://localhost:4000`.

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server on port 3001 |
| `pnpm build` | Builds the production bundle |
| `pnpm start` | Starts the production server on port 3001 |
| `pnpm lint` | Runs ESLint checks |
| `pnpm exec tsc --noEmit` | Runs TypeScript type checking |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/             # Authentication routes (login, signin, signup, forgot/reset password)
│   ├── (dashboard)/        # Dashboard routes (blogs, books, designs, projects, settings)
│   ├── globals.css         # Tailwind v4 styles and Purno typography
│   └── layout.tsx          # Root layout with Theme and I18n providers
├── components/
│   ├── auth/               # Auth provider and state components
│   ├── modules/            # Domain modules (blogs, books, designs, projects)
│   └── ui/                 # Reusable UI primitives (buttons, tables, dialogs, etc.)
├── hooks/                  # Custom React hooks (e.g. use-mobile)
├── lib/
│   ├── api/                # API client and endpoints (auth, blogs, books, case-studies, etc.)
│   ├── i18n.ts             # Internationalization setup
│   └── utils.ts            # Classnames and helper utilities
└── locales/                # Translation dictionaries (bn.json, en.json)
```

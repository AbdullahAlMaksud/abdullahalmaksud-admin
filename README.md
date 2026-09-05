# Abdullah Al Maksud — Admin Portal

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Lexical](https://img.shields.io/badge/Lexical-0.50-1877F2?style=for-the-badge&logo=meta)
![pnpm](https://img.shields.io/badge/pnpm-strictly_enforced-F69220?style=for-the-badge&logo=pnpm)

**A state-of-the-art, high-performance content management system (CMS) and administration dashboard for [abdullahalmaksud.com](https://abdullahalmaksud.com).**

[Features](#-key-features) • [Architecture](#-architecture--network-ports) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Scripts](#-available-scripts)

</div>

---

## 🌟 Key Features

- **🔐 Passwordless Email OTP Authentication**:
  - Secure 6-digit one-time password verification via Resend REST API & Better-Auth.
  - Strict Role-Based Access Control (RBAC): Only verified users with the `admin` role are granted access.
  - Automatic session management with bearer token authorization and cookie fallbacks.

- **✍️ Modern Lexical Rich Text Block Editor**:
  - Extensible, block-based writing engine powered by `@lexical/react` and `@lexical/rich-text`.
  - **Block Persistence (`BlogBlock[]`)**: Articles are serialized and stored block-by-block directly into MongoDB for superior modularity and omnichannel publishing.
  - **Interactive Toolbar**: Heading selector (H1, H2, H3), blockquotes, code blocks with syntax highlighting, bulleted/numbered lists, dividers, inline formatting (bold, italic, underline, strikethrough, inline code), and links.
  - **Markdown Shortcuts**: Live inline markdown conversions (`#`, `##`, `>`, `-`, `1.`, ```` `).
  - **Live Block Inspector**: Real-time modal displaying visual block trees and raw JSON payloads before persistence.

- **📄 Dedicated Full-Page Article Workspaces**:
  - `/dashboard/blogs/create`: Dedicated creation studio with auto-slug generation, live word/character counters, cover image upload, and taxonomy management.
  - `/dashboard/blogs/[id]/edit`: Full hydration of existing blocks directly from MongoDB with real-time editing and status toggling.

- **🌐 Full Internationalization (i18n)**:
  - Dynamic bilingual interface supporting **English** (`en`) and **Bengali** (`bn`).
  - Seamless language switching powered by `i18next` and `react-i18next`.

- **🎨 Design System & Visual Excellence**:
  - Built with **Tailwind CSS v4** and modern design tokens.
  - Custom Bengali & English typography featuring **Purno**.
  - Polished dark and light theme toggle with smooth transitions.

- **📊 Comprehensive Portfolio Content Management**:
  - **Blogs & Articles**: Technical writing, tutorials, tags, categories, and reading time calculation.
  - **Projects & Case Studies**: Project showcases, tech stack tagging, and GitHub/live links.
  - **Books & Reading Lists**: Reading status, author info, and key takeaways.
  - **Designs & Prototypes**: Design system assets, cover mockups, and UI showcases.

---

## 🌐 Architecture & Network Ports

The Abdullah Al Maksud ecosystem consists of three coordinated decoupled applications:

| Application | Directory | Default Port | Environment | Primary Role |
| :--- | :--- | :--- | :--- | :--- |
| **Portfolio Web** | `AbdullahAlMaksudWeb` | `3000` | [http://localhost:3000](http://localhost:3000) | Public-facing portfolio & reader |
| **Admin Portal** | `AbdullahAlMaksudAdmin` | `4000` | [http://localhost:4000](http://localhost:4000) | Content management & administration |
| **Backend API** | `AbdullahAlMaksudServer` | `5000` | [http://localhost:5000](http://localhost:5000) | Hono REST API, Auth, MongoDB |

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack Engine)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & `tw-animate-css`
- **Rich Text Editor**: [Lexical](https://lexical.dev/) (`@lexical/react`, `@lexical/rich-text`, `@lexical/code`, `@lexical/list`, `@lexical/markdown`)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & custom accessible primitives
- **Icons**: [Tabler Icons](https://tabler.io/icons) & [Lucide React](https://lucide.dev/)
- **Data Tables**: [TanStack Table v8](https://tanstack.com/table)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Package Manager**: Strictly enforced via [pnpm](https://pnpm.io/) (`only-allow`)

---

## 📦 Getting Started

### 1. Prerequisites
Ensure **Node.js 20+** and **pnpm** are installed on your machine:
```bash
corepack enable
# or
npm install -g pnpm
```

### 2. Install Dependencies
> ⚠️ **Important**: Only `pnpm` is permitted in this codebase.
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy the template file to `.env.local`:
```bash
cp .env.example .env.local
```

Verify your local endpoints in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:4000
NEXT_PUBLIC_BLOB_BASE_URL=https://3nkxplqsj14xq0dc.public.blob.vercel-storage.com
```

### 4. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:4000](http://localhost:4000) to access the Admin Portal.

---

## ⚙️ Environment Variables

The Admin Portal frontend maintains only public configuration variables, while all secrets, authentication providers, and database keys reside securely on the backend server (`AbdullahAlMaksudServer`):

| Variable | Type | Local Default | Production Target | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public URL | `http://localhost:5000` | `https://api-abdullahalmaksud.vercel.app` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | Public URL | `http://localhost:4000` | `https://chief-abdullahalmaksud.vercel.app` | Base URL of the Admin Portal |
| `NEXT_PUBLIC_BLOB_BASE_URL` | Public URL | `https://3nkxplqsj14xq0dc.public.blob.vercel-storage.com` | `https://3nkxplqsj14xq0dc.public.blob.vercel-storage.com` | Public Vercel Blob CDN base URL |

> 🔒 **Security Notice**: All sensitive secrets and server keys (`BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `MONGODB_URI`, OAuth credentials, etc.) are strictly maintained on the backend server (`AbdullahAlMaksudServer`) and are never exposed to this client application.

### Environment Files
- [`.env.local`](.env.local): Local development settings (active by default).
- [`.env.production`](.env.production): Loaded automatically during `next build` and Vercel deployments.
- [`.env.example`](.env.example): Committed template for quick developer setup.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts Next.js development server on port 4000 with Turbopack |
| `pnpm build` | Compiles optimized production build (`next build`) |
| `pnpm start` | Launches production server on port 4000 |
| `pnpm lint` | Runs ESLint analysis across the repository |
| `pnpm exec tsc --noEmit` | Performs strict TypeScript type-checking without emitting files |

---

## 📁 Project Structure

```
AbdullahAlMaksudAdmin/
├── public/                     # Static assets, local Purno fonts, icons
├── src/
│   ├── app/
│   │   ├── (auth)/             # Auth layouts, login, signin, password recovery
│   │   ├── (dashboard)/        # Main dashboard layout, sidebar, header
│   │   │   ├── dashboard/
│   │   │   │   ├── blogs/      # Blog management table
│   │   │   │   │   ├── create/ # Dedicated full-page blog creator
│   │   │   │   │   └── [id]/edit/ # Dedicated full-page blog editor
│   │   │   │   ├── books/      # Reading list management
│   │   │   │   ├── designs/    # Design & UI asset showcase management
│   │   │   │   ├── projects/   # Portfolio project manager
│   │   │   │   └── settings/   # Profile, system settings & preferences
│   │   ├── globals.css         # Tailwind v4 styles, themes, and font rules
│   │   └── layout.tsx          # Root layout with Theme & I18n providers
│   ├── components/
│   │   ├── auth/               # Auth guards, session providers, role validation
│   │   ├── dashboard-01/       # App sidebar, site header, search dialogs
│   │   ├── editor/             # Lexical rich text block editor
│   │   │   ├── block-types.ts           # Semantic BlogBlock interfaces
│   │   │   ├── block-serializer.ts      # Bi-directional Lexical <-> Block converter
│   │   │   ├── editor-theme.ts          # Tailwind typography theme classes
│   │   │   ├── editor-toolbar.tsx       # Interactive rich toolbar
│   │   │   ├── lexical-editor.tsx       # LexicalComposer & plugins wrapper
│   │   │   └── block-inspector-dialog.tsx # Visual block & raw JSON inspector
│   │   ├── modules/            # Domain components (blogs, projects, dialogs)
│   │   └── ui/                 # Reusable UI primitives (buttons, tables, inputs)
│   ├── lib/
│   │   ├── api/                # API client with automatic token injection
│   │   │   ├── auth.ts         # Passwordless OTP & session endpoints
│   │   │   ├── blogs.ts        # Blog CRUD and ID/slug queries
│   │   │   ├── client.ts       # Unified fetch client & error handling
│   │   │   └── types.ts        # Data contracts and TypeScript models
│   │   ├── i18n.ts             # Internationalization setup
│   │   └── utils.ts            # Styling and helper utilities
│   └── locales/                # JSON dictionaries
│       ├── bn.json             # Bengali translations
│       └── en.json             # English translations
├── .env.example                # Clean environment variable template
├── .env.local                  # Local development environment (git-ignored)
├── .env.production             # Production deployment environment (git-ignored)
├── next.config.ts              # Next.js configuration & API reverse proxy
├── package.json                # Project dependencies and metadata
└── tsconfig.json               # TypeScript strict configuration
```

---

## 🔒 Security & Role-Based Access Control (RBAC)

The Admin Portal enforces strict multi-layered security:
1. **Frontend Authentication Guard** (`DashboardAuthGuard`): Verifies active Better-Auth sessions and checks `user.role === "admin"`. If a non-admin attempts access, an error toast is triggered, the session is cleared, and the user is redirected to `/login`.
2. **Bearer Token Transmission**: The `apiClient` automatically extracts the `auth_token` from persistent storage and attaches `Authorization: Bearer <token>` to all outgoing requests.
3. **Backend Middleware**: Every administrative endpoint on `AbdullahAlMaksudServer` runs through `requireAdmin`, validating cryptographic session tokens against the database before executing sensitive operations.

---

## 📄 License

Proprietary © [Abdullah Al Maksud](https://abdullahalmaksud.com). All rights reserved.

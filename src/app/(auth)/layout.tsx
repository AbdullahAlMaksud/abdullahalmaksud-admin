"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IconLanguage, IconSparkles } from "@tabler/icons-react";
import { useLocale } from "@/components/I18nProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { locale, changeLocale } = useLocale();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-50 overflow-hidden font-purno selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Aesthetic Background Gradients & Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-emerald-600/20 via-sky-600/20 to-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-teal-500/15 via-emerald-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* Auth Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            AM
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Abdullah Al Maksud
              <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t("nav.adminPortal")}
            </span>
          </div>
        </Link>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs shadow-inner">
            <IconLanguage className="size-4 text-emerald-400 ml-1.5" />
            <button
              type="button"
              onClick={() => changeLocale("bn")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                locale === "bn"
                  ? "bg-emerald-500 text-white shadow-md font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              বাংলা (BN)
            </button>
            <button
              type="button"
              onClick={() => changeLocale("en")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                locale === "en"
                  ? "bg-emerald-500 text-white shadow-md font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-6 my-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a
            href="https://abdullahalmaksud.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            {t("common.visitWebsite")}
          </a>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <IconSparkles className="size-3 text-emerald-400" />
            Abdullah Al Maksud Admin Portal
          </span>
        </div>
        <p className="text-slate-600">
          &copy; {new Date().getFullYear()} Abdullah Al Maksud. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

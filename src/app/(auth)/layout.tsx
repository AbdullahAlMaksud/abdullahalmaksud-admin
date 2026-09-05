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

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-6 my-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

    
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMail, IconArrowLeft, IconSend } from "@tabler/icons-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t("auth.forgotPasswordSubtitle"));
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl text-slate-100">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {t("auth.forgotPasswordTitle")}
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            {t("auth.forgotPasswordSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-medium">
                {t("auth.emailLabel")}
              </Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-2.5 size-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  className="pl-9 bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500 text-slate-100 placeholder:text-slate-600 text-sm h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 shadow-lg shadow-emerald-600/20 transition-all gap-2 mt-2"
            >
              <IconSend className="size-4" />
              <span>{isLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}</span>
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <IconArrowLeft className="size-3.5" />
              <span>{t("auth.backToSignIn")}</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
      <Card className="border-neutral-200 bg-white text-neutral-950 shadow-none">
        <CardHeader className="space-y-1.5 pb-4 text-center">
          <CardTitle className="text-xl font-bold tracking-tight text-neutral-950">
            {t("auth.forgotPasswordTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-neutral-500">
            {t("auth.forgotPasswordSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-neutral-800">
                {t("auth.emailLabel")}
              </Label>
              <div className="relative">
                <IconMail className="absolute top-3 left-3 size-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  className="h-10 border-neutral-200 bg-white pl-9 text-sm text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-950 focus-visible:ring-0"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 w-full gap-2 bg-neutral-950 font-medium text-white shadow-none hover:bg-neutral-800"
            >
              <IconSend className="size-4" />
              <span>{isLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}</span>
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 text-neutral-500 transition-colors hover:text-neutral-950"
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

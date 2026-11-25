"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { IconLock, IconKey } from "@tabler/icons-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t("auth.resetPasswordTitle"));
      router.push("/signin");
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-neutral-200 bg-white text-neutral-950 shadow-none">
        <CardHeader className="space-y-1.5 pb-4 text-center">
          <CardTitle className="text-xl font-bold tracking-tight text-neutral-950">
            {t("auth.resetPasswordTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-neutral-500">
            {t("auth.resetPasswordSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-medium text-neutral-800">
                {t("auth.newPasswordLabel")}
              </Label>
              <div className="relative">
                <IconLock className="absolute top-3 left-3 size-4 text-neutral-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  required
                  className="h-10 border-neutral-200 bg-white pl-9 text-sm text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-950 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-neutral-800">
                {t("auth.confirmPasswordLabel")}
              </Label>
              <div className="relative">
                <IconLock className="absolute top-3 left-3 size-4 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
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
              <IconKey className="size-4" />
              <span>{t("auth.resetPasswordButton")}</span>
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <Link
              href="/signin"
              className="text-neutral-500 transition-colors hover:text-neutral-950"
            >
              {t("auth.backToSignIn")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

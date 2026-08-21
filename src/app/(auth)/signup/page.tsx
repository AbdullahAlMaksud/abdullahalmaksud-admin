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
import { signUpEmail } from "@/lib/api/auth";
import { IconUser, IconMail, IconLock, IconUserPlus, IconLoader2 } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function SignUpPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setIsLoading(true);
      await signUpEmail({ name, email, password });
      await refreshUser();
      toast.success("Account registered successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to create account";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl text-slate-100">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {t("auth.signUpTitle") || "Create Admin Account"}
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            {t("auth.signUpSubtitle") || "Register your credentials for the portfolio admin."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300 text-xs font-medium">
                {t("auth.fullNameLabel") || "Full Name"}
              </Label>
              <div className="relative">
                <IconUser className="absolute left-3 top-2.5 size-4 text-slate-500" />
                <Input
                  id="fullName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Abdullah Al Maksud"
                  required
                  className="pl-9 bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500 text-slate-100 placeholder:text-slate-600 text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-medium">
                {t("auth.emailLabel") || "Email Address"}
              </Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-2.5 size-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="pl-9 bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500 text-slate-100 placeholder:text-slate-600 text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-medium">
                {t("auth.passwordLabel") || "Password"}
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-2.5 size-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500 text-slate-100 placeholder:text-slate-600 text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300 text-xs font-medium">
                {t("auth.confirmPasswordLabel") || "Confirm Password"}
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-2.5 size-4 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
              {isLoading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconUserPlus className="size-4" />
              )}
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            {t("auth.alreadyHaveAccount") || "Already have an account?"}{" "}
            <Link
              href="/signin"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-4 hover:underline"
            >
              {t("auth.signIn") || "Sign In"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

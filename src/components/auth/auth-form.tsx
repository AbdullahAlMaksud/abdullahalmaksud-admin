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
import { Checkbox } from "@/components/ui/checkbox";
import { signInEmail, signInSocial } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import {
  IconBrandGoogle,
  IconLock,
  IconMail,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

export function LocalizedLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const handleSocialSignIn = async (provider: "google" = "google") => {
    try {
      setIsSocialLoading(provider);
      await signInSocial(provider);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      toast.error(errMsg);
      setIsSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);
      await signInEmail({ email, password });
      await refreshUser();
      toast.success("Welcome back! Signed in successfully.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to sign in. Check your credentials.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl text-slate-100">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {t("auth.welcomeBack") || "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            {t("auth.loginSubtitle") || "Enter your admin credentials to access the portal."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialSignIn("google")}
                disabled={!!isSocialLoading || isLoading}
                className="w-full bg-slate-850 border-slate-750 hover:bg-slate-800 text-slate-200 text-xs font-medium gap-2 h-10 border-slate-700/60"
              >
                {isSocialLoading === "google" ? (
                  <IconLoader2 className="size-4 animate-spin text-rose-400" />
                ) : (
                  <IconBrandGoogle className="size-4 text-rose-400" />
                )}
                <span>{t("auth.loginWithGoogle") || "Continue with Google"}</span>
              </Button>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative px-3 bg-slate-900 text-xs uppercase tracking-wider text-slate-400 font-medium">
                {t("auth.orContinueWith") || "Or continue with email"}
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
                  placeholder={t("auth.emailPlaceholder") || "admin@example.com"}
                  required
                  className="pl-9 bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500 text-slate-100 placeholder:text-slate-600 text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 text-xs font-medium">
                  {t("auth.passwordLabel") || "Password"}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  {t("auth.forgotPassword") || "Forgot password?"}
                </Link>
              </div>
              <div className="relative">
                <IconLock className="absolute left-3 top-2.5 size-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder") || "••••••••"}
                  required
                  className="pl-9 bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500 text-slate-100 placeholder:text-slate-600 text-sm h-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember"
                className="border-slate-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <Label
                htmlFor="remember"
                className="text-xs text-slate-400 cursor-pointer font-normal"
              >
                {t("auth.rememberMe") || "Remember me"}
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 shadow-lg shadow-emerald-600/20 transition-all gap-2 mt-2"
            >
              {isLoading && <IconLoader2 className="size-4 animate-spin" />}
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              {!isLoading && <IconArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            {t("auth.dontHaveAccount") || "Don't have an account?"}{" "}
            <Link
              href="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-4 hover:underline"
            >
              {t("auth.signUp") || "Sign up"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

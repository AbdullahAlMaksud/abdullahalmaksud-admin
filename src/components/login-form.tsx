"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInEmail, signInSocial } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/auth-provider";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconLoader2,
  IconShieldLock,
} from "@tabler/icons-react";
import { toast } from "sonner";

export function LoginForm({
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

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      setIsSocialLoading(provider);
      await signInSocial(provider);
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${provider}`;
      toast.error(errMsg);
      setIsSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await signInEmail({ email: email.trim(), password });
      await refreshUser();
      toast.success(t("auth.welcomeBack") || "Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please verify your credentials.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Header section in login-05 style */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <IconShieldLock className="size-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("auth.loginTitle") || "Admin Sign In"}
            </h1>
            <FieldDescription className="text-muted-foreground">
              {t("auth.loginSubtitle") || "Enter your credentials to access the admin portal"}
            </FieldDescription>
          </div>

          {/* Email Field */}
          <Field>
            <FieldLabel htmlFor="email">
              {t("auth.emailLabel") || "Email Address"}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder") || "admin@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              disabled={isLoading || isSocialLoading !== null}
            />
          </Field>

          {/* Password Field with Forgot Password link */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">
                {t("auth.passwordLabel") || "Password"}
              </FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
              >
                {t("auth.forgotPassword") || "Forgot password?"}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.passwordPlaceholder") || "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading || isSocialLoading !== null}
            />
          </Field>

          {/* Submit Button */}
          <Field>
            <Button
              type="submit"
              disabled={isLoading || isSocialLoading !== null}
              className="w-full font-medium"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
                  {t("auth.signingIn") || "Signing in..."}
                </>
              ) : (
                t("auth.signInButton") || "Sign In"
              )}
            </Button>
          </Field>

          {/* Or Divider */}
          <FieldSeparator>
            {t("auth.orContinueWith") || "Or continue with"}
          </FieldSeparator>

          {/* Social Sign In Buttons (Google & GitHub) */}
          <Field className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading || isSocialLoading !== null}
              onClick={() => handleSocialSignIn("google")}
              className="w-full gap-2 border-border/80 hover:bg-muted/60"
            >
              {isSocialLoading === "google" ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconBrandGoogle className="size-4 text-rose-500" />
              )}
              <span>Google</span>
            </Button>

            <Button
              variant="outline"
              type="button"
              disabled={isLoading || isSocialLoading !== null}
              onClick={() => handleSocialSignIn("github")}
              className="w-full gap-2 border-border/80 hover:bg-muted/60"
            >
              {isSocialLoading === "github" ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconBrandGithub className="size-4" />
              )}
              <span>GitHub</span>
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {/* Terms and Privacy Footer */}
      <FieldDescription className="px-4 text-center text-xs text-muted-foreground/80">
        {t("auth.termsAgree") || "By signing in, you agree to our"}{" "}
        <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
          {t("auth.termsOfService") || "Terms of Service"}
        </span>{" "}
        {t("auth.and") || "and"}{" "}
        <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
          {t("auth.privacyPolicy") || "Privacy Policy"}
        </span>
        .
      </FieldDescription>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { sendOtp, verifyOtp, signOut, getCurrentUser } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/auth-provider";
import {
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconKey,
  IconLoader2,
  IconMail,
  IconRefresh,
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

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus the first OTP box when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error(t("auth.emailRequired") || "Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      await sendOtp(cleanEmail);
      setStep("otp");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      toast.success(
        t("auth.codeSentSuccess") || "Verification code sent to your email!"
      );
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please check your email.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resending OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;

    try {
      setIsResending(true);
      await sendOtp(email.trim().toLowerCase());
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
      toast.success(
        t("auth.codeResentSuccess") || "A fresh verification code has been sent!"
      );
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to resend verification code.";
      toast.error(errMsg);
    } finally {
      setIsResending(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal && value !== "") return;

    const newOtp = [...otp];

    if (cleanVal.length > 1) {
      // User pasted multiple characters into this box
      const pastedChars = cleanVal.slice(0, 6).split("");
      pastedChars.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedChars.length, 5);
      otpInputsRef.current[nextIndex]?.focus();

      // Check if full 6 digits are filled
      if (newOtp.join("").length === 6) {
        submitOtp(newOtp.join(""));
      }
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance to next input if digit entered
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are present
    const combined = newOtp.join("");
    if (combined.length === 6) {
      submitOtp(combined);
    }
  };

  // Handle Backspace and arrow navigation in OTP boxes
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Paste event on OTP boxes
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const chars = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    chars.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIdx = Math.min(chars.length, 5);
    otpInputsRef.current[focusIdx]?.focus();

    if (chars.length === 6) {
      submitOtp(chars.join(""));
    }
  };

  // Submit OTP for verification
  const submitOtp = async (code: string) => {
    if (code.length !== 6 || isLoading) return;

    try {
      setIsLoading(true);
      const authRes = await verifyOtp(email.trim().toLowerCase(), code);
      const resUser = authRes.user || authRes.data?.user;

      // Verify Admin Role immediately
      if (resUser && resUser.role !== "admin") {
        await signOut();
        toast.error(
          t("auth.adminOnlyError") ||
            "Access denied. Only administrators are authorized to access this portal."
        );
        setOtp(["", "", "", "", "", ""]);
        setStep("email");
        return;
      }

      await refreshUser();

      // Double check from session endpoint
      const meRes = await getCurrentUser().catch(() => null);
      const currentUser = meRes?.data?.user || meRes?.user;
      if (currentUser && currentUser.role !== "admin") {
        await signOut();
        toast.error(
          t("auth.adminOnlyError") ||
            "Access denied. Only administrators are authorized to access this portal."
        );
        setOtp(["", "", "", "", "", ""]);
        setStep("email");
        return;
      }

      toast.success(t("auth.welcomeBack") || "Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Invalid or expired code. Please try again.";
      toast.error(errMsg);
      // Clear OTP on error so user can retype
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOtp(otp.join(""));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* ------------------------------------------------------------- */}
      {/* STEP 1: EMAIL ENTRY                                           */}
      {/* ------------------------------------------------------------- */}
      {step === "email" && (
        <form onSubmit={handleSendOtp}>
          <FieldGroup>
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <IconShieldLock className="size-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("auth.loginTitle") || "Admin Sign In"}
              </h1>
              <FieldDescription className="text-muted-foreground text-sm max-w-sm">
                {t("auth.loginSubtitle") ||
                  "Enter your admin email to receive a secure one-time verification code"}
              </FieldDescription>
            </div>

            {/* Email Field */}
            <Field className="mt-2">
              <FieldLabel htmlFor="email" className="text-xs font-semibold text-foreground/80">
                {t("auth.emailLabel") || "Email Address"}
              </FieldLabel>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder") || "admin@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                  className="pl-10 h-11 bg-background/60 border-border/80 text-sm focus-visible:ring-emerald-500 transition-all shadow-inner"
                />
              </div>
            </Field>

            {/* Send Code Button */}
            <Field className="mt-2">
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-11 font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin mr-2" />
                    {t("auth.sendingOtp") || "Sending code..."}
                  </>
                ) : (
                  t("auth.sendOtpButton") || "Send Verification Code"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: 6-DIGIT OTP VERIFICATION                              */}
      {/* ------------------------------------------------------------- */}
      {step === "otp" && (
        <form onSubmit={handleVerifySubmit}>
          <FieldGroup>
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <IconKey className="size-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("auth.verifyTitle") || "Check Your Inbox"}
              </h1>
              <FieldDescription className="text-muted-foreground text-sm max-w-sm">
                {t("auth.verifySubtitle") ||
                  "Enter the 6-digit verification code sent to"}
              </FieldDescription>

              {/* Display Email with Change button */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/80 text-xs font-medium text-foreground">
                <span className="truncate max-w-[200px]">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-2 hover:underline flex items-center gap-1 ml-1"
                >
                  <IconEdit className="size-3" />
                  <span>{t("auth.changeEmail") || "Change"}</span>
                </button>
              </div>
            </div>

            {/* 6 Digit Input Cells */}
            <Field className="mt-4">
              <FieldLabel className="text-center block text-xs font-semibold text-foreground/80 mb-2">
                {t("auth.otpLabel") || "6-Digit Verification Code"}
              </FieldLabel>
              <div
                className="flex justify-center items-center gap-2 sm:gap-3"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={isLoading}
                    className={cn(
                      "size-11 sm:size-13 text-center text-xl sm:text-2xl font-bold rounded-xl border bg-background/60 shadow-sm transition-all focus:outline-none focus:ring-2",
                      digit
                        ? "border-emerald-500/80 ring-2 ring-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                        : "border-border/80 focus:border-emerald-500 focus:ring-emerald-500/30 text-foreground"
                    )}
                  />
                ))}
              </div>
            </Field>

            {/* Verify & Sign In Button */}
            <Field className="mt-4">
              <Button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full h-11 font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all gap-2"
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    <span>{t("auth.verifying") || "Verifying code..."}</span>
                  </>
                ) : (
                  <>
                    <IconCheck className="size-4" />
                    <span>{t("auth.verifyButton") || "Verify & Sign In"}</span>
                  </>
                )}
              </Button>
            </Field>

            {/* Resend Code Section with Countdown */}
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground px-1">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <IconArrowLeft className="size-3.5" />
                <span>{t("auth.backToSignIn") || "Back"}</span>
              </button>

              <div>
                {countdown > 0 ? (
                  <span className="text-muted-foreground">
                    {t("auth.resendIn") || "Resend in"}{" "}
                    <strong className="text-emerald-400 font-mono">
                      {countdown}s
                    </strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors disabled:opacity-50"
                  >
                    {isResending ? (
                      <IconLoader2 className="size-3.5 animate-spin" />
                    ) : (
                      <IconRefresh className="size-3.5" />
                    )}
                    <span>{t("auth.resendCode") || "Resend Code"}</span>
                  </button>
                )}
              </div>
            </div>
          </FieldGroup>
        </form>
      )}

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

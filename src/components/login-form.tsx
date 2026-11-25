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
import { BrandLogo } from "@/components/ui/brand-logo";
import { Loader2 } from "lucide-react";
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
      {step === "email" && (
        <form onSubmit={handleSendOtp}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex flex-col items-center gap-2 font-medium">
                <div className="flex items-center justify-center rounded-md">
                  <BrandLogo variant="auto" className="h-7 w-auto" />
                </div>
                <span className="sr-only">Abdullah Al Maksud</span>
              </div>
              <h1 className="text-xl font-bold">
                {t("auth.loginTitle") || "Welcome to Admin Portal"}
              </h1>
              <FieldDescription>
                {t("auth.loginSubtitle") ||
                  "Enter your admin email to continue"}
              </FieldDescription>
            </div>

            <Field>
              <FieldLabel htmlFor="email">
                {t("auth.emailLabel") || "Email"}
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder") || "m@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("auth.sendingOtp") || "Sending code..."}
                  </>
                ) : (
                  t("auth.sendOtpButton") || "Login"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifySubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center justify-center rounded-md">
                <BrandLogo variant="auto" className="h-7 w-auto" />
              </div>
              <h1 className="text-xl font-bold">
                {t("auth.verifyTitle") || "Enter verification code"}
              </h1>
              <FieldDescription>
                {t("auth.verifySubtitle") || "We sent a 6-digit code to"}{" "}
                <span className="font-medium text-foreground">{email}</span>.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {t("auth.changeEmail") || "Change"}
                </button>
              </FieldDescription>
            </div>

            <Field>
              <FieldLabel htmlFor="otp-0" className="sr-only">
                {t("auth.otpLabel") || "Verification Code"}
              </FieldLabel>
              <div
                className="flex items-center justify-center gap-2"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
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
                      "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 size-11 rounded-md border text-center font-mono text-base font-medium transition-colors outline-none focus-visible:ring-[3px]",
                      digit && "border-foreground"
                    )}
                  />
                ))}
              </div>
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("auth.verifying") || "Verifying..."}
                  </>
                ) : (
                  t("auth.verifyButton") || "Verify & Sign In"
                )}
              </Button>
            </Field>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {t("auth.backToSignIn") || "Back"}
              </button>

              <div>
                {countdown > 0 ? (
                  <span>
                    {t("auth.resendIn") || "Resend in"}{" "}
                    <span className="font-mono font-medium text-foreground">
                      {countdown}s
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
                  >
                    {t("auth.resendCode") || "Resend code"}
                  </button>
                )}
              </div>
            </div>
          </FieldGroup>
        </form>
      )}

      <FieldDescription className="px-6 text-center">
        {t("auth.termsAgree") || "By clicking continue, you agree to our"}{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          {t("auth.termsOfService") || "Terms of Service"}
        </a>{" "}
        {t("auth.and") || "and"}{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          {t("auth.privacyPolicy") || "Privacy Policy"}
        </a>
        .
      </FieldDescription>
    </div>
  );
}

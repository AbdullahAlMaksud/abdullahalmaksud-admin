"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { IconLoader2, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { toast } from "sonner";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying authorization with Google...");

  useEffect(() => {
    let isMounted = true;

    async function processAuth() {
      try {
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          if (!isMounted) return;
          setStatus("error");
          setMessage(errorDescription || error || "Authentication was denied or failed.");
          toast.error(errorDescription || "Google Sign-in failed");
          setTimeout(() => router.replace("/login"), 2000);
          return;
        }

        // Check if token was provided in URL params
        const token =
          searchParams.get("token") ||
          searchParams.get("session_token") ||
          searchParams.get("access_token");

        if (token) {
          setAuthToken(token);
        }

        // Verify session with server
        const res = await getCurrentUser();
        if (res?.data?.user || res?.user) {
          if (!isMounted) return;
          await refreshUser();
          setStatus("success");
          setMessage("Authentication successful! Redirecting to Dashboard...");
          toast.success("Successfully logged in!");
          setTimeout(() => {
            router.replace("/dashboard");
          }, 600);
        } else {
          // If cookies need a tick to propagate, retry once
          await new Promise((resolve) => setTimeout(resolve, 800));
          const retryRes = await getCurrentUser();
          if (retryRes?.data?.user || retryRes?.user) {
            if (!isMounted) return;
            await refreshUser();
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");
            router.replace("/dashboard");
          } else {
            if (!isMounted) return;
            setStatus("error");
            setMessage("Could not establish a valid session. Please try logging in again.");
            toast.error("Session verification failed");
            setTimeout(() => router.replace("/login"), 2500);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errMsg = err instanceof Error ? err.message : "Authentication failed";
        setStatus("error");
        setMessage(errMsg);
        toast.error(errMsg);
        setTimeout(() => router.replace("/login"), 2500);
      }
    }

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, refreshUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
        <div className="flex justify-center">
          {status === "loading" && (
            <div className="rounded-full bg-emerald-500/10 p-4 ring-1 ring-emerald-500/30">
              <IconLoader2 className="size-8 animate-spin text-emerald-400" />
            </div>
          )}
          {status === "success" && (
            <div className="rounded-full bg-emerald-500/20 p-4 ring-1 ring-emerald-500/50">
              <IconCircleCheck className="size-8 text-emerald-400" />
            </div>
          )}
          {status === "error" && (
            <div className="rounded-full bg-rose-500/20 p-4 ring-1 ring-rose-500/50">
              <IconAlertCircle className="size-8 text-rose-400" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Welcome Back!"}
            {status === "error" && "Sign In Failed"}
          </h2>
          <p className="text-sm text-slate-400">{message}</p>
        </div>

        <div className="pt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            {status === "loading" && (
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            )}
            {status === "success" && (
              <div className="h-full w-full rounded-full bg-emerald-500 transition-all duration-500" />
            )}
            {status === "error" && (
              <div className="h-full w-full rounded-full bg-rose-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <IconLoader2 className="size-8 animate-spin text-emerald-400" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

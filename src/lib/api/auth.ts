import { apiClient, setAuthToken, clearAuthToken } from "./client";
import { AuthSessionData, ApiResponse, User, Session } from "./types";

export interface AuthResponse {
  user?: User;
  session?: Session;
  token?: string;
  data?: {
    user?: User;
    session?: Session;
    token?: string;
  };
}

export async function signInEmail(body: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/api/auth/sign-in/email", body);
  const token = res.token || res.data?.token || res.session?.token;
  if (token) {
    setAuthToken(token);
  }
  return res;
}

export async function signUpEmail(body: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/api/auth/sign-up/email", body);
  const token = res.token || res.data?.token || res.session?.token;
  if (token) {
    setAuthToken(token);
  }
  return res;
}

export async function signInSocial(
  provider: "google" | "github",
  callbackURL?: string
): Promise<void> {
  const defaultCallback =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "/auth/callback";
  const targetCallback = callbackURL || defaultCallback;

  // Better Auth's social sign-in: POST to get the OAuth redirect URL
  // The server handles the Google redirect URI internally via GOOGLE_REDIRECT_URI env var
  // callbackURL tells Better Auth where to redirect the user AFTER OAuth completes
  const res = await apiClient.post<{ url?: string; redirect?: boolean }>(
    "/api/auth/sign-in/social",
    {
      provider,
      callbackURL: targetCallback,
    }
  );

  if (res?.url) {
    window.location.href = res.url;
    return;
  }

  throw new Error(`Could not initiate ${provider} sign-in. No redirect URL received from server.`);
}

export async function signOut(): Promise<ApiResponse<void>> {
  clearAuthToken();
  try {
    return await apiClient.post<ApiResponse<void>>("/api/auth/sign-out", {});
  } catch {
    return { success: true };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<AuthSessionData>> {
  return apiClient.get<ApiResponse<AuthSessionData>>("/api/me");
}

export async function getSession(): Promise<ApiResponse<AuthSessionData>> {
  return apiClient.get<ApiResponse<AuthSessionData>>("/api/auth/get-session");
}

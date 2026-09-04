const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth_token", token);
  } catch {
    // Ignore localStorage write error in private mode
  }
};

export const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth_token");
  } catch {
    // Ignore
  }
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Inject Bearer token if present
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies for Better Auth sessions
  });

  const contentType = response.headers.get("content-type");
  let data: unknown;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorData = data as { message?: string; error?: string } | undefined;
    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      response.statusText ||
      "Request failed";
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),

  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await request<{ success: boolean; url: string }>("/api/v1/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.url) {
      throw new ApiError("Upload succeeded but no URL was returned", 500);
    }

    return res.url;
  },
};

export { API_BASE_URL };

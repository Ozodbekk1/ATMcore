// apps/web/lib/authApi.ts

export type ApiUser = {
  name?: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  message: string;
  user: ApiUser;
};

export type RegisterResponse = {
  message: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type LogoutResponse = {
  message: string;
};

export type MeResponse = {
  user: ApiUser | null;
};

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: text };
  }
}

export async function apiLogin(input: { email: string; password: string }): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data as LoginResponse;
}

export async function apiRegister(input: { name: string; email: string; password: string }): Promise<RegisterResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, role: "USER" }),
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Register failed");
  return data as RegisterResponse;
}

export async function apiForgotPassword(input: { email: string }): Promise<ForgotPasswordResponse> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as ForgotPasswordResponse;
}

export async function apiResetPassword(input: { token: string; newPassword: string }): Promise<ResetPasswordResponse> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Reset failed");
  return data as ResetPasswordResponse;
}

export async function apiLogout(): Promise<LogoutResponse> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Logout failed");
  return data as LogoutResponse;
}

export async function apiMe(): Promise<MeResponse> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "Me failed");
  return data as MeResponse;
}
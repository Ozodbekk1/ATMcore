"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiMe, apiLogin, apiRegister, apiLogout } from "../lib/authApi";
import type { ApiUser } from "../lib/authApi";

export type Role = "SUPERADMIN" | "ADMIN" | "USER" | null;

interface AuthContextType {
  /** Currently authenticated user (null while loading or logged-out) */
  user: ApiUser | null;
  /** Shorthand role accessor */
  role: Role;
  /** True while the initial /me check is in-flight */
  isLoading: boolean;
  /** True once we've resolved /me at least once */
  isInitialized: boolean;
  /** True when user is logged in */
  isAuthenticated: boolean;

  /** Call the login API, set cookie, refetch /me */
  login: (input: { email: string; password: string }) => Promise<void>;
  /** Call the register API */
  register: (input: { name: string; email: string; password: string }) => Promise<string>;
  /** Call the logout API, clear state */
  clearSession: () => Promise<void>;
  /** Legacy alias for clearSession */
  logout: () => Promise<void>;
  /** Re-fetch /me to refresh session state */
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => "",
  clearSession: async () => {},
  logout: async () => {},
  refetchMe: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  // On mount, call /api/auth/me to resolve the session from the HTTP-only cookie
  const {
    data,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await apiMe();
      return res.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const user = data ?? null;
  const role = (user?.role as Role) ?? null;
  const isInitialized = isFetched;
  const isAuthenticated = !!user;

  const refetchMe = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      await apiLogin(input);
      // Cookie is now set by the server — refetch /me to populate user state
      await refetchMe();
    },
    [refetchMe]
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const res = await apiRegister(input);
      return res.message;
    },
    []
  );

  const clearSession = useCallback(async () => {
    await apiLogout();
    // Clear the cached user and reset query state
    queryClient.setQueryData(["auth", "me"], null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isInitialized,
        isAuthenticated,
        login,
        register,
        clearSession,
        logout: clearSession,
        refetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

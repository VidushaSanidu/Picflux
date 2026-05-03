"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import type { User } from "../types/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<User>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiFetch<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const u = await apiFetch<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(redirectTo = "/login") {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo;
    }
  }, [user, loading, redirectTo]);

  return { user, loading };
}

export function useRequireAdmin() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      window.location.href = "/";
    }
  }, [user, loading]);

  return { user, loading };
}

export { ApiError };

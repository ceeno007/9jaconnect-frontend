"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  clearAuthSession,
  extractTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveStoredUser,
  setAuthTokens,
} from "@/lib/api/client";
import { getMe, logoutRequest } from "@/lib/api/auth-client";
import {
  googleOAuthRequest,
  loginRequest,
  registerRequest,
} from "@/lib/api";
import type { AuthSessionPayload, RegisterRequest, User } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (payload: RegisterRequest) => Promise<{ user: User; message?: string }>;
  loginWithGoogle: (idToken: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(payload: AuthSessionPayload | unknown) {
  const tokens = extractTokens(payload);
  if (tokens) setAuthTokens(tokens);

  const user =
    payload &&
    typeof payload === "object" &&
    "user" in payload &&
    payload.user
      ? (payload.user as User)
      : null;

  if (user) saveStoredUser(user);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return null;
    }
    try {
      const data = await getMe();
      const next = data.user;
      saveStoredUser(next);
      setUser(next);
      return next;
    } catch {
      clearAuthSession();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const cached = getStoredUser<User>();
    if (cached) setUser(cached);

    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    void refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    const next = applySession(data);
    if (next) {
      setUser(next);
      return next;
    }
    return refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (payload: RegisterRequest) => {
    const data = await registerRequest(payload);
    if (data.user) saveStoredUser(data.user);
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const data = await googleOAuthRequest(idToken);
    const next = applySession(data);
    if (next) {
      setUser(next);
      return next;
    }
    return refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) await logoutRequest(refresh);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && getAccessToken()),
      login,
      register,
      loginWithGoogle,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, loginWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

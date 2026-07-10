"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  adminLogin as adminLoginRequest,
  adminLogout as adminLogoutRequest,
  clearAdminSession,
  getAdminAccessToken,
  getStoredAdminUser,
  type AdminUser,
} from "@/lib/api/admin-client";

type AdminAuthContextValue = {
  admin: AdminUser | null;
  loading: boolean;
  isAdminAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getStoredAdminUser();
    const token = getAdminAccessToken();
    if (cached && token) setAdmin(cached);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await adminLoginRequest(email, password);
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogoutRequest();
    } finally {
      clearAdminSession();
      setAdmin(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAdminAuthenticated: Boolean(admin),
      login,
      logout,
    }),
    [admin, loading, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}

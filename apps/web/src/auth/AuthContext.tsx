import { useCallback, useEffect, useMemo, useState } from "react";
import { login as apiLogin, me as apiMe } from "../api/auth";
import { AuthContext } from "./Auth.context";
import { AUTH_TOKEN_STORAGE_KEY } from "./storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
  );
  const [user, setUser] = useState<{ id: string; role: "ADMIN" | "CUSTOMER" } | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const refreshMe = useCallback(
    async (t: string) => {
      setLoading(true);
      try {
        const res = await apiMe(t);
        setUser(res.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    },
    [logout],
  );

  useEffect(() => {
    if (token) void refreshMe(token);
  }, [token, refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      await refreshMe(res.token);
    },
    [refreshMe],
  );

  const value = useMemo(
    () => ({ token, user, loading, login, logout }),
    [token, user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

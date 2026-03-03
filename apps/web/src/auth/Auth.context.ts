import { createContext } from "react";

export type User = { id: string; role: "ADMIN" | "CUSTOMER" };

export type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);

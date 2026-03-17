import { create } from "zustand";
import type { AuthUser } from "./types";
import { api } from "./api";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const user = await api.login(email, password);
    set({ user });
  },
  signup: async (email, password, name) => {
    const user = await api.signup(email, password, name);
    set({ user });
  },
  logout: async () => {
    await api.logout();
    set({ user: null });
  },
  checkAuth: async () => {
    try {
      const user = await api.getMe();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));

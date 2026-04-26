import { create } from "zustand";
import {
  AuthService,
  type UserProfile,
} from "@/lib/services/auth.service";

const DEMO_AUTH_STORAGE_KEY = "demo.auth.user";
export const DEMO_AUTH_ENABLED = process.env.NEXT_PUBLIC_DEMO_AUTH !== "false";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: UserProfile | null) => void;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    if (DEMO_AUTH_ENABLED) {
      const role: UserProfile["role"] = email.toLowerCase().includes("admin")
        ? "admin"
        : "cashier";
      const user: UserProfile = {
        id: `demo-${role}`,
        email: email || `demo.${role}@example.com`,
        role,
        name: role === "admin" ? "Demo Admin" : "Demo Cashier",
      };
      localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    }

    try {
      const { user, session } = await AuthService.login(email, password);

      if (session) {
        AuthService.persistToken(session.access_token);
      }

      set({ user, isLoading: false });
      return user;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (DEMO_AUTH_ENABLED) {
        localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
      }
      AuthService.logout(); // fire-and-forget
      AuthService.clearToken();
      set({ user: null, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "ออกจากระบบไม่สำเร็จ";
      set({ error: message, isLoading: false });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      if (DEMO_AUTH_ENABLED) {
        const rawUser = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
        if (!rawUser) {
          set({ user: null, isLoading: false });
          return;
        }
        const user: UserProfile = JSON.parse(rawUser);
        set({ user, isLoading: false });
        return;
      }

      const token = AuthService.getPersistedToken();
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      try {
        const user = await AuthService.getMe(token);
        set({ user, isLoading: false });
      } catch {
        AuthService.clearToken();
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));

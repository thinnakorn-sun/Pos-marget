import { API_URL, apiFetch } from "./core/api-client";

export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "cashier";
  name: string;
}

export interface AuthLoginResponse {
  user: UserProfile;
  session?: {
    access_token: string;
  };
}

const AUTH_TOKEN_STORAGE_KEY = "supabase.auth.token";

export const AuthService = {
  login(email: string, password: string) {
    return apiFetch<AuthLoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return fetch(`${API_URL}/auth/logout`, { method: "POST" });
  },

  getMe(token: string) {
    return apiFetch<UserProfile>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  persistToken(accessToken: string) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
  },

  clearToken() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  },

  getPersistedToken() {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },
};

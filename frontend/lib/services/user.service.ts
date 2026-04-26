import { apiFetch } from "./core/api-client";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "cashier";
  created_at?: string;
}

export const UserService = {
  getAll() {
    return apiFetch<UserProfile[]>("/users");
  },

  updateRole(id: string, role: UserProfile["role"]) {
    return apiFetch<UserProfile>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  update(id: string, data: Partial<UserProfile>) {
    return apiFetch<UserProfile>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiFetch<void>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};

import { create } from "zustand";
import { demoDb, DEMO_MODE_ENABLED } from "@/lib/demo/mock-db";
import {
  UserService,
  type UserProfile,
} from "@/lib/services/user.service";

interface UserState {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  updateUserRole: (id: string, role: "admin" | "cashier") => Promise<void>;
  updateUser: (id: string, data: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      if (DEMO_MODE_ENABLED) {
        set({ users: demoDb.getUsers(), isLoading: false });
        return;
      }
      const data = await UserService.getAll();
      set({ users: data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch users";
      set({ error: message, isLoading: false });
    }
  },

  updateUserRole: async (id, role) => {
    try {
      if (DEMO_MODE_ENABLED) {
        const updatedUser = demoDb.updateUserRole(id, role);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        }));
        return;
      }
      const updatedUser = await UserService.updateRole(id, role);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      set({ error: message });
      throw err;
    }
  },

  updateUser: async (id, data) => {
    try {
      if (DEMO_MODE_ENABLED) {
        const updatedUser = demoDb.updateUser(id, data);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        }));
        return;
      }
      const updatedUser = await UserService.update(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      set({ error: message });
      throw err;
    }
  },

  deleteUser: async (id) => {
    try {
      if (DEMO_MODE_ENABLED) {
        demoDb.deleteUser(id);
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
        return;
      }
      await UserService.delete(id);

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      set({ error: message });
      throw err;
    }
  },
}));

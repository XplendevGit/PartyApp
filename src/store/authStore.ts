// src/store/authStore.ts
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { AuthService } from "../services/authService";

interface AuthState {
  user: User | null;
  isLoadingAuth: boolean;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,

  initializeAuth: async () => {
    set({ isLoadingAuth: true });

    let currentUser = await AuthService.getCurrentSession();

    if (!currentUser) {
      currentUser = await AuthService.signInAnonymously();
    }

    set({ user: currentUser, isLoadingAuth: false });
  },
}));

// src/services/authService.ts
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export const AuthService = {
  async getCurrentSession(): Promise<User | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user || null;
    } catch (error) {
      console.error("❌ Error obteniendo sesión:", error);
      return null;
    }
  },

  async signInAnonymously(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      console.log("✅ Autenticación Anónima Exitosa. ID:", data.user?.id);
      return data.user;
    } catch (error) {
      console.error("❌ Error en Login Anónimo:", error);
      return null;
    }
  },
};

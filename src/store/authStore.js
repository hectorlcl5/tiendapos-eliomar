import { create } from "zustand";
import { supabase } from "../services/supabase";

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  checkSession: async () => {
    set({ loading: true });

    // Obtener sesión actual
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const fetchProfile = async (userId) => {
      const { data } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    };

    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      set({ user: session.user, profile: profile || null, loading: false });
    } else {
      set({ user: null, profile: null, loading: false });
    }

    // Escuchar cambios de sesión (login/logout automáticos)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ user: session.user, profile: profile || null, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },
}));

import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const usePosStore = create((set) => ({
  activeSession: null,
  isLoadingSession: false,

  checkActiveSession: async (userId) => {
    set({ isLoadingSession: true });
    try {
      const { data, error } = await supabase
        .from('sesiones_ventas')
        .select('*')
        .eq('usuario_id', userId)
        .eq('estado', 'abierta')
        .maybeSingle();

      if (error) throw error;
      set({ activeSession: data || null });
    } catch (error) {
      console.error('Error al verificar sesión activa:', error.message);
      set({ activeSession: null });
    } finally {
      set({ isLoadingSession: false });
    }
  },

  startSession: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('sesiones_ventas')
        .insert([
          {
            usuario_id: userId,
            estado: 'abierta',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      set({ activeSession: data });
      return data;
    } catch (error) {
      console.error('Error al abrir caja:', error.message);
      throw error;
    }
  },

  closeSession: async (sessionId, declarados, sistema) => {
    try {
      const { error } = await supabase
        .from('sesiones_ventas')
        .update({
          cierre_usd_efectivo: declarados.cierre_usd_efectivo,
          cierre_bs_efectivo: declarados.cierre_bs_efectivo,
          cierre_bs_punto: declarados.cierre_bs_punto,
          cierre_bs_biopago: declarados.cierre_bs_biopago,
          cierre_bs_pagomovil: declarados.cierre_bs_pagomovil,
          sistema_usd_efectivo: sistema.usd_efectivo,
          sistema_bs_efectivo: sistema.bs_efectivo,
          sistema_bs_punto: sistema.bs_punto,
          sistema_bs_biopago: sistema.bs_biopago,
          sistema_bs_pagomovil: sistema.bs_pagomovil,
          fecha_cierre: new Date().toISOString(),
          estado: 'cerrada',
        })
        .eq('id', sessionId);

      if (error) throw error;
      set({ activeSession: null });
    } catch (error) {
      console.error('Error al cerrar caja:', error.message);
      throw error;
    }
  },
}));
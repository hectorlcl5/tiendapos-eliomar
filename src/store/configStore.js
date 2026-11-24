import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConfigStore = create(
  persist(
    (set) => ({
      tasaBcv: '1', 
      setTasaBcv: (nuevaTasa) => {
        // Reemplaza comas por puntos en tiempo real para mantener el formato matemático
        const valorSaneado = String(nuevaTasa).replace(',', '.');
        set({ tasaBcv: valorSaneado });
      },
    }),
    {
      name: 'pos-config-storage',
    }
  )
);
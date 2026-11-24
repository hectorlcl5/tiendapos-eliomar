import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('descripcion', { ascending: true });

      if (error) throw error;
      set({ products: data || [] });
    } catch (error) {
      console.error('Error al cargar productos:', error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (productData) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      
      const { products } = get();
      set({ products: [...products, data] });
    } catch (error) {
      console.error('Error al agregar producto:', error.message);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { products } = get();
      set({
        products: products.map((p) => (p.id === id ? data : p)),
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error.message);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { products } = get();
      set({ products: products.filter((p) => p.id !== id) });
    } catch (error) {
      console.error('Error al eliminar producto:', error.message);
      throw error;
    }
  },

  // Nueva función para alternar IVA rápido
  toggleIva: async (id, valorActual) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({ aplica_iva: !valorActual })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { products } = get();
      set({
        products: products.map((p) => (p.id === id ? data : p)),
      });
    } catch (error) {
      console.error('Error al cambiar IVA:', error.message);
    }
  }
}));
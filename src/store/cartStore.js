import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: [],

  addToCart: (product, qty = 1) => {
    const { cart } = get();
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + qty } : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...product, cantidad: qty }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.id !== productId) });
  },

  updateQuantity: (productId, newQuantity) => {
    if (newQuantity <= 0) return;
    set({
      cart: get().cart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item
      ),
    });
  },

  clearCart: () => set({ cart: [] }),

  getSubtotal: () => {
    return get().cart.reduce(
      (subtotal, item) => subtotal + item.cantidad * (item.precio_venta || 0),
      0
    );
  },

  getIvaTotal: () => {
    return get().cart.reduce((ivaTotal, item) => {
      if (!item.aplica_iva) return ivaTotal;
      const itemSubtotal = item.cantidad * (item.precio_venta || 0);
      const porcentaje = parseFloat(item.porcentaje_iva) || 16;
      return ivaTotal + itemSubtotal * (porcentaje / 100);
    }, 0);
  },

  getTotal: () => {
    return get().getSubtotal() + get().getIvaTotal();
  },
}));
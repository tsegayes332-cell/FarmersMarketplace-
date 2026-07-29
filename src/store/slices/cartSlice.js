import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [], // { product, quantity }
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.product.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find(item => item.product.id === productId);
      if (existing) {
        existing.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '../types/menu.types';
import { apiClient } from '../services/api-client';

interface CartState {
  items: CartItem[];
  tableId: string | null;
  setTableId: (tableId: string) => void;
  fetchServerCart: (tableId: string) => Promise<void>;
  syncWithServer: (tableId: string, items: CartItem[]) => Promise<void>;
  addItem: (menuItem: MenuItem, quantity?: number, specialNotes?: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateSpecialNotes: (menuItemId: number, notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getServiceCharge: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,

      setTableId: (tableId: string) => {
        set({ tableId });
        get().fetchServerCart(tableId);
      },

      fetchServerCart: async (tableId: string) => {
        try {
          const cleanTableNum = String(tableId || '').match(/\d+/)?.[0] || '1';
          const res = await apiClient.get(`/tables/table-number/${cleanTableNum}/cart`);
          if (res.data && Array.isArray(res.data.data)) {
            set({ items: res.data.data, tableId });
          }
        } catch (e) {
          // Gracefully fallback to local state if server table session is initializing
        }
      },

      syncWithServer: async (tableId: string, items: CartItem[]) => {
        try {
          const cleanTableNum = String(tableId || '').match(/\d+/)?.[0] || '1';
          await apiClient.put(`/tables/table-number/${cleanTableNum}/cart`, { items });
        } catch (e) {
          console.error('Failed to sync cart to server:', e);
        }
      },

      addItem: (menuItem, quantity = 1, specialNotes = '') => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.menuItem.id === menuItem.id
          );

          let updatedItems: CartItem[] = [];

          if (existingIndex > -1) {
            updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
              specialNotes: specialNotes || existingItem.specialNotes,
            };
          } else {
            updatedItems = [
              ...state.items,
              { menuItem, quantity, specialNotes },
            ];
          }

          if (state.tableId) {
            get().syncWithServer(state.tableId, updatedItems);
          }

          return { items: updatedItems };
        });
      },

      removeItem: (menuItemId) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) => item.menuItem.id !== menuItemId
          );

          if (state.tableId) {
            get().syncWithServer(state.tableId, updatedItems);
          }

          return { items: updatedItems };
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.menuItem.id === menuItemId
              ? { ...item, quantity }
              : item
          );

          if (state.tableId) {
            get().syncWithServer(state.tableId, updatedItems);
          }

          return { items: updatedItems };
        });
      },

      updateSpecialNotes: (menuItemId, notes) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.menuItem.id === menuItemId
              ? { ...item, specialNotes: notes }
              : item
          );

          if (state.tableId) {
            get().syncWithServer(state.tableId, updatedItems);
          }

          return { items: updatedItems };
        });
      },

      clearCart: () => {
        const tableId = get().tableId;
        set({ items: [] });
        if (tableId) {
          get().syncWithServer(tableId, []);
        }
      },

      getSubtotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.menuItem.price * item.quantity,
          0
        );
      },

      getTaxAmount: () => {
        // 5% GST on Subtotal
        return get().getSubtotal() * 0.05;
      },

      getServiceCharge: () => {
        // Optional 5% service charge
        return get().getSubtotal() * 0.05;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const gst = get().getTaxAmount();
        return subtotal + gst;
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'aura_cart_storage',
      partialize: (state) => ({
        items: state.items,
        tableId: state.tableId,
      }),
    }
  )
);

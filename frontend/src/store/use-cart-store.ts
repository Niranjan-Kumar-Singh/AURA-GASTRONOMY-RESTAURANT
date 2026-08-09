import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '../types/menu.types';

interface CartState {
  items: CartItem[];
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
      addItem: (menuItem, quantity = 1, specialNotes = '') => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.menuItem.id === menuItem.id
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
              specialNotes: specialNotes || existingItem.specialNotes
            };
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { menuItem, quantity, specialNotes }],
          };
        });
      },
      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== menuItemId),
        }));
      },
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId ? { ...item, quantity } : item
          ),
        }));
      },
      updateSpecialNotes: (menuItemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId ? { ...item, specialNotes: notes } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
          0
        );
      },
      getTaxAmount: () => {
        return get().getSubtotal() * 0.10; // 10% Tax
      },
      getServiceCharge: () => {
        return get().getSubtotal() * 0.05; // 5% Service Charge
      },
      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal + get().getTaxAmount() + get().getServiceCharge();
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'aura-table-cart',
    }
  )
);

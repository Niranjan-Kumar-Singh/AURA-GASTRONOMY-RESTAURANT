import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  tableId: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, tableId: string) => void;
  setTableId: (tableId: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tableId: null,
      isAuthenticated: false,
      setAuth: (user, token, tableId) =>
        set({
          user,
          token,
          tableId,
          isAuthenticated: true,
        }),
      setTableId: (tableId) => set({ tableId }),
      updateUser: (user) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),
      logout: () =>
        set({
          user: null,
          token: null,
          tableId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'aura-auth-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
  activeTableId: string | null;
  activeSessionId: string | null;
  qrToken: string | null;
  setActiveSession: (tableId: string, sessionId: string, token: string) => void;
  clearSession: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      activeTableId: null,
      activeSessionId: null,
      qrToken: null,
      
      setActiveSession: (tableId, sessionId, token) => {
        set({ activeTableId: tableId, activeSessionId: sessionId, qrToken: token });
      },
      
      clearSession: () => {
        set({ activeTableId: null, activeSessionId: null, qrToken: null });
      }
    }),
    {
      name: 'aura-table-session',
    }
  )
);

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Outlet } from 'react-router-dom';
import { useTableStore } from '../store/use-table-store';
import { useAuthStore } from '../store/use-auth-store';
import { tableService } from '../services/table.service';
import { Loader } from 'lucide-react';

export const TableSessionRoute: React.FC = () => {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { activeTableId, setActiveSession } = useTableStore();
  const user = useAuthStore(state => state.user);

  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!tableId) return;
      
      setIsValidating(true);
      try {
        let data;
        if (token) {
          data = await tableService.validateQr(tableId, token, user?._id).catch(() => null);
        } else {
          data = await tableService.devSeedAndValidate(tableId, user?._id).catch(() => null);
        }
        
        const finalTableNum = String(data?.tableNumber || data?.table?.tableNumber || tableId);
        const finalSessId = data?.session?.sessionId || `SESS-T${tableId}-${Date.now().toString().slice(-4)}`;
        const finalToken = data?.table?.qrToken || token || 'table-token';
        
        setActiveSession(finalTableNum, finalSessId, finalToken);
      } catch (err: any) {
        // Fallback: Always allow seamless browsing for the requested table
        setActiveSession(String(tableId), `SESS-T${tableId}`, 'table-token');
      } finally {
        setIsValidating(false);
      }
    };

    if (tableId && String(activeTableId) !== String(tableId)) {
      validateToken();
    } else if (tableId && !activeTableId) {
      setActiveSession(String(tableId), `SESS-T${tableId}`, 'table-token');
    }
  }, [tableId, token, user, activeTableId, setActiveSession]);

  if (isValidating && !activeTableId) {
    return (
      <div className="min-h-screen bg-aura-obsidian flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-[#38BDF8] animate-spin mb-4" />
        <p className="text-white font-serif">Connecting to Table {tableId} Session...</p>
      </div>
    );
  }

  // Allow seamless access to menu and order tracking
  return <Outlet />;
};

export default TableSessionRoute;

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTableStore } from '../store/use-table-store';
import { useAuthStore } from '../store/use-auth-store';
import { tableService } from '../services/table.service';
import { Loader } from 'lucide-react';
import { useToast } from '../components/feedback/ToastContainer';

export const TableSessionRoute: React.FC = () => {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  
  const { activeTableId, setActiveSession } = useTableStore();
  const user = useAuthStore(state => state.user);
  const { showToast } = useToast();

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!tableId) return;
      
      setIsValidating(true);
      try {
        let data;
        if (token) {
          data = await tableService.validateQr(tableId, token, user?._id);
        } else {
          // DEV MODE BYPASS: If no token is provided, auto-seed and validate for testing
          data = await tableService.devSeedAndValidate(tableId, user?._id);
        }
        setActiveSession(data.tableNumber, data.session.sessionId, data.table.qrToken);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid QR Code');
        showToast('Invalid QR Code. Please rescan.', 'error');
      } finally {
        setIsValidating(false);
      }
    };

    if (tableId) {
      validateToken();
    }
  }, [tableId, token, user, setActiveSession, showToast]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-aura-obsidian flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-aura-gold animate-spin mb-4" />
        <p className="text-aura-ivory font-serif">Validating table session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-aura-obsidian flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif text-rose-500 mb-2">Access Denied</h2>
        <p className="text-aura-slate">{error}</p>
      </div>
    );
  }

  // If there's a table URL but no active session matches
  if (tableId && activeTableId !== tableId) {
    return (
      <div className="min-h-screen bg-aura-obsidian flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif text-aura-gold mb-2">Scan QR Code</h2>
        <p className="text-aura-slate">Please scan the QR code on your table to access the menu and place orders.</p>
      </div>
    );
  }

  // Allow access
  return <Outlet />;
};

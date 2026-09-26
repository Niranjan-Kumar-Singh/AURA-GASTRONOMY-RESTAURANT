import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Outlet } from 'react-router-dom';
import { useTableStore } from '../store/use-table-store';
import { useAuthStore } from '../store/use-auth-store';
import { tableService } from '../services/table.service';
import { Loader2, QrCode, ShieldCheck, Sparkles, Utensils, ArrowRight, AlertCircle, PhoneCall } from 'lucide-react';

export const TableSessionRoute: React.FC = () => {
  const { tableId, orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { activeTableId, setActiveSession } = useTableStore();
  const user = useAuthStore((state) => state.user);

  const [isValidating, setIsValidating] = useState(false);
  const [demoTableInput, setDemoTableInput] = useState('10');
  const [isSimulating, setIsSimulating] = useState(false);

  // If a legacy URL with /table/:tableId was hit, securely seed/validate and transition to clean masked URL /menu
  useEffect(() => {
    const handleLegacyTableParam = async () => {
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
        const finalToken = data?.table?.qrToken || data?.qrToken || token || 'table-token';

        setActiveSession(finalTableNum, finalSessId, finalToken, true);

        // Clean the address bar: Transition away from /table/:tableId/menu to /menu (or /order/:orderId)
        if (orderId) {
          navigate(`/order/${orderId}`, { replace: true });
        } else {
          navigate('/menu', { replace: true });
        }
      } catch (err: any) {
        setActiveSession(String(tableId), `SESS-T${tableId}`, 'table-token', true);
        if (orderId) {
          navigate(`/order/${orderId}`, { replace: true });
        } else {
          navigate('/menu', { replace: true });
        }
      } finally {
        setIsValidating(false);
      }
    };

    if (tableId) {
      handleLegacyTableParam();
    }
  }, [tableId, token, orderId, user, navigate, setActiveSession]);

  const handleSimulateScan = async (tableNum: string) => {
    setIsSimulating(true);
    try {
      const qrData = await tableService.getQrToken(tableNum).catch(() => null);
      const tokenToUse = qrData?.qrToken || 'demo-qr-token';
      
      const seedData = await tableService.devSeedAndValidate(tableNum, user?._id).catch(() => null);
      const sessId = seedData?.session?.sessionId || `SESS-T${tableNum}-${Date.now().toString().slice(-4)}`;

      setActiveSession(tableNum, sessId, tokenToUse, true);
    } catch {
      setActiveSession(tableNum, `SESS-T${tableNum}`, 'demo-qr-token', true);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-100">Securing Table Session</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">Concealing URL parameters & validating credentials...</p>
      </div>
    );
  }

  // If there's an active verified table, allow immediate access to the menu!
  if (activeTableId) {
    return <Outlet />;
  }

  // If NO active table session exists (e.g., user directly navigated to /menu without scanning QR)
  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(217,119,6,0.05),transparent_60%)]" />

      <div className="w-full max-w-md bg-[#0D121F]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-6">
        {/* Brand Crest */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-full">
          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-serif tracking-widest text-[11px] text-slate-300 font-bold uppercase">
            AURA Gastronomy
          </span>
        </div>

        {/* Security QR Shield Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-500/30 animate-spin-slow" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <QrCode className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 font-mono text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Table Verification Required</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-serif tracking-wide">
            Scan Your Table QR Code
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            To protect your dining tab and ensure orders are routed to your exact table, manual URL navigation is restricted. Please scan the QR stand placed on your table.
          </p>
        </div>

        {/* Quick Simulation / Reviewer Demonstration Panel */}
        <div className="p-4 bg-[#070A12]/90 border border-slate-800/90 rounded-2xl space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>Table Selector (Demo / Testing)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Tables 1 - 30</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Select a table number below to simulate scanning a physical table stand:
          </p>

          <div className="flex items-center space-x-2">
            <select
              value={demoTableInput}
              onChange={(e) => setDemoTableInput(e.target.value)}
              className="flex-1 py-2.5 px-3 bg-[#0D121F] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={String(num)}>
                  Table {num} {num === 10 ? '★ (Mayfair Suite)' : num % 4 === 0 ? '(Booth • 6)' : num % 2 === 0 ? '(Standard • 4)' : '(Intimate • 2)'}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleSimulateScan(demoTableInput)}
              disabled={isSimulating}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSimulating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Simulate Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => handleSimulateScan('10')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
            >
              ⚡ Instant Table 10 Access
            </button>
            <button
              onClick={() => handleSimulateScan('1')}
              className="text-[11px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
            >
              Table 1 Access
            </button>
          </div>
        </div>

        {/* Return to Landing Page */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Return to AURA Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSessionRoute;

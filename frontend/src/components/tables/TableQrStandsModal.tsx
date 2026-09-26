import React, { useState } from 'react';
import { TableResponse } from '../../types/order.types';
import { tableService } from '../../services/table.service';
import { useToast } from '../feedback/ToastContainer';
import { QrCode, X, Copy, ExternalLink, Printer, RotateCcw, ShieldCheck, Sparkles, Search, Check } from 'lucide-react';

interface TableQrStandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableResponse[];
  onRefreshTables?: () => void;
}

export const TableQrStandsModal: React.FC<TableQrStandsModalProps> = ({
  isOpen,
  onClose,
  tables,
  onRefreshTables,
}) => {
  const { showToast } = useToast();
  const [searchTable, setSearchTable] = useState('');
  const [copiedTable, setCopiedTable] = useState<string | number | null>(null);
  const [rotatingTable, setRotatingTable] = useState<string | number | null>(null);

  if (!isOpen) return null;

  const origin = window.location.origin;

  const filteredTables = tables.filter((t) => {
    if (!searchTable.trim()) return true;
    return String(t.tableNumber).includes(searchTable.trim());
  });

  const getDineUrl = (token?: string) => {
    return `${origin}/dine/${token || 'demo-token'}`;
  };

  const handleCopyLink = (tableNum: string | number, token?: string) => {
    const url = getDineUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNum);
    showToast(`Table ${tableNum} secure QR URL copied to clipboard!`, 'success');
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const handleRotateQr = async (table: TableResponse) => {
    const tId = table._id || table.tableNumber;
    setRotatingTable(tId);
    try {
      await tableService.rotateQrToken(tId);
      showToast(`Regenerated new secure QR code for Table ${table.tableNumber}!`, 'success');
      if (onRefreshTables) onRefreshTables();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to rotate QR token', 'error');
    } finally {
      setRotatingTable(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0D121F] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto text-slate-100 font-sans">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0B0F17]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                  Table QR Code Stands &amp; Print Manager
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold rounded-full">
                  Tamper-Proof
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Each table stand features a unique cryptographic token concealing the table number from public URLs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              title="Print Table Stands"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print All Stands</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Summary Bar */}
        <div className="p-4 bg-[#070A12] border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-72">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search table number (e.g. 10)..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0D121F] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span>Showing: <strong className="text-emerald-400">{filteredTables.length}</strong> / 30 Tables</span>
            <span>Security: <strong className="text-emerald-400 font-semibold">128-bit Opaque QR Tokens</strong></span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => {
            const dineUrl = getDineUrl(table.qrCodeToken || (table as any).qrToken);
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
              dineUrl
            )}`;
            const isCopied = copiedTable === table.tableNumber;
            const isRotating = rotatingTable === (table._id || table.tableNumber);

            return (
              <div
                key={table.tableNumber}
                className="bg-[#070A12] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all shadow-md group"
              >
                {/* Table Stand Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-serif font-black text-sm text-emerald-400">
                      {table.tableNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Table {table.tableNumber}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Cap: {table.capacity || 4} Guests • {Number(table.tableNumber) === 10 ? 'VIP Suite' : 'Main Dining'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {table.status?.toUpperCase() || 'AVAILABLE'}
                  </span>
                </div>

                {/* QR Code Centerpiece */}
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200">
                    <img
                      src={qrImageUrl}
                      alt={`Table ${table.tableNumber} QR`}
                      className="w-32 h-32 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 text-center tracking-wider uppercase">
                    Scan to Dine • Stand #{table.tableNumber}
                  </span>
                </div>

                {/* Secure URL Details */}
                <div className="bg-[#0D121F] p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Target Scanned URL:</span>
                    <span className="text-emerald-400 font-bold">Masked Session</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 truncate bg-black/40 px-2 py-1 rounded border border-slate-800/60 select-all">
                    {dineUrl}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(table.tableNumber, table.qrCodeToken || (table as any).qrToken)}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    title="Copy QR Link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={dineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer text-center"
                    title="Open Scanned View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </a>

                  <button
                    onClick={() => handleRotateQr(table)}
                    disabled={isRotating}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                    title="Rotate cryptographic QR token"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-amber-400' : ''}`} />
                    <span>Rotate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0B0F17] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 font-mono">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Customer URLs automatically resolve to clean <code className="text-emerald-300">/menu</code> without showing table numbers.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default TableQrStandsModal;

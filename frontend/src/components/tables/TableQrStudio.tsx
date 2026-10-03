import React, { useState, useEffect, useMemo } from 'react';
import { TableResponse } from '../../types/order.types';
import { tableService } from '../../services/table.service';
import { useToast } from '../feedback/ToastContainer';
import {
  VenueQrConfig,
  getVenueConfig,
  saveVenueConfig,
  computeTableDineUrl,
  DEFAULT_VENUE_CONFIG,
} from '../../utils/venueConfig';
import {
  generateQrDataUrl,
  downloadStandCard,
  downloadBoardPoster,
  downloadTableSticker,
  downloadQrOnly,
  batchDownloadAllStands,
  batchDownloadAllPosters,
  batchDownloadAllStickers,
  batchDownloadAllQrs,
} from '../../utils/standCardGenerator';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  Settings,
  Globe,
  Wifi,
  Layers,
  CheckCircle2,
  RefreshCw,
  X,
  CreditCard,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Eye,
} from 'lucide-react';

export interface TableQrStudioProps {
  tables?: TableResponse[];
  onRefreshTables?: () => void;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const FALLBACK_TABLES: TableResponse[] = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  return {
    _id: `tbl-${num}`,
    tableNumber: num,
    capacity: num % 4 === 0 ? 6 : num % 2 === 0 ? 4 : 2,
    status: 'AVAILABLE' as any,
    qrCodeToken: `tok_aura_tbl_${String(num).padStart(2, '0')}_secure`,
  };
});

type OutputFormat = 'STAND' | 'POSTER' | 'STICKER' | 'QR_ONLY';

export const TableQrStudio: React.FC<TableQrStudioProps> = ({
  tables: initialTables,
  onRefreshTables,
  isModal = false,
  isOpen = true,
  onClose,
}) => {
  const { showToast } = useToast();

  // Internal table list if not provided via props
  const [internalTables, setInternalTables] = useState<TableResponse[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Configuration State
  const [config, setConfig] = useState<VenueQrConfig>(getVenueConfig());
  const [draftConfig, setDraftConfig] = useState<VenueQrConfig>(getVenueConfig());
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Filters & State
  const [searchTable, setSearchTable] = useState('');
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'VIP' | 'MAIN'>('ALL');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('STAND');
  const [copiedTable, setCopiedTable] = useState<string | number | null>(null);
  const [rotatingTable, setRotatingTable] = useState<string | number | null>(null);

  // Download & Batch States
  const [downloadingTable, setDownloadingTable] = useState<string | number | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Preview Modal
  const [previewTable, setPreviewTable] = useState<TableResponse | null>(null);

  // Local QR Cache (tableNumber -> dataUrl)
  const [qrCache, setQrCache] = useState<{ [key: string]: string }>({});

  // Effective Tables
  const tables = useMemo(() => {
    if (initialTables && initialTables.length > 0) return initialTables;
    if (internalTables.length > 0) return internalTables;
    return FALLBACK_TABLES;
  }, [initialTables, internalTables]);

  // Load tables if not provided
  useEffect(() => {
    if (!initialTables || initialTables.length === 0) {
      let isMounted = true;
      const fetchTables = async () => {
        try {
          setIsLoadingTables(true);
          const res = await tableService.getAllTables();
          if (isMounted && res && res.length > 0) {
            setInternalTables(res);
          }
        } catch (e) {
          console.warn('Using fallback tables for QR Studio:', e);
        } finally {
          if (isMounted) setIsLoadingTables(false);
        }
      };
      fetchTables();
      return () => {
        isMounted = false;
      };
    }
  }, [initialTables]);

  // Refresh config on open
  useEffect(() => {
    const active = getVenueConfig();
    setConfig(active);
    setDraftConfig(active);
  }, [isOpen]);

  // Re-generate local client-side QR codes when tables or base URL change
  useEffect(() => {
    if (tables.length === 0) return;
    let isMounted = true;

    const generateAllQrs = async () => {
      const newCache: { [key: string]: string } = {};
      for (const table of tables) {
        const token = table.qrCodeToken || (table as any).qrToken || `tok_tbl_${table.tableNumber}`;
        const url = computeTableDineUrl(token, config);
        try {
          const dataUrl = await generateQrDataUrl(url, { size: 400 });
          newCache[String(table.tableNumber)] = dataUrl;
        } catch (e) {
          console.error(`Failed to generate QR for Table ${table.tableNumber}:`, e);
        }
      }
      if (isMounted) {
        setQrCache(newCache);
      }
    };

    generateAllQrs();
    return () => {
      isMounted = false;
    };
  }, [tables, config.baseUrl, config.urlFormat]);

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesSearch = !searchTable.trim() || String(t.tableNumber).includes(searchTable.trim());
      const isVip = Number(t.tableNumber) === 10;
      if (selectedZone === 'VIP') return matchesSearch && isVip;
      if (selectedZone === 'MAIN') return matchesSearch && !isVip;
      return matchesSearch;
    });
  }, [tables, searchTable, selectedZone]);

  if (isModal && !isOpen) return null;

  // Actions
  const handleSaveConfig = () => {
    const saved = saveVenueConfig(draftConfig);
    setConfig(saved);
    setIsConfigOpen(false);
    showToast('Venue branding & dining domain saved successfully!', 'success');
  };

  const handleResetConfig = () => {
    const reset = saveVenueConfig(DEFAULT_VENUE_CONFIG);
    setConfig(reset);
    setDraftConfig(reset);
    showToast('Reset venue configuration to default settings.', 'info');
  };

  const handleUseCurrentOrigin = () => {
    setDraftConfig((prev) => ({
      ...prev,
      baseUrl: window.location.origin,
    }));
    showToast(`Set base URL to: ${window.location.origin}`, 'info');
  };

  const handleCopyLink = (tableNum: string | number, token?: string) => {
    const url = computeTableDineUrl(token, config);
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNum);
    showToast(`Table ${tableNum} dining URL copied to clipboard!`, 'success');
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const handleRotateQr = async (table: TableResponse) => {
    const tId = table._id || table.tableNumber;
    setRotatingTable(tId);
    try {
      await tableService.rotateQrToken(tId);
      showToast(`Regenerated secure cryptographic token for Table ${table.tableNumber}!`, 'success');
      if (onRefreshTables) onRefreshTables();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to rotate QR token', 'error');
    } finally {
      setRotatingTable(null);
    }
  };

  const handleDownloadSingle = async (table: TableResponse) => {
    setDownloadingTable(table.tableNumber);
    try {
      if (outputFormat === 'STAND') {
        await downloadStandCard(table, config);
        showToast(`Table ${table.tableNumber} acrylic stand card downloaded (PNG)!`, 'success');
      } else if (outputFormat === 'POSTER') {
        await downloadBoardPoster(table, config);
        showToast(`Table ${table.tableNumber} wall poster downloaded (PNG)!`, 'success');
      } else if (outputFormat === 'STICKER') {
        await downloadTableSticker(table, config);
        showToast(`Table ${table.tableNumber} table sticker downloaded (PNG)!`, 'success');
      } else {
        await downloadQrOnly(table, config);
        showToast(`Table ${table.tableNumber} raw QR code downloaded (PNG)!`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloadingTable(null);
    }
  };

  const handleBatchDownload = async () => {
    if (tables.length === 0) return;
    setIsBatchDownloading(true);
    setBatchProgress({ current: 0, total: tables.length });

    try {
      const onProgress = (current: number, total: number) => {
        setBatchProgress({ current, total });
      };

      if (outputFormat === 'STAND') {
        await batchDownloadAllStands(tables, config, onProgress);
      } else if (outputFormat === 'POSTER') {
        await batchDownloadAllPosters(tables, config, onProgress);
      } else if (outputFormat === 'STICKER') {
        await batchDownloadAllStickers(tables, config, onProgress);
      } else {
        await batchDownloadAllQrs(tables, config, onProgress);
      }

      showToast(`Successfully exported all ${tables.length} table artifacts!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Batch download failed or was interrupted.', 'error');
    } finally {
      setIsBatchDownloading(false);
      setBatchProgress(null);
    }
  };

  const content = (
    <div className="space-y-6 font-sans text-aura-ivory">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-aura-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl flex items-center justify-center">
            <QrCode className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-xl font-bold tracking-wide text-white">QR STAND STUDIO</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                PRO PRINT ENGINE
              </span>
            </div>
            <p className="text-xs text-aura-slate">
              Generate 300 DPI acrylic table tent cards, wall posters, table stickers, and cryptographic dining QR codes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
              isConfigOpen
                ? 'bg-[#0EA5E9] text-[#090A0F] border-[#7DD3FC]/50 shadow-md'
                : 'bg-aura-container hover:bg-aura-obsidian border-aura-border text-aura-slate hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Venue Branding</span>
            {isConfigOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-aura-slate hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Configuration Drawer */}
      {isConfigOpen && (
        <div className="bg-[#090A0F] border border-[#38BDF8]/30 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-aura-border/60 pb-3">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#38BDF8]" />
              Table QR Stand Branding & Dining Domain
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUseCurrentOrigin}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-aura-slate hover:text-white text-[10px] rounded-lg border border-aura-border transition-colors cursor-pointer"
              >
                Use Current Origin ({window.location.host})
              </button>
              <button
                onClick={handleResetConfig}
                className="px-2.5 py-1 text-red-400 hover:text-red-300 text-[10px] transition-colors cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-aura-slate font-semibold">Brand / Restaurant Name</label>
              <input
                type="text"
                value={draftConfig.brandName}
                onChange={(e) => setDraftConfig({ ...draftConfig, brandName: e.target.value })}
                className="w-full px-3 py-2 bg-aura-container border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-aura-slate font-semibold">Sub-heading / Tagline</label>
              <input
                type="text"
                value={draftConfig.tagline}
                onChange={(e) => setDraftConfig({ ...draftConfig, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-aura-container border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-aura-slate font-semibold">Base Dining URL (Domain)</label>
              <input
                type="text"
                value={draftConfig.baseUrl}
                onChange={(e) => setDraftConfig({ ...draftConfig, baseUrl: e.target.value })}
                placeholder="http://localhost:5173"
                className="w-full px-3 py-2 bg-aura-container border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-aura-slate font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3 text-[#38BDF8]" /> Guest Wi-Fi SSID
              </label>
              <input
                type="text"
                value={draftConfig.wifiSsid}
                onChange={(e) => setDraftConfig({ ...draftConfig, wifiSsid: e.target.value })}
                className="w-full px-3 py-2 bg-aura-container border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-aura-slate font-semibold">Wi-Fi Password</label>
              <input
                type="text"
                value={draftConfig.wifiPassword}
                onChange={(e) => setDraftConfig({ ...draftConfig, wifiPassword: e.target.value })}
                className="w-full px-3 py-2 bg-aura-container border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-aura-slate font-semibold">Visual Theme</label>
              <select
                value={draftConfig.themeStyle}
                onChange={(e) => setDraftConfig({ ...draftConfig, themeStyle: e.target.value as any })}
                className="w-full px-3 py-2 bg-aura-container border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="EMERALD_GOLD">Emerald Gold (Artisanal Luxury)</option>
                <option value="ROYAL_NOIR">Royal Noir (Midnight Obsidian)</option>
                <option value="MINIMAL_IVORY">Minimal Ivory (High Contrast)</option>
                <option value="SUNSET_AMBER">Sunset Amber (Atmospheric Warmth)</option>
                <option value="CYBER_NEON">Cyber Neon (Botanical Glow)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-aura-border/40">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="px-4 py-1.5 text-aura-slate hover:text-white text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-bold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: Format Selector & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-aura-container/60 p-4 rounded-2xl border border-aura-border">
        {/* Format Selector */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setOutputFormat('STAND')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              outputFormat === 'STAND'
                ? 'bg-[#0EA5E9] text-[#090A0F] font-black shadow-md'
                : 'text-aura-slate hover:text-white bg-aura-obsidian/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Acrylic Stand (A6)</span>
          </button>

          <button
            onClick={() => setOutputFormat('POSTER')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              outputFormat === 'POSTER'
                ? 'bg-[#0EA5E9] text-[#090A0F] font-black shadow-md'
                : 'text-aura-slate hover:text-white bg-aura-obsidian/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Wall Poster (A4)</span>
          </button>

          <button
            onClick={() => setOutputFormat('STICKER')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              outputFormat === 'STICKER'
                ? 'bg-[#0EA5E9] text-[#090A0F] font-black shadow-md'
                : 'text-aura-slate hover:text-white bg-aura-obsidian/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Table Sticker (80mm)</span>
          </button>

          <button
            onClick={() => setOutputFormat('QR_ONLY')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              outputFormat === 'QR_ONLY'
                ? 'bg-[#0EA5E9] text-[#090A0F] font-black shadow-md'
                : 'text-aura-slate hover:text-white bg-aura-obsidian/40'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Raw QR Only</span>
          </button>
        </div>

        {/* Search, Zone & Batch Download */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-aura-slate" />
            <input
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Search table #"
              className="pl-8 pr-3 py-2 bg-aura-obsidian border border-aura-border rounded-xl text-white focus:outline-none focus:border-[#38BDF8] w-28 sm:w-36"
            />
          </div>

          <button
            onClick={handleBatchDownload}
            disabled={isBatchDownloading || tables.length === 0}
            className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isBatchDownloading
                ? `Exporting (${batchProgress?.current || 0}/${batchProgress?.total || tables.length})...`
                : `Batch Export All (${tables.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const tNum = table.tableNumber;
          const isVip = Number(tNum) === 10;
          const token = table.qrCodeToken || (table as any).qrToken || `tok_tbl_${tNum}`;
          const qrDataUrl = qrCache[String(tNum)];
          const dineUrl = computeTableDineUrl(token, config);
          const isDownloading = downloadingTable === tNum;
          const isRotating = rotatingTable === (table._id || tNum);

          return (
            <div
              key={table._id || tNum}
              className={`bg-aura-container/80 backdrop-blur-xl border rounded-2xl p-4 transition-all hover:border-[#38BDF8]/40 space-y-3 shadow-lg ${
                isVip ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-aura-border'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-lg font-black text-white">Table {tNum}</span>
                  {isVip && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[9px] font-bold">
                      VIP
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-aura-slate font-medium">Capacity: {table.capacity || 4}p</span>
              </div>

              {/* QR Preview Area */}
              <div
                onClick={() => setPreviewTable(table)}
                className="bg-[#090A0F] rounded-xl p-3 border border-aura-border/60 flex flex-col items-center justify-center cursor-pointer group hover:border-[#38BDF8]/40 transition-all relative overflow-hidden"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Table ${tNum}`}
                    className="w-32 h-32 object-contain rounded-lg group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-aura-slate text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* URL Preview */}
              <div className="text-[10px] font-mono text-aura-slate truncate bg-aura-obsidian/60 px-2 py-1 rounded-lg border border-aura-border/40">
                {dineUrl}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-aura-border/40 text-xs">
                <button
                  onClick={() => handleCopyLink(tNum, token)}
                  title="Copy Dining Link"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-aura-slate hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {copiedTable === tNum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <a
                  href={dineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Dine Menu in New Tab"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-aura-slate hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleRotateQr(table)}
                  disabled={isRotating}
                  title="Rotate / Regenerate QR Token"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-aura-slate hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => handleDownloadSingle(table)}
                  disabled={isDownloading}
                  title={`Download ${outputFormat} format`}
                  className="p-2 rounded-xl bg-[#0EA5E9]/15 hover:bg-[#0EA5E9]/25 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stand Zoom Preview Modal */}
      {previewTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-aura-container border border-aura-border rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Table {previewTable.tableNumber} Stand</h3>
              <button
                onClick={() => setPreviewTable(null)}
                className="p-1.5 text-aura-slate hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#090A0F] rounded-2xl border border-[#38BDF8]/20 flex flex-col items-center space-y-3">
              <span className="font-serif text-sm tracking-widest text-[#38BDF8] uppercase font-bold">
                {config.brandName}
              </span>
              {qrCache[String(previewTable.tableNumber)] && (
                <img
                  src={qrCache[String(previewTable.tableNumber)]}
                  alt={`Table ${previewTable.tableNumber}`}
                  className="w-48 h-48 object-contain rounded-xl shadow-lg"
                />
              )}
              <span className="font-serif text-xl font-bold text-white">
                TABLE {previewTable.tableNumber}
              </span>
              <p className="text-[11px] text-aura-slate">Scan to view artisanal menu and order directly</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleDownloadSingle(previewTable)}
                className="flex-1 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {outputFormat}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-aura-container border border-aura-border rounded-3xl p-4 sm:p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 max-w-7xl mx-auto pb-24">
      {content}
    </div>
  );
};

export default TableQrStudio;

import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Bell, CheckCircle2, Clock, Users, ArrowRight, RefreshCw, AlertTriangle, Layers, DollarSign, Sparkles, Check, X, ChevronRight, PhoneCall, Flame, PackageCheck, Search, BellRing, BellOff, UserPlus, QrCode, ExternalLink, Grid, Receipt } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastContainer';
import { tableService } from '../../services/table.service';
import { orderService } from '../../services/order.service';

interface TableState {
  _id: string;
  tableNumber: number;
  zone?: string;
  capacity: number;
  status: 'available' | 'occupied' | 'billing' | 'cleaning';
  guestCount?: number;
  activeOrderId?: string;
  orderTotal?: number;
  orderStatus?: string;
  items?: { name: string; quantity: number }[];
}

interface WaiterAlert {
  id: number;
  tableId: string;
  reason: string;
  timestamp: string;
  status: 'PENDING' | 'RESOLVED';
}

export const WaiterDashboardPage: React.FC = () => {
  const { showToast } = useToast();

  // Waiter Dispatch Sidebar Tabs
  const [activeTab, setActiveTab] = useState<'TABLE_STATUS' | 'WAITER_CALLS' | 'FOOD_READY' | 'BILL_REQUESTS'>('TABLE_STATUS');

  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [alerts, setAlerts] = useState<WaiterAlert[]>([]);
  const [tables, setTables] = useState<TableState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableState | null>(null);

  // Payment state
  const [seatGuestCount, setSeatGuestCount] = useState<number>(2);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI_QR' | 'CARD_SWIPE' | 'CASH'>('UPI_QR');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const prevReadyCountRef = useRef<number>(0);

  // Web Audio Chime Notification
  const playAudioChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio policy catch
    }
  };

  const fetchFloorState = async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const [tableData, activeOrders] = await Promise.all([
        tableService.getAllTables(),
        orderService.getActiveOrders().catch(() => []),
      ]);

      const orderMap = new Map();
      activeOrders.forEach((ord: any) => {
        orderMap.set(String(ord.tableId), ord);
      });

      // Construct complete array of 30 tables (Table 1 through Table 30)
      const full30TableList: TableState[] = Array.from({ length: 30 }, (_, index) => {
        const num = index + 1;
        let zone = 'Main Hall';
        if (num > 12 && num <= 16) zone = 'VIP Lounge';
        if (num > 16 && num <= 24) zone = 'Outdoor Garden';
        if (num > 24) zone = 'Family Section';

        const existingTable = tableData.find((t: any) => Number(t.tableNumber) === num);
        const statusVal = (existingTable?.status || 'available') as 'available' | 'occupied' | 'billing' | 'cleaning';

        const isTableActive = statusVal === 'occupied' || statusVal === 'billing';
        const activeOrder = isTableActive ? (orderMap.get(String(num)) || (existingTable ? orderMap.get(String(existingTable._id)) : null)) : null;

        return {
          _id: existingTable?._id || `temp-table-${num}`,
          tableNumber: num,
          zone,
          capacity: existingTable?.capacity || (num % 4 === 0 ? 6 : num % 2 === 0 ? 4 : 2),
          status: ['available', 'occupied', 'billing', 'cleaning'].includes(statusVal) ? statusVal : 'available',
          guestCount: isTableActive ? (existingTable?.guestCount || 0) : 0,
          activeOrderId: isTableActive ? (activeOrder ? activeOrder.orderId : existingTable?.activeOrderId) : undefined,
          orderTotal: isTableActive ? (activeOrder ? activeOrder.totalAmount : (existingTable?.orderTotal || 0)) : 0,
          orderStatus: isTableActive ? (activeOrder ? activeOrder.status : undefined) : undefined,
          items: isTableActive ? (activeOrder ? activeOrder.items : []) : [],
        };
      });

      // Sound chime on new ready orders
      const currentReadyCount = full30TableList.filter((t) => t.orderStatus === 'ready').length;
      if (currentReadyCount > prevReadyCountRef.current && prevReadyCountRef.current !== 0) {
        playAudioChime();
        showToast(`🔥 Hot Food Ready at Kitchen Pass for Pickup!`, 'success', 'Kitchen Ready Alert');
      }
      prevReadyCountRef.current = currentReadyCount;

      setTables(full30TableList);
      if (isManual) showToast('Floor status refreshed (30 Tables Active)', 'info');
    } catch (error) {
      console.error('Failed to fetch floor tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorState();
    const tableInterval = setInterval(() => fetchFloorState(false), 3000); // 3s auto sync

    // Poll live customer waiter calls from localStorage
    const alertInterval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem('aura_waiter_alerts') || '[]');
      setAlerts(stored);
    }, 1000);

    return () => {
      clearInterval(tableInterval);
      clearInterval(alertInterval);
    };
  }, []);

  const handleAcknowledgeAlert = (alertId: number) => {
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a));
    setAlerts(updated);
    localStorage.setItem('aura_waiter_alerts', JSON.stringify(updated));
    showToast('Customer call acknowledged & cleared', 'success');
  };

  // Instant Table Status Updater with Strict Business Rule Validation
  const handleUpdateTableStatus = async (
    e: React.MouseEvent | null,
    tableId: string,
    tableNum: number,
    nextStatus: 'available' | 'occupied' | 'billing' | 'cleaning',
    guestCountParam?: number
  ) => {
    if (e) e.stopPropagation();

    const targetTable = tables.find((t) => t.tableNumber === tableNum);
    if (!targetTable) return;

    // Rule 1: Available table CANNOT directly transition to Billing (must be occupied with active order)
    if (nextStatus === 'billing' && targetTable.status === 'available') {
      showToast(
        `Cannot request bill for Table ${tableNum}! Table is empty/available. Guests must be seated ('Occupied') and place an order first.`,
        'error',
        'Invalid Status Transition'
      );
      return;
    }

    // Rule 2: Cleaning table CANNOT directly transition to Billing
    if (nextStatus === 'billing' && targetTable.status === 'cleaning') {
      showToast(
        `Cannot request bill for Table ${tableNum}! Table is currently being cleaned.`,
        'error',
        'Invalid Status Transition'
      );
      return;
    }

    // Rule 3: Occupied table without an active order CANNOT transition to Billing
    if (nextStatus === 'billing' && targetTable.status === 'occupied' && (!targetTable.activeOrderId || !targetTable.orderTotal || targetTable.orderTotal === 0)) {
      showToast(
        `Cannot request bill for Table ${tableNum}! No active dining order placed yet. Please add items first.`,
        'error',
        'No Order Found'
      );
      return;
    }

    // Rule 4: Billing table CANNOT transition directly back to Available without Cashier POS settlement
    if (nextStatus === 'available' && targetTable.status === 'billing') {
      showToast(
        `Table ${tableNum} is awaiting bill settlement at Cashier POS. Settle payment at Cashier POS or set to Cleaning.`,
        'info',
        'Bill Payment Required'
      );
      return;
    }

    // Rule 5: Cannot directly clean an Occupied table with an open order
    if (nextStatus === 'cleaning' && targetTable.status === 'occupied' && targetTable.activeOrderId) {
      showToast(
        `Table ${tableNum} is currently dining with order #${targetTable.activeOrderId}. Please complete order & billing first.`,
        'error',
        'Active Dining Session'
      );
      return;
    }

    // Instant local UI update
    const finalGuests = nextStatus === 'occupied' ? (guestCountParam || targetTable.guestCount || 2) : 0;
    setTables((prev) =>
      prev.map((t) => (t.tableNumber === tableNum ? { ...t, status: nextStatus, guestCount: finalGuests } : t))
    );
    if (selectedTable && selectedTable.tableNumber === tableNum) {
      setSelectedTable((prev) => (prev ? { ...prev, status: nextStatus, guestCount: finalGuests } : null));
    }

    try {
      await tableService.updateTableStatus(
        tableId.startsWith('temp-') ? String(tableNum) : tableId,
        nextStatus,
        guestCountParam
      );
      showToast(`Table ${tableNum} status set to ${nextStatus.toUpperCase()} (${finalGuests} Seated)`, 'success');
      fetchFloorState();
    } catch (error: any) {
      const msg = error?.response?.data?.message || `Table ${tableNum} status set to ${nextStatus.toUpperCase()}`;
      showToast(msg, 'info');
    }
  };

  const handleSeatWalkInGuests = async (tableId: string, tableNum: number) => {
    handleUpdateTableStatus(null, tableId, tableNum, 'occupied', seatGuestCount);
    showToast(`Seated ${seatGuestCount} walk-in guests at Table ${tableNum}!`, 'success');
    setSelectedTable(null);
  };

  const handleSettlePayment = async (tableNum: number) => {
    setIsProcessingPayment(true);
    try {
      const res = await orderService.settleTableBill(tableNum, selectedPaymentMethod);
      const invNum = res?.data?.invoiceNumber || 'INV-SETTLED';
      showToast(`Bill settled via ${selectedPaymentMethod}! Invoice #${invNum} generated. Table ${tableNum} set to Cleaning.`, 'success');
      playAudioChime();
      setSelectedTable(null);
      fetchFloorState();
    } catch (error: any) {
      showToast('Failed to settle bill', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMarkServed = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    try {
      await orderService.updateOrderStatus(orderId, 'served');
      showToast(`Order #${orderId} marked SERVED to guest!`, 'success');
      if (selectedTable) setSelectedTable(null);
      fetchFloorState();
    } catch (error) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Visual Badging for Table Statuses
  const getStatusBadgeStyle = (status: TableState['status'], orderStatus?: string) => {
    if (orderStatus === 'ready') {
      return 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400 animate-pulse';
    }
    switch (status) {
      case 'available':
        return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:border-emerald-400';
      case 'occupied':
        return 'bg-aura-gold/10 border-aura-gold/50 text-aura-gold hover:border-aura-gold';
      case 'billing':
        return 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 animate-pulse';
      case 'cleaning':
        return 'bg-slate-500/10 border-slate-500/50 text-slate-400 hover:border-slate-400';
    }
  };

  // Filter Tables
  const filteredTables = tables.filter((t) => {
    const matchesZone = selectedZone === 'ALL' || t.zone === selectedZone;
    const matchesSearch = searchTableQuery === '' || String(t.tableNumber).includes(searchTableQuery);
    
    let matchesStatus = true;
    if (statusFilter === 'READY') matchesStatus = t.orderStatus === 'ready';
    else if (statusFilter === 'OCCUPIED') matchesStatus = t.status === 'occupied';
    else if (statusFilter === 'BILLING') matchesStatus = t.status === 'billing';
    else if (statusFilter === 'AVAILABLE') matchesStatus = t.status === 'available';
    else if (statusFilter === 'CLEANING') matchesStatus = t.status === 'cleaning';

    return matchesZone && matchesSearch && matchesStatus;
  });

  const activePendingAlerts = alerts.filter((a) => a.status === 'PENDING');
  const readyToServeTables = tables.filter((t) => t.orderStatus === 'ready');
  const billingTables = tables.filter((t) => t.status === 'billing');

  const totalTables = tables.length; // 30
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const billingCount = tables.filter((t) => t.status === 'billing').length;

  return (
    <div className="flex h-full min-h-0 w-full font-sans text-aura-ivory">
      {/* ========================================================================= */}
      {/* DEDICATED WAITER DISPATCH CONTROL SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="w-72 flex-shrink-0 h-full flex flex-col bg-aura-container border-r border-aura-border/80 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-5 p-5">
          {/* Header Widget with Green Pulsing Dot */}
          <div className="flex items-center space-x-3.5 border-b border-aura-border/60 pb-4">
            <div className="p-3 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl shadow-inner flex items-center justify-center">
              <Utensils className="w-7 h-7 text-aura-gold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-lg font-bold text-aura-ivory tracking-wide">
                  WAITER DISPATCH
                </h1>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
              </div>
              <p className="text-[11px] text-aura-slate">Floor & Kitchen Pass Hub</p>
            </div>
          </div>

          {/* WORKSPACE NAVIGATION */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block px-1 font-bold">
              WORKSPACE NAVIGATION
            </span>

            {/* TAB 1: 30-TABLE FLOOR GRID */}
            <button
              onClick={() => setActiveTab('TABLE_STATUS')}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                activeTab === 'TABLE_STATUS'
                  ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-xl font-black scale-[1.02]'
                  : 'bg-aura-obsidian/80 text-aura-slate border-aura-border hover:text-aura-ivory hover:border-aura-gold/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Grid className="w-4 h-4" />
                <span>30-Table Floor Grid</span>
              </div>
              <span className="font-mono text-xs font-bold">30</span>
            </button>

            {/* TAB 2: CUSTOMER CALLS */}
            <button
              onClick={() => setActiveTab('WAITER_CALLS')}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer relative ${
                activeTab === 'WAITER_CALLS'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-xl font-black scale-[1.02]'
                  : activePendingAlerts.length > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-bold'
                  : 'bg-aura-obsidian/80 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className={`w-4 h-4 ${activePendingAlerts.length > 0 ? 'animate-bounce text-rose-400' : ''}`} />
                <span>Customer Calls</span>
              </div>
              <span className="font-mono text-xs font-bold">
                {activePendingAlerts.length}
              </span>
            </button>

            {/* TAB 3: FOOD READY PASS */}
            <button
              onClick={() => setActiveTab('FOOD_READY')}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer relative ${
                activeTab === 'FOOD_READY'
                  ? 'bg-emerald-500 text-aura-obsidian border-emerald-400 shadow-xl font-black scale-[1.02]'
                  : readyToServeTables.length > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 animate-pulse font-bold'
                  : 'bg-aura-obsidian/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Flame className={`w-4 h-4 ${readyToServeTables.length > 0 ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Food Ready Pass</span>
              </div>
              <span className="font-mono text-xs font-bold">
                {readyToServeTables.length}
              </span>
            </button>

            {/* TAB 4: BILL CHECKOUT QUEUE */}
            <button
              onClick={() => setActiveTab('BILL_REQUESTS')}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer relative ${
                activeTab === 'BILL_REQUESTS'
                  ? 'bg-amber-500 text-aura-obsidian border-amber-400 shadow-xl font-black scale-[1.02]'
                  : billingCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse font-bold'
                  : 'bg-aura-obsidian/80 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Receipt className="w-4 h-4" />
                <span>Bill Checkout Queue</span>
              </div>
              <span className="font-mono text-xs font-bold">
                {billingCount}
              </span>
            </button>
          </div>

          {/* FLOOR SUMMARY OVERVIEW BOX */}
          <div className="p-4 bg-aura-obsidian/70 border border-aura-border/60 rounded-2xl space-y-3 font-mono">
            <span className="text-[10px] font-bold text-aura-gold uppercase block tracking-wider font-mono">
              FLOOR SUMMARY OVERVIEW
            </span>
            <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
              <span>Available Free:</span>
              <span className="font-mono">{availableCount} Tables</span>
            </div>
            <div className="flex justify-between items-center text-xs text-aura-gold font-bold">
              <span>Occupied Dining:</span>
              <span className="font-mono">{occupiedCount} Tables</span>
            </div>
            <div className="flex justify-between items-center text-xs text-amber-400 font-bold">
              <span>Bill Requested:</span>
              <span className="font-mono">{billingCount} Tables</span>
            </div>
          </div>
        </div>

      {/* Bottom Controls — pinned to bottom of sidebar */}
      <div className="space-y-2 border-t border-aura-border/60 p-5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all border cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-aura-obsidian text-aura-slate border-aura-border'
            }`}
          >
            {soundEnabled ? <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" /> : <BellOff className="w-4 h-4 text-aura-slate" />}
            <span>{soundEnabled ? 'Audio Alerts ON' : 'Audio Muted'}</span>
          </button>

          <button
            onClick={() => fetchFloorState(true)}
            className="w-full py-2.5 bg-aura-obsidian border border-aura-border hover:border-aura-gold text-aura-slate hover:text-aura-gold rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-aura-gold' : ''}`} />
            <span>Sync Floor Plan</span>
          </button>
      </div>
    </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT WORKSPACE (Right Panel — scrollable) */}
      {/* ========================================================================= */}
      <main className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 min-w-0">
        {/* Top Banner Alert on Main Content */}
        {(readyToServeTables.length > 0 || activePendingAlerts.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {readyToServeTables.length > 0 && (
              <div
                onClick={() => setActiveTab('FOOD_READY')}
                className="p-4 bg-emerald-500/10 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl flex items-center justify-between shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center space-x-3">
                  <Flame className="w-6 h-6 text-emerald-400 animate-bounce" />
                  <div>
                    <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider block">
                      Hot Food Pickup Alert!
                    </span>
                    <p className="text-xs text-aura-ivory font-bold">
                      {readyToServeTables.length} Table(s) ready at Kitchen Pass
                    </p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 bg-emerald-500 text-aura-obsidian font-black text-xs uppercase rounded-xl shadow-md">
                  Tap to Serve &rarr;
                </span>
              </div>
            )}

            {activePendingAlerts.length > 0 && (
              <div
                onClick={() => setActiveTab('WAITER_CALLS')}
                className="p-4 bg-rose-500/10 border border-rose-500/40 hover:border-rose-400 rounded-2xl flex items-center justify-between shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-rose-400 animate-bounce" />
                  <div>
                    <span className="font-bold text-xs text-rose-300 uppercase tracking-wider block">
                      Customer Call Alert!
                    </span>
                    <p className="text-xs text-aura-ivory font-bold">
                      {activePendingAlerts.length} Customer assistance call pending
                    </p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 bg-rose-500 text-white font-black text-xs uppercase rounded-xl shadow-md">
                  View Call &rarr;
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: 30-TABLE FLOOR GRID */}
        {activeTab === 'TABLE_STATUS' && (
          <div className="space-y-6">
            {/* Filters Toolbar */}
            <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Zone Filter Chips */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {['ALL', 'Main Hall', 'VIP Lounge', 'Outdoor Garden', 'Family Section'].map((zone) => (
                    <button
                      key={zone}
                      onClick={() => setSelectedZone(zone)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase whitespace-nowrap border cursor-pointer ${
                        selectedZone === zone
                          ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg font-black'
                          : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>

                {/* Table Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-aura-slate absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    placeholder="Search Table #..."
                    className="w-full pl-9 pr-3 py-2 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory placeholder:text-aura-slate/50 focus:outline-none focus:border-aura-gold font-mono"
                  />
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar border-t border-aura-border/50 pt-3">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-aura-gold/20 text-aura-gold border-aura-gold font-bold'
                      : 'bg-aura-obsidian text-aura-slate border-aura-border hover:text-aura-ivory'
                  }`}
                >
                  All 30 Tables ({totalTables})
                </button>

                <button
                  onClick={() => setStatusFilter('AVAILABLE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === 'AVAILABLE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold'
                      : 'bg-aura-obsidian text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                >
                  Available ({availableCount})
                </button>

                <button
                  onClick={() => setStatusFilter('OCCUPIED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === 'OCCUPIED'
                      ? 'bg-aura-gold/20 text-aura-gold border-aura-gold font-bold'
                      : 'bg-aura-obsidian text-aura-gold border-aura-gold/30 hover:bg-aura-gold/10'
                  }`}
                >
                  Occupied ({occupiedCount})
                </button>

                <button
                  onClick={() => setStatusFilter('READY')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === 'READY'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                      : 'bg-aura-obsidian text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                >
                  🔥 Food Ready ({readyToServeTables.length})
                </button>

                <button
                  onClick={() => setStatusFilter('BILLING')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    statusFilter === 'BILLING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                      : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                  }`}
                >
                  Bill Requested ({billingCount})
                </button>
              </div>
            </div>

            {/* 30 Table Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-aura-ivory flex items-center space-x-2">
                  <Grid className="w-5 h-5 text-aura-gold" />
                  <span>30 Tables Status & Seat Capacity</span>
                </h2>
                <span className="text-xs text-aura-gold font-mono font-bold">
                  Showing {filteredTables.length} of 30 Tables
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredTables.map((table) => (
                  <div
                    key={table.tableNumber}
                    onClick={() => setSelectedTable(table)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer hover:scale-[1.02] shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden ${getStatusBadgeStyle(
                      table.status,
                      table.orderStatus
                    )}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-2xl font-black">Table {table.tableNumber}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-current">
                          {table.orderStatus === 'ready' ? 'READY TO SERVE' : table.status}
                        </span>
                      </div>

                      {/* Seat Capacity & Seated Occupancy Badges */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 font-mono text-aura-ivory font-bold bg-aura-obsidian/70 px-2.5 py-1 rounded-xl border border-current/30">
                          <Users className="w-3.5 h-3.5 text-aura-gold" />
                          <span>Cap: {table.capacity}</span>
                        </div>

                        {table.status === 'occupied' || table.status === 'billing' ? (
                          <div className="flex items-center space-x-1 font-mono text-aura-gold font-black bg-aura-gold/20 px-2.5 py-1 rounded-xl border border-aura-gold/50 animate-pulse">
                            <Users className="w-3.5 h-3.5 text-aura-gold" />
                            <span>Seated: {table.guestCount || 2}/{table.capacity}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono opacity-80 px-2 py-0.5 rounded-lg border border-current/20">
                            {table.zone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active Order Details — only show for active tables */}
                    {table.activeOrderId && table.status !== 'available' && (
                      <div className="p-2.5 bg-aura-obsidian/70 rounded-xl border border-current/20 text-xs space-y-1 font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="opacity-70">Order</span>
                          <span className="font-bold">{table.activeOrderId}</span>
                        </div>

                        {table.orderTotal !== undefined && table.orderTotal > 0 && (
                          <div className="flex justify-between items-center text-xs font-bold text-aura-gold">
                            <span>Total</span>
                            <span>₹{table.orderTotal.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Mark Served if Hot Food is Ready */}
                    {table.orderStatus === 'ready' && table.activeOrderId && (
                      <button
                        onClick={(e) => handleMarkServed(e, table.activeOrderId!)}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-aura-obsidian font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Check className="w-4 h-4 font-bold" />
                        <span>Mark Food Served</span>
                      </button>
                    )}

                    {/* DIRECT 1-TAP STATUS SWITCHER TOOLBAR ON CARD */}
                    <div className="pt-3 border-t border-current/20 space-y-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider block opacity-70">
                        Quick Status Switch:
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={(e) => handleUpdateTableStatus(e, table._id, table.tableNumber, 'available')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                            table.status === 'available'
                              ? 'bg-emerald-500 text-aura-obsidian border-emerald-400 font-black shadow-md'
                              : 'bg-aura-obsidian/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                          title="Mark Available"
                        >
                          Avail
                        </button>

                        <button
                          onClick={(e) => handleUpdateTableStatus(e, table._id, table.tableNumber, 'occupied')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                            table.status === 'occupied'
                              ? 'bg-aura-gold text-aura-obsidian border-aura-gold font-black shadow-md'
                              : 'bg-aura-obsidian/80 text-aura-gold border-aura-gold/30 hover:bg-aura-gold/20'
                          }`}
                          title="Mark Occupied"
                        >
                          Dining
                        </button>

                        <button
                          onClick={(e) => handleUpdateTableStatus(e, table._id, table.tableNumber, 'billing')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                            table.status === 'available' || table.status === 'cleaning'
                              ? 'bg-aura-obsidian/40 text-amber-500/40 border-amber-500/20 cursor-not-allowed'
                              : table.status === 'billing'
                              ? 'bg-amber-500 text-aura-obsidian border-amber-400 font-black shadow-md cursor-pointer'
                              : 'bg-aura-obsidian/80 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer'
                          }`}
                          title={table.status === 'available' ? 'Cannot bill empty table' : 'Mark Bill Requested'}
                        >
                          Billing
                        </button>

                        <button
                          onClick={(e) => handleUpdateTableStatus(e, table._id, table.tableNumber, 'cleaning')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                            table.status === 'cleaning'
                              ? 'bg-slate-500 text-white border-slate-400 font-black shadow-md'
                              : 'bg-aura-obsidian/80 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                          }`}
                          title="Mark Cleaning"
                        >
                          Clean
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER WAITER ASSISTANCE CALLS */}
        {activeTab === 'WAITER_CALLS' && (
          <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl">
                  <Bell className="w-6 h-6 text-rose-400 animate-bounce" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-aura-ivory">Customer Assistance Calls</h2>
                  <p className="text-xs text-aura-slate">Live table waiter alerts from customer mobile apps</p>
                </div>
              </div>
              <span className="px-3.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-bold text-xs">
                {activePendingAlerts.length} Active Calls
              </span>
            </div>

            {activePendingAlerts.length === 0 ? (
              <div className="py-16 text-center text-aura-slate text-xs space-y-3 bg-aura-obsidian/40 border border-aura-border/40 rounded-2xl">
                <PhoneCall className="w-12 h-12 mx-auto text-aura-slate/40" />
                <p className="text-sm font-semibold text-aura-ivory">All Customers Attended!</p>
                <p className="text-xs text-aura-slate">No pending waiter assistance calls right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePendingAlerts.map((alert) => (
                  <div key={alert.id} className="p-5 bg-aura-obsidian border border-rose-500/40 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-black text-aura-ivory text-xl">Table {alert.tableId}</span>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                          URGENT
                        </span>
                      </div>

                      <p className="text-sm text-rose-300 font-bold flex items-center space-x-1.5">
                        <PhoneCall className="w-4 h-4 text-rose-400" />
                        <span>{alert.reason}</span>
                      </p>

                      <span className="text-[10px] text-aura-slate font-mono block">Requested: {alert.timestamp}</span>
                    </div>

                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Acknowledge & Resolve Call</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FOOD READY FOR SERVE */}
        {activeTab === 'FOOD_READY' && (
          <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
                  <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-aura-ivory">Kitchen Pickup Pass (Food Ready to Serve)</h2>
                  <p className="text-xs text-aura-slate">Dishes confirmed ready by head chef, waiting for waiter pickup</p>
                </div>
              </div>
              <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-xs">
                {readyToServeTables.length} Tables Ready
              </span>
            </div>

            {readyToServeTables.length === 0 ? (
              <div className="py-16 text-center text-aura-slate text-xs space-y-3 bg-aura-obsidian/40 border border-aura-border/40 rounded-2xl">
                <PackageCheck className="w-12 h-12 mx-auto text-aura-slate/40" />
                <p className="text-sm font-semibold text-aura-ivory">Kitchen Pass Clear!</p>
                <p className="text-xs text-aura-slate">No dishes currently waiting at the kitchen pass.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyToServeTables.map((tbl) => (
                  <div key={tbl._id} className="p-5 bg-aura-obsidian border border-emerald-500/40 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-black text-aura-ivory text-2xl">Table {tbl.tableNumber}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                          {tbl.zone}
                        </span>
                      </div>

                      <p className="text-xs text-emerald-300 font-bold flex items-center space-x-1.5">
                        <Flame className="w-4 h-4 text-emerald-400" />
                        <span>Order #{tbl.activeOrderId} Ready to Serve</span>
                      </p>

                      {/* Dish Items List */}
                      {tbl.items && tbl.items.length > 0 && (
                        <div className="space-y-1 bg-aura-container/60 p-2.5 rounded-xl border border-aura-border/40 text-xs">
                          <span className="text-[10px] font-mono text-aura-slate uppercase block">Ready Dishes:</span>
                          {tbl.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-aura-ivory font-bold">
                              <span>{item.quantity}x {item.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleMarkServed(e, tbl.activeOrderId!)}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-aura-obsidian font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 font-bold" />
                      <span>Confirm Dish Served to Guest</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BILL REQUESTS */}
        {activeTab === 'BILL_REQUESTS' && (
          <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
                  <Receipt className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-aura-ivory">Tables Awaiting Checkout Bill</h2>
                  <p className="text-xs text-aura-slate">Tables that requested final bill calculation</p>
                </div>
              </div>
              <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-xs">
                {billingTables.length} Tables Billing
              </span>
            </div>

            {billingTables.length === 0 ? (
              <div className="py-16 text-center text-aura-slate text-xs space-y-3 bg-aura-obsidian/40 border border-aura-border/40 rounded-2xl">
                <Clock className="w-12 h-12 mx-auto text-aura-slate/40" />
                <p className="text-sm font-semibold text-aura-ivory">No Checkout Requests!</p>
                <p className="text-xs text-aura-slate">No tables currently requesting checkout bills.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {billingTables.map((tbl) => (
                  <div key={tbl._id} className="p-5 bg-aura-obsidian border border-amber-500/40 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="space-y-2 font-mono">
                      <span className="font-serif font-black text-aura-ivory text-2xl">Table {tbl.tableNumber}</span>
                      <p className="text-sm text-amber-300 font-bold">
                        Bill Total: ₹{(tbl.orderTotal || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-aura-slate block">{tbl.zone}</span>
                    </div>

                    <button
                      onClick={() => setSelectedTable(tbl)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-aura-obsidian font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      View Details & Pay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Table Detail Modal / Drawer */}
      {selectedTable && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTable(null); }}
        >
          <div className="bg-aura-container border border-aura-border/80 rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col" style={{ maxHeight: 'calc(100vh - 96px)' }}>
            {/* Fixed header */}
            <div className="p-6 pb-0 flex-shrink-0">
            <button
              onClick={() => setSelectedTable(null)}
              className="absolute top-5 right-5 text-aura-slate hover:text-aura-ivory p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="font-serif text-2xl font-black text-aura-ivory">
                  Table {selectedTable.tableNumber}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadgeStyle(selectedTable.status, selectedTable.orderStatus)}`}>
                  {selectedTable.orderStatus === 'ready' ? 'READY TO SERVE' : selectedTable.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-aura-slate">{selectedTable.zone}</p>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-aura-slate">
                    <span className="text-aura-ivory font-bold">Max:</span> {selectedTable.capacity} seats
                  </span>
                  {(selectedTable.status === 'occupied' || selectedTable.status === 'billing') && (
                    <span className="px-2.5 py-0.5 bg-aura-gold/20 text-aura-gold font-black rounded-full border border-aura-gold/50">
                      👥 {selectedTable.guestCount || 2}/{selectedTable.capacity} Seated
                    </span>
                  )}
                </div>
              </div>
            </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6">

            {/* Quick Seating Action for Available Tables */}
            {selectedTable.status === 'available' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Seat Walk-In Guests</span>
                </span>
                
                <div className="flex items-center justify-between text-xs text-aura-slate">
                  <span>How many guests? (Max: {selectedTable.capacity})</span>
                  <div className="flex space-x-2">
                    {[2, 4, 6, 8].filter(n => n <= selectedTable.capacity).concat(
                      selectedTable.capacity > 8 ? [selectedTable.capacity] : []
                    ).map((num) => (
                      <button
                        key={num}
                        onClick={() => setSeatGuestCount(num)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
                          seatGuestCount === num
                            ? 'bg-emerald-500 text-aura-obsidian'
                            : 'bg-aura-obsidian text-aura-slate border border-aura-border'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSeatWalkInGuests(selectedTable._id, selectedTable.tableNumber)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-aura-obsidian font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm & Seat Guests
                </button>
              </div>
            )}

            {/* Digital Menu Link Launcher */}
            <div className="pt-2">
              <a
                href={`/table/${selectedTable.tableNumber}/menu`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-aura-obsidian border border-aura-border hover:border-aura-gold text-aura-gold text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                <QrCode className="w-4 h-4 text-aura-gold" />
                <span>Open Digital Menu for Table {selectedTable.tableNumber}</span>
                <ExternalLink className="w-3.5 h-3.5 text-aura-slate" />
              </a>
            </div>

            {/* Active Items */}
            {selectedTable.items && selectedTable.items.length > 0 && (
              <div className="space-y-2 border-t border-b border-aura-border/60 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block">
                    Active Dining Order ({selectedTable.activeOrderId})
                  </span>
                  {selectedTable.orderStatus && (
                    <span className="text-[10px] font-mono font-bold text-aura-gold uppercase">
                      Kitchen: {selectedTable.orderStatus}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTable.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs p-2.5 bg-aura-obsidian/60 border border-aura-border/40 rounded-xl">
                      <span className="font-bold text-aura-ivory">{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                </div>

                {selectedTable.orderTotal !== undefined && selectedTable.orderTotal > 0 && (
                  <div className="flex justify-between text-sm font-bold pt-2 text-aura-gold font-mono">
                    <span>Session Bill Total:</span>
                    <span>₹{selectedTable.orderTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Settlement Terminal — only when status is billing */}
            {selectedTable.status === 'billing' && selectedTable.orderTotal !== undefined && selectedTable.orderTotal > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 font-mono">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>SETTLE BILL & COLLECT PAYMENT</span>
                  </span>
                  <span className="text-xs font-mono font-black text-amber-400">
                    ₹{(selectedTable.orderTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block">
                    Select Payment Collection Method:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPaymentMethod('UPI_QR')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center space-y-1 ${
                        selectedPaymentMethod === 'UPI_QR'
                          ? 'bg-amber-500 text-aura-obsidian border-amber-400 font-black shadow-md'
                          : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>UPI QR</span>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('CARD_SWIPE')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center space-y-1 ${
                        selectedPaymentMethod === 'CARD_SWIPE'
                          ? 'bg-amber-500 text-aura-obsidian border-amber-400 font-black shadow-md'
                          : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Card POS</span>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('CASH')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center space-y-1 ${
                        selectedPaymentMethod === 'CASH'
                          ? 'bg-amber-500 text-aura-obsidian border-amber-400 font-black shadow-md'
                          : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Cash</span>
                    </button>
                  </div>
                </div>

                {/* Display Live UPI QR Code Image if UPI selected */}
                {selectedPaymentMethod === 'UPI_QR' && (
                  <div className="p-3 bg-white/95 rounded-2xl text-center space-y-2 text-aura-obsidian border border-amber-400/50 shadow-inner">
                    <span className="text-[10px] font-mono font-bold text-gray-700 uppercase block tracking-wider">
                      Scan UPI QR to Pay ₹{(selectedTable.orderTotal || 0).toLocaleString('en-IN')}
                    </span>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=aura.restaurant@upi%26pn=AURA%20Gastronomy%26am=${selectedTable.orderTotal || 0}%26cu=INR`}
                      alt="UPI Payment QR"
                      className="w-32 h-32 mx-auto rounded-xl shadow-md border border-gray-200"
                    />
                    <p className="text-[10px] text-gray-600 font-mono">Accepts GPay, PhonePe, Paytm, BHIM</p>
                  </div>
                )}

                <button
                  onClick={() => handleSettlePayment(selectedTable.tableNumber)}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-aura-obsidian font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4 font-bold" />
                  <span>{isProcessingPayment ? 'Processing Settlement...' : `Confirm Payment & Settle Bill (₹${(selectedTable.orderTotal || 0).toLocaleString('en-IN')})`}</span>
                </button>
              </div>
            )}

            {/* Mark Served Action if Order is Ready */}
            {selectedTable.orderStatus === 'ready' && selectedTable.activeOrderId && (
              <button
                onClick={(e) => handleMarkServed(e, selectedTable.activeOrderId!)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-aura-obsidian font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer animate-pulse"
              >
                <Check className="w-4 h-4" />
                <span>Mark Food Served to Guest</span>
              </button>
            )}

            {/* Quick Status Control Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block">
                Update Table Occupancy Status
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => handleUpdateTableStatus(e, selectedTable._id, selectedTable.tableNumber, 'available')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedTable.status === 'available'
                      ? 'bg-emerald-500 text-aura-obsidian border-emerald-400'
                      : 'bg-aura-obsidian text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                >
                  Set Available
                </button>

                <button
                  onClick={(e) => handleUpdateTableStatus(e, selectedTable._id, selectedTable.tableNumber, 'occupied')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedTable.status === 'occupied'
                      ? 'bg-aura-gold text-aura-obsidian border-aura-gold'
                      : 'bg-aura-obsidian text-aura-gold border-aura-gold/30 hover:bg-aura-gold/10'
                  }`}
                >
                  Set Occupied
                </button>

                <button
                  onClick={(e) => handleUpdateTableStatus(e, selectedTable._id, selectedTable.tableNumber, 'billing')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedTable.status === 'billing'
                      ? 'bg-amber-500 text-aura-obsidian border-amber-400'
                      : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                  }`}
                >
                  Set Billing
                </button>

                <button
                  onClick={(e) => handleUpdateTableStatus(e, selectedTable._id, selectedTable.tableNumber, 'cleaning')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedTable.status === 'cleaning'
                      ? 'bg-slate-500 text-white border-slate-400'
                      : 'bg-aura-obsidian text-slate-400 border-slate-500/30 hover:bg-slate-500/10'
                  }`}
                >
                  Set Cleaning
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedTable(null)}
              className="w-full py-3 bg-aura-obsidian border border-aura-border text-aura-slate font-bold text-xs uppercase rounded-xl hover:text-aura-ivory transition-all cursor-pointer flex-shrink-0"
            >
              Close Window
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

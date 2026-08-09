import React, { useState, useEffect, useRef } from 'react';
import { Flame, Clock, CheckCircle2, AlertCircle, RefreshCw, ChefHat, Filter, CheckSquare, Square, BellRing, BellOff, Sparkles, Lock, ArrowRight, Activity, Timer } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastContainer';
import { orderService } from '../../services/order.service';

interface KDSItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KDSTicket {
  id: string; // Order ID (e.g. ORD-1234)
  _id: string; // DB ID
  tableId: string;
  createdAt: string;
  status: 'received' | 'preparing' | 'ready' | 'completed';
  items: KDSItem[];
}

export const KitchenDisplayPage: React.FC = () => {
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'received' | 'preparing'>('ALL');
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Track individual item check state: `${ticketId}-${itemIndex}` -> boolean
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const prevTicketsRef = useRef<KDSTicket[]>([]);

  // Web Audio API Chime for New Order Notification
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

  const fetchActiveOrders = async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const data = await orderService.getActiveOrders();

      // Kitchen KDS shows active tickets needing kitchen preparation ('received' and 'preparing').
      const activeKitchenData = data.filter((ord: any) => ord.status === 'received' || ord.status === 'preparing');

      const newTicketList: KDSTicket[] = activeKitchenData.map((order: any) => ({
        id: order.orderId,
        _id: order._id,
        tableId: order.tableId,
        createdAt: order.createdAt,
        status: order.status,
        items: order.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          notes: i.notes,
        })),
      }));

      // Detect new incoming tickets
      if (prevTicketsRef.current.length > 0) {
        const prevIds = new Set(prevTicketsRef.current.map((t) => t.id));
        const newlyArrived = newTicketList.filter((t) => !prevIds.has(t.id));

        if (newlyArrived.length > 0) {
          playAudioChime();
          showToast(`🔔 ${newlyArrived.length} New Kitchen Ticket Received!`, 'success', 'New Kitchen Order');
        }
      }

      prevTicketsRef.current = newTicketList;
      setTickets(newTicketList);
      if (isManual) showToast('Kitchen KDS board synced', 'info');
    } catch (error) {
      console.error('Failed to fetch kitchen orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    const pollInterval = setInterval(() => fetchActiveOrders(false), 3000);
    const clockInterval = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'preparing');
      showToast(`Order #${orderId} accepted — cooking started!`, 'success');
      fetchActiveOrders();
    } catch (error) {
      showToast(`Failed to start order #${orderId}`, 'error');
    }
  };

  const handleConfirmAllReady = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'ready');
      showToast(`Order #${orderId} dispatched to service pass!`, 'success');
      fetchActiveOrders();
    } catch (error) {
      showToast(`Failed to confirm order #${orderId}`, 'error');
    }
  };

  const toggleItemDone = (ticketId: string, itemIndex: number) => {
    const key = `${ticketId}-${itemIndex}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getElapsedSeconds = (createdAt: string) => {
    const diffMs = Math.max(0, nowTimestamp - new Date(createdAt).getTime());
    return Math.floor(diffMs / 1000);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerBadgeStyle = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    if (mins < 8) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (mins < 15) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse';
  };

  const filteredTickets = tickets.filter(
    (t) => filterStatus === 'ALL' || t.status === filterStatus
  );

  const activeCount = tickets.length;
  const receivedCount = tickets.filter((t) => t.status === 'received').length;
  const preparingCount = tickets.filter((t) => t.status === 'preparing').length;
  const overdueCount = tickets.filter((t) => getElapsedSeconds(t.createdAt) > 900).length;

  // Current time display
  const now = new Date(nowTimestamp);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex h-full min-h-0 w-full font-sans text-aura-ivory">

      {/* ─────────────────────────────────────────────────────────────────
          LEFT SIDEBAR — Fixed, non-scrolling, full viewport height
      ───────────────────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 h-full flex flex-col bg-aura-container border-r border-aura-border/80 overflow-hidden">

        {/* Station Identity Header */}
        <div className="p-5 border-b border-aura-border/60 space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-aura-gold/10 border border-aura-gold/30 rounded-xl">
              <ChefHat className="w-6 h-6 text-aura-gold" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold text-aura-ivory leading-tight tracking-wide">
                KITCHEN DISPLAY
              </h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE — 3s Sync</span>
              </div>
            </div>
          </div>

          {/* Live Clock */}
          <div className="mt-3 p-3 bg-aura-obsidian/60 rounded-xl border border-aura-border/50 text-center">
            <p className="font-mono text-xl font-black text-aura-gold tracking-widest">{timeStr}</p>
            <p className="text-[10px] text-aura-slate font-mono mt-0.5">{dateStr}</p>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="p-4 space-y-2 border-b border-aura-border/60">
          <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block">Live Kitchen Stats</span>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-aura-obsidian/60 rounded-xl p-3 border border-aura-border/50 space-y-1">
              <span className="text-[9px] font-mono text-aura-slate uppercase block">Queue</span>
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl font-black text-aura-ivory">{activeCount}</span>
                <Activity className="w-4 h-4 text-aura-gold" />
              </div>
            </div>

            <div className="bg-aura-obsidian/60 rounded-xl p-3 border border-blue-500/30 space-y-1">
              <span className="text-[9px] font-mono text-blue-400/80 uppercase block">New</span>
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl font-black text-blue-400">{receivedCount}</span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            <div className="bg-aura-obsidian/60 rounded-xl p-3 border border-amber-500/30 space-y-1">
              <span className="text-[9px] font-mono text-amber-400/80 uppercase block">Cooking</span>
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl font-black text-amber-400">{preparingCount}</span>
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>

            <div className={`bg-aura-obsidian/60 rounded-xl p-3 border space-y-1 ${overdueCount > 0 ? 'border-rose-500/50' : 'border-aura-border/50'}`}>
              <span className="text-[9px] font-mono text-aura-slate uppercase block">Overdue</span>
              <div className="flex items-center justify-between">
                <span className={`font-serif text-xl font-black ${overdueCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {overdueCount}
                </span>
                <Timer className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="p-4 space-y-2 border-b border-aura-border/60">
          <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block">Filter Queue</span>

          <button
            onClick={() => setFilterStatus('ALL')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left border flex items-center justify-between ${
              filterStatus === 'ALL'
                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
            }`}
          >
            <span>All Active Queue</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${filterStatus === 'ALL' ? 'bg-aura-obsidian/20' : 'bg-aura-obsidian'}`}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('received')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left border flex items-center justify-between ${
              filterStatus === 'received'
                ? 'bg-blue-500 text-white border-blue-400 shadow-lg'
                : 'bg-aura-obsidian text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
            }`}
          >
            <span>New Orders</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${filterStatus === 'received' ? 'bg-blue-900/40' : 'bg-aura-obsidian'}`}>
              {receivedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('preparing')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left border flex items-center justify-between ${
              filterStatus === 'preparing'
                ? 'bg-amber-500 text-aura-obsidian border-amber-400 shadow-lg'
                : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <span>In Preparation</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${filterStatus === 'preparing' ? 'bg-amber-900/30' : 'bg-aura-obsidian'}`}>
              {preparingCount}
            </span>
          </button>
        </div>

        {/* Spacer pushes controls to bottom */}
        <div className="flex-1" />

        {/* Bottom Controls — always visible, pinned to bottom */}
        <div className="p-4 space-y-2 border-t border-aura-border/60">
          <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block">Station Controls</span>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-aura-obsidian text-aura-slate border-aura-border'
            }`}
          >
            {soundEnabled
              ? <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
              : <BellOff className="w-4 h-4 text-aura-slate" />
            }
            <span>{soundEnabled ? 'Audio Alerts ON' : 'Audio Muted'}</span>
          </button>

          <button
            onClick={() => fetchActiveOrders(true)}
            className="w-full px-4 py-2.5 bg-aura-obsidian border border-aura-border hover:border-aura-gold text-aura-slate hover:text-aura-gold rounded-xl transition-all flex items-center space-x-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-aura-gold' : ''}`} />
            <span>Sync Floor Plan</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          RIGHT PANEL — Scrollable ticket grid
      ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">

        {/* Top bar inside right panel */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-aura-ivory flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>
              {filterStatus === 'ALL' ? 'All Active Kitchen Tickets' :
               filterStatus === 'received' ? 'New Incoming Orders' : 'In Preparation'}
            </span>
          </h2>
          <span className="text-xs text-aura-slate font-mono">
            Showing {filteredTickets.length} ticket(s)
          </span>
        </div>

        {/* Ticket Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-aura-container/50 rounded-3xl animate-pulse border border-aura-border" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-aura-container/40 rounded-3xl border border-aura-border/60 p-8 max-w-md mx-auto shadow-2xl">
            <ChefHat className="w-12 h-12 text-aura-gold/40 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-aura-ivory">Kitchen Station Clear</h2>
            <p className="text-xs text-aura-slate leading-relaxed">
              No pending cooking tickets in the <span className="text-aura-gold font-bold uppercase">{filterStatus}</span> queue. All dishes dispatched!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const elapsedSecs = getElapsedSeconds(ticket.createdAt);
              const timerFormatted = formatTimer(elapsedSecs);
              const timerStyle = getTimerBadgeStyle(elapsedSecs);

              const checkedCount = ticket.items.filter(
                (_, idx) => checkedItems[`${ticket.id}-${idx}`]
              ).length;
              const totalItems = ticket.items.length;
              const isAllChecked = checkedCount === totalItems;

              return (
                <div
                  key={ticket.id}
                  className={`bg-aura-container border rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden ${
                    ticket.status === 'preparing'
                      ? isAllChecked
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-aura-container/95'
                        : 'border-amber-500/60 ring-1 ring-amber-500/20'
                      : 'border-aura-border hover:border-aura-gold/60'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Ticket Header Bar */}
                    <div className="flex items-center justify-between border-b border-aura-border/60 pb-3.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-2xl font-black text-aura-ivory">
                            Table {ticket.tableId}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              ticket.status === 'received'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {ticket.status === 'received' ? 'NEW ORDER' : 'IN PREP'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-aura-gold">
                          Order #{ticket.id}
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <div
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${timerStyle}`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timerFormatted}</span>
                        </div>
                        <span className="text-[10px] text-aura-slate block font-mono">
                          {new Date(ticket.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Item-Level Checklists */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-aura-slate font-mono uppercase tracking-wider px-1">
                        <span>Recipe Items ({totalItems})</span>
                        <span className={isAllChecked ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {checkedCount}/{totalItems} Checked
                        </span>
                      </div>

                      {ticket.items.map((item, idx) => {
                        const itemKey = `${ticket.id}-${idx}`;
                        const isDone = !!checkedItems[itemKey];

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (ticket.status !== 'received') {
                                toggleItemDone(ticket.id, idx);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all flex items-start justify-between space-x-2 ${
                              ticket.status === 'received'
                                ? 'bg-aura-obsidian/40 border-aura-border/40 text-aura-ivory cursor-not-allowed opacity-80'
                                : isDone
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 line-through cursor-pointer'
                                : 'bg-aura-obsidian border-aura-border/70 text-aura-ivory hover:border-aura-gold/60 cursor-pointer'
                            }`}
                          >
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 bg-aura-gold/20 text-aura-gold text-xs font-bold rounded-lg flex items-center justify-center font-mono">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-xs leading-snug">{item.name}</span>
                              </div>
                              {item.notes && (
                                <div className="flex items-center space-x-1 pt-1 text-[10px] text-amber-400 font-medium italic">
                                  <Flame className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                  <span>Note: {item.notes}</span>
                                </div>
                              )}
                            </div>

                            {ticket.status !== 'received' && (
                              <button className="text-aura-slate hover:text-aura-gold transition-colors mt-0.5">
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-aura-slate/50" />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workflow Execution Control Buttons */}
                  <div className="pt-3 border-t border-aura-border/60 space-y-2">
                    {/* Step 1: Accept Order Ticket */}
                    {ticket.status === 'received' && (
                      <button
                        onClick={() => handleAcceptOrder(ticket.id)}
                        className="w-full py-3.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-aura-gold/10 cursor-pointer"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Accept &amp; Start Cooking</span>
                      </button>
                    )}

                    {/* Step 2: In-Prep Protection Gate & Confirmation */}
                    {ticket.status === 'preparing' && (
                      <div className="space-y-2">
                        {!isAllChecked ? (
                          <div className="space-y-1.5">
                            <button
                              disabled
                              className="w-full py-3.5 bg-aura-obsidian border border-aura-border text-aura-slate font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 cursor-not-allowed opacity-65"
                            >
                              <Lock className="w-4 h-4 text-amber-400" />
                              <span>Check All Items ({checkedCount}/{totalItems})</span>
                            </button>
                            <p className="text-[10px] text-amber-400/90 text-center italic font-medium">
                              Check off all {totalItems} item(s) above to unlock confirm button
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirmAllReady(ticket.id)}
                            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-aura-obsidian font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-emerald-500/20 animate-pulse cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 font-bold" />
                            <span>Confirm All Dishes Ready &amp; Dispatch</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

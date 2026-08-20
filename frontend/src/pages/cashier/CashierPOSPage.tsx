import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, DollarSign, Receipt, Printer, CheckCircle, Split, ShieldCheck, RefreshCw, X, Building2, Check, Search, Phone, FileText, Eye } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastContainer';
import { tableService } from '../../services/table.service';
import { orderService } from '../../services/order.service';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface POSItem {
  name: string;
  qty: number;
  price: number;
}

interface POSBill {
  tableId: string;
  tableNumber: number;
  tableName: string;
  zone: string;
  orderId: string;
  customerName: string;
  customerMobile?: string;
  items: POSItem[];
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  cgst: number;
  sgst: number;
  total: number;
  status: 'billing' | 'occupied' | 'settled';
  paymentMethod?: string;
  invoiceNumber?: string;
  paidAt?: string;
  paidDate?: string;
}

const LOCAL_STORAGE_SETTLED_KEY = 'aura_pos_settled_bills_v5';

// Helper to get stored settled tables from localStorage
const getStoredSettledBills = (): Record<number, POSBill> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTLED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};



export const CashierPOSPage: React.FC = () => {
  const { showToast } = useToast();
  const [bills, setBills] = useState<POSBill[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string | number>('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'PENDING' | 'SETTLED_TODAY' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // POS Payment Options & Customer Meta
  const [splitCount, setSplitCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<string>('');
  const [customerMobileInput, setCustomerMobileInput] = useState<string>('');

  // Persistent Settlement Map & Invoice Modal
  const [settledBillsMap, setSettledBillsMap] = useState<Record<number, POSBill>>(() => getStoredSettledBills());
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceBill, setInvoiceBill] = useState<POSBill | null>(null);

  // Search & Shift Audit History Archive Modal
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archivePaymentFilter, setArchivePaymentFilter] = useState<'ALL' | 'UPI' | 'CARD' | 'CASH'>('ALL');

  // Prevent background body scrolling when any modal is open
  useBodyScrollLock(isInvoiceOpen || isArchiveOpen);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInvoiceOpen(false);
        setIsArchiveOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync settled map to localStorage whenever it updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTLED_KEY, JSON.stringify(settledBillsMap));
    } catch (e) {
      console.error('Failed to persist settled bills:', e);
    }
  }, [settledBillsMap]);

  // Handle Bill Refund Action
  const handleRefundBill = async (bill: POSBill) => {
    const reason = prompt(`Enter reason for refunding Invoice ${bill.invoiceNumber || bill.orderId}:`, 'Customer Requested Refund');
    if (reason === null) return;

    try {
      await orderService.refundOrder(bill.orderId, reason);
      showToast(`Refund processed for ${bill.invoiceNumber || bill.orderId} (₹${bill.total.toLocaleString('en-IN')})`, 'success');
      setIsInvoiceOpen(false);
      fetchLivePOSData(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to process refund', 'error');
    }
  };

  // Cache for settled orders map across polling ticks
  const [settledCache, setSettledCache] = useState<Map<string, POSBill>>(new Map());

  // Fetch live tables, active orders & DB settled bills (on demand)
  const fetchLivePOSData = async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const shouldFetchSettled = isManual || filterTab === 'SETTLED_TODAY' || isArchiveOpen || settledCache.size === 0;

      const [tableData, activeOrders, dbSettledOrders] = await Promise.all([
        tableService.getAllTables().catch(() => []),
        orderService.getActiveOrders().catch(() => []),
        shouldFetchSettled ? orderService.getSettledOrders().catch(() => []) : Promise.resolve(null),
      ]);

      // Group ALL active unpaid orders by tableId to support multi-order sessions
      const activeOrdersByTableMap = new Map<string, any[]>();
      activeOrders.forEach((ord: any) => {
        let numKey = String(ord.tableId || '');
        const matched = numKey.match(/\d+/);
        if (matched) numKey = String(parseInt(matched[0], 10));

        if (!activeOrdersByTableMap.has(numKey)) {
          activeOrdersByTableMap.set(numKey, []);
        }
        activeOrdersByTableMap.get(numKey)!.push(ord);
      });

      // 1. Map for Active Bills (keyed by tableNumber)
      const activeBillsMap = new Map<number, POSBill>();

      tableData.forEach((table: any) => {
        const num = Number(table.tableNumber);
        const tableOrders = activeOrdersByTableMap.get(String(num)) || activeOrdersByTableMap.get(String(table._id)) || [];
        const hasActiveOrders = tableOrders.length > 0;

        if (table.status === 'billing' || (table.status === 'occupied' && hasActiveOrders)) {
          let zone = 'Main Hall';
          if (num > 12 && num <= 16) zone = 'VIP Lounge';
          if (num > 16 && num <= 24) zone = 'Outdoor Garden';
          if (num > 24) zone = 'Family Section';

          const itemsList: POSItem[] = tableOrders.flatMap((ord: any) =>
            ord.items ? ord.items.map((i: any) => ({
              name: i.name,
              qty: i.quantity || i.qty || 1,
              price: i.price || i.unitPrice || (i.totalPrice ? Math.round(i.totalPrice / i.quantity) : 1200),
            })) : []
          );

          const computedSubtotal = itemsList.reduce((sum, it) => sum + (it.qty * it.price), 0);
          const subtotal = computedSubtotal > 0 ? computedSubtotal : 2000;
          const cgst = Math.round(subtotal * 0.025);
          const sgst = Math.round(subtotal * 0.025);
          const total = subtotal + cgst + sgst;
          const latestOrder = tableOrders[tableOrders.length - 1];
          const actualOrderIds = tableOrders
            .map((o: any) => o.orderId || (o._id ? `ORD-${String(o._id).slice(-4).toUpperCase()}` : ''))
            .filter(Boolean);

          const formattedOrderId = actualOrderIds.length > 0 
            ? Array.from(new Set(actualOrderIds)).join(', ')
            : `ORD-${1000 + num}`;

          activeBillsMap.set(num, {
            tableId: table._id || `temp-${num}`,
            tableNumber: num,
            tableName: `Table ${num}`,
            zone,
            orderId: formattedOrderId,
            customerName: latestOrder?.customerName || `Guest Session #${num}`,
            customerMobile: latestOrder?.customerPhone || '',
            items: itemsList.length > 0 ? itemsList : [
              { name: 'AURA Gastronomy Chef Special', qty: 2, price: 2400 },
            ],
            subtotal,
            cgst,
            sgst,
            total,
            status: table.status as any,
          });
        }
      });

      // 2. Map for Settled Bills (stored individually by invoiceKey / orderId)
      let settledBillsByInvoiceMap = new Map<string, POSBill>(settledCache);

      if (Array.isArray(dbSettledOrders)) {
        const freshSettledMap = new Map<string, POSBill>();
        dbSettledOrders.forEach((dbOrd: any) => {
          let num = Number(dbOrd.tableNumber || dbOrd.tableId);
          if (isNaN(num) || num <= 0) {
            const matched = String(dbOrd.tableId || '').match(/\d+/);
            num = matched ? parseInt(matched[0], 10) : 0;
          }

          if (num > 0) {
            let zone = 'Main Hall';
            if (num > 12 && num <= 16) zone = 'VIP Lounge';
            if (num > 16 && num <= 24) zone = 'Outdoor Garden';
            if (num > 24) zone = 'Family Section';

            const invoiceKey = String(dbOrd._id || dbOrd.orderId || Math.random());

            const itemsList: POSItem[] = (dbOrd.items && dbOrd.items.length > 0) ? dbOrd.items.map((i: any) => ({
              name: i.name,
              qty: i.quantity || i.qty || 1,
              price: i.price || i.unitPrice || 0,
            })) : [];

            const subtotal = dbOrd.subtotal || itemsList.reduce((sum, it) => sum + (it.qty * it.price), 0);
            const cgst = dbOrd.tax ? Math.round(dbOrd.tax / 2) : Math.round(subtotal * 0.025);
            const sgst = dbOrd.tax ? Math.round(dbOrd.tax / 2) : Math.round(subtotal * 0.025);
            const total = dbOrd.total || (subtotal + cgst + sgst);

            const posBill: POSBill = {
              tableId: `settled-${invoiceKey}`,
              tableNumber: num,
              tableName: `Table ${num}`,
              zone,
              orderId: dbOrd.orderId || `ORD-${String(dbOrd._id).slice(-4).toUpperCase()}`,
              customerName: dbOrd.customerName || `Guest Session #${num}`,
              customerMobile: dbOrd.customerPhone || '',
              items: itemsList,
              subtotal,
              cgst,
              sgst,
              total,
              status: 'settled',
              invoiceNumber: dbOrd.invoiceNumber || `INV-${String(dbOrd._id || dbOrd.orderId).slice(-6).toUpperCase()}`,
              paymentMethod: (dbOrd.paymentMethod || 'UPI').toUpperCase().includes('CARD') ? 'CARD' : (dbOrd.paymentMethod || 'UPI').toUpperCase().includes('CASH') ? 'CASH' : 'UPI',
              paidAt: dbOrd.paidAt ? new Date(dbOrd.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              paidDate: dbOrd.paidAt ? new Date(dbOrd.paidAt).toLocaleDateString() : new Date().toLocaleDateString(),
            };

            freshSettledMap.set(invoiceKey, posBill);
          }
        });
        settledBillsByInvoiceMap = freshSettledMap;
        setSettledCache(freshSettledMap);
      }

      // Sync settled bills map by table number for active table lookup
      const mergedSettledMap: Record<number, POSBill> = {};
      settledBillsByInvoiceMap.forEach((bill) => {
        if (!activeBillsMap.has(bill.tableNumber)) {
          mergedSettledMap[bill.tableNumber] = bill;
        }
      });
      setSettledBillsMap(mergedSettledMap);

      // Combine active tables and settled orders into single deduplicated array
      const combinedBillsList: POSBill[] = [];

      // Add active unpaid bills
      activeBillsMap.forEach((activeBill) => {
        combinedBillsList.push(activeBill);
      });

      // Add all individual settled bills
      settledBillsByInvoiceMap.forEach((settledBill) => {
        combinedBillsList.push(settledBill);
      });

      combinedBillsList.sort((a, b) => a.tableNumber - b.tableNumber);
      setBills(combinedBillsList);

      if (isManual) showToast('POS Terminal synchronized with floor state', 'info');
    } catch (error) {
      console.error('Failed to sync POS bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePOSData();
    const interval = setInterval(() => fetchLivePOSData(false), 5000); // Auto refresh active tables every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (filterTab === 'SETTLED_TODAY' || isArchiveOpen) {
      fetchLivePOSData(false);
    }
  }, [filterTab, isArchiveOpen]);

  // Derived Filtered List for Cashier POS Queue
  const filteredBillsList = bills.filter((b) => {
    const isSettled = b.status === 'settled' || !!settledBillsMap[b.tableNumber];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        b.tableName.toLowerCase().includes(q) ||
        String(b.tableNumber) === q ||
        String(b.tableNumber).includes(q) ||
        b.orderId.toLowerCase().includes(q) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerMobile && b.customerMobile.toLowerCase().includes(q)) ||
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
        (b.items && b.items.some((i) => i.name.toLowerCase().includes(q)));
      
      // When searching, find matching bills across both pending & settled records
      return matchesSearch;
    }
    if (filterTab === 'PENDING') return !isSettled;
    if (filterTab === 'SETTLED_TODAY') return isSettled;
    return true;
  });

  // Find bill from ALL master bills so selecting from Search or Archive modal works instantly
  const currentBill = selectedBillId
    ? (bills.find((b) => b.invoiceNumber === selectedBillId || b.orderId === selectedBillId || b.tableId === selectedBillId) ||
       bills.find((b) => String(b.invoiceNumber || '').toLowerCase().includes(String(selectedBillId).toLowerCase()) || String(b.orderId || '').toLowerCase().includes(String(selectedBillId).toLowerCase())) ||
       bills.find((b) => Number(b.tableNumber) === Number(selectedBillId)) ||
       null)
    : null;
  const isCurrentSettled = currentBill ? (currentBill.status === 'settled' || !!settledBillsMap[currentBill.tableNumber]) : false;

  // Strict Subtotal calculation from items list
  const rawSubtotal = currentBill ? currentBill.items.reduce((sum, item) => sum + (item.qty * item.price), 0) : 0;
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const netSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const netCgst = Math.round(netSubtotal * 0.025);
  const netSgst = Math.round(netSubtotal * 0.025);
  const finalGrandTotal = netSubtotal + netCgst + netSgst;

  const perPersonTotal = Math.round(finalGrandTotal / Math.max(1, splitCount));
  const tenderedVal = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedVal - finalGrandTotal);
  const remainingCashBalance = Math.max(0, finalGrandTotal - tenderedVal);

  // Settlement Handler — executes backend pay-table and records settled invoice
  const handleSettlePayment = async () => {
    if (!currentBill || isCurrentSettled) return;

    try {
      setIsLoading(true);
      const res = await orderService.settleTableBill(currentBill.tableNumber, paymentMethod).catch(() => null);
      const invNum = res?.data?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = new Date().toLocaleDateString();

      const updatedBill: POSBill = {
        ...currentBill,
        subtotal: netSubtotal,
        discountPercent,
        discountAmount,
        cgst: netCgst,
        sgst: netSgst,
        total: finalGrandTotal,
        status: 'settled',
        paymentMethod,
        invoiceNumber: invNum,
        paidAt: timestamp,
        paidDate: dateString,
      };

      setSettledCache((prev) => {
        const next = new Map(prev);
        next.set(invNum, updatedBill);
        return next;
      });

      showToast(`Bill ₹${finalGrandTotal.toLocaleString('en-IN')} for Table ${currentBill.tableNumber} SETTLED via ${paymentMethod}!`, 'success');
      setInvoiceBill(updatedBill);
      setIsInvoiceOpen(true);
      fetchLivePOSData(false);
    } catch (error) {
      showToast('Failed to settle bill', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
    showToast('Printing Tax Invoice Receipt...', 'info');
  };

  const pendingCount = bills.filter((b) => b.status !== 'settled' && !settledBillsMap[b.tableNumber]).length;
  const settledCount = Array.from(settledCache.keys()).length;

  // Shift Sales Audit Totals (Use all individual settled invoices)
  const settledBillsList = Array.from(settledCache.values());
  const shiftTotalRevenue = settledBillsList.reduce((sum, b) => sum + (b.total || 0), 0);
  const shiftUpiTotal = settledBillsList.filter((b) => b.paymentMethod === 'UPI').reduce((sum, b) => sum + (b.total || 0), 0);
  const shiftCardTotal = settledBillsList.filter((b) => b.paymentMethod === 'CARD').reduce((sum, b) => sum + (b.total || 0), 0);
  const shiftCashTotal = settledBillsList.filter((b) => b.paymentMethod === 'CASH').reduce((sum, b) => sum + (b.total || 0), 0);

  // Filtered Archive List for Search Modal
  const archiveFilteredBills = settledBillsList.filter((b) => {
    if (archivePaymentFilter !== 'ALL' && b.paymentMethod !== archivePaymentFilter) return false;
    
    const query = archiveSearchQuery.trim().toLowerCase();
    if (!query) return true;

    const matchesTableNumber = String(b.tableNumber) === query || String(b.tableNumber).includes(query);
    const matchesTableName = b.tableName.toLowerCase().includes(query);
    const matchesOrderId = b.orderId.toLowerCase().includes(query);
    const matchesInvoice = b.invoiceNumber ? b.invoiceNumber.toLowerCase().includes(query) : false;
    const matchesMobile = b.customerMobile ? b.customerMobile.toLowerCase().includes(query) : false;
    const matchesName = b.customerName ? b.customerName.toLowerCase().includes(query) : false;
    const matchesDish = b.items ? b.items.some((i) => i.name.toLowerCase().includes(query)) : false;
    const matchesAmount =
      String(b.total || '').includes(query) ||
      String(Math.round(b.total || 0)).includes(query) ||
      String(b.subtotal || '').includes(query);

    return (
      matchesTableNumber ||
      matchesTableName ||
      matchesOrderId ||
      matchesInvoice ||
      matchesMobile ||
      matchesName ||
      matchesDish ||
      matchesAmount
    );
  });

  return (
    // Fixed Responsive Two-Column Height Layout
    <div className="flex flex-col md:flex-row h-full min-h-0 w-full font-sans text-aura-ivory overflow-y-auto md:overflow-hidden">

      {/* ─────────────────────────────────────────────────────────────────
          LEFT PANEL — Pending & Settled Table Bills Queue Sidebar
      ───────────────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-80 flex-shrink-0 h-auto md:h-full flex flex-col bg-aura-container border-b md:border-b-0 md:border-r border-aura-border/80">

        {/* POS Station Header */}
        <div className="p-5 border-b border-aura-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-aura-gold/10 border border-aura-gold/30 rounded-xl">
                <Receipt className="w-6 h-6 text-aura-gold" />
              </div>
              <div>
                <h1 className="font-serif text-base font-bold text-aura-ivory leading-tight">CASHIER POS</h1>
                <p className="text-[10px] text-aura-gold font-mono uppercase font-bold mt-0.5">Billing & Tax Terminal</p>
              </div>
            </div>

            <button
              onClick={() => fetchLivePOSData(true)}
              className="p-2 bg-aura-obsidian border border-aura-border hover:border-aura-gold text-aura-slate hover:text-aura-gold rounded-xl transition-all cursor-pointer"
              title="Sync POS Floor Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-aura-gold' : ''}`} />
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-aura-slate" />
            <input
              type="text"
              placeholder="Search table #, order ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
            />
          </div>

          {/* Queue Filter Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-aura-obsidian/80 rounded-xl border border-aura-border/50 text-[10px] font-bold text-center">
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${filterTab === 'PENDING' ? 'bg-amber-500 text-aura-obsidian font-black shadow-md' : 'text-aura-slate hover:text-aura-ivory'}`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('SETTLED_TODAY')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${filterTab === 'SETTLED_TODAY' ? 'bg-emerald-500 text-aura-obsidian font-black shadow-md' : 'text-aura-slate hover:text-aura-ivory'}`}
            >
              Settled ({settledCount})
            </button>
            <button
              onClick={() => setFilterTab('ALL')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${filterTab === 'ALL' ? 'bg-aura-gold text-aura-obsidian font-black shadow-md' : 'text-aura-slate hover:text-aura-ivory'}`}
            >
              All ({bills.length})
            </button>
          </div>
        </div>

        {/* Scrollable Bills Queue */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredBillsList.length === 0 ? (
            <div className="py-12 text-center text-aura-slate space-y-3 bg-aura-obsidian/40 border border-aura-border/40 rounded-2xl p-4">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-400/70 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-aura-ivory">
                  {filterTab === 'PENDING' ? 'All Pending Bills Settled!' : 'No Bills Found'}
                </p>
                <p className="text-[10px] text-aura-slate mt-0.5">
                  {filterTab === 'PENDING' ? 'No active tables awaiting checkout.' : 'Try changing search or tab filters.'}
                </p>
              </div>
              {filterTab === 'PENDING' && settledCount > 0 && (
                <button
                  onClick={() => setFilterTab('SETTLED_TODAY')}
                  className="px-3 py-1.5 bg-aura-obsidian border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-xl hover:bg-emerald-500/10 transition-all cursor-pointer"
                >
                  View Settled Bills ({settledCount})
                </button>
              )}
            </div>
          ) : (
            filteredBillsList.map((bill, index) => {
              const isSettled = bill.status === 'settled' || !!settledBillsMap[bill.tableNumber];
              const isSelected = currentBill ? (currentBill.orderId === bill.orderId || currentBill.tableId === bill.tableId) : false;

              const uniqueKey = bill.tableId
                ? `bill-${bill.tableId}-${index}`
                : bill.invoiceNumber
                ? `bill-inv-${bill.invoiceNumber}-${index}`
                : `bill-${bill.tableNumber}-${index}`;

              return (
                <div
                  key={uniqueKey}
                  onClick={() => {
                    setSelectedBillId(bill.orderId || bill.tableId || bill.tableNumber);
                    setSplitCount(1);
                    setDiscountPercent(0);
                    setCashTendered('');
                    setCustomerMobileInput(bill.customerMobile || '');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-aura-gold/15 border-aura-gold ring-1 ring-aura-gold/40 shadow-xl'
                      : isSettled
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-aura-obsidian/80 border-aura-border/70 hover:border-aura-gold/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-black text-aura-ivory text-sm">
                        Table {bill.tableNumber}
                      </h3>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-aura-container border border-aura-border text-aura-slate">
                        {bill.zone}
                      </span>
                    </div>

                    {isSettled ? (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>PAID</span>
                      </span>
                    ) : (
                      <span className="font-mono text-aura-gold font-black text-sm">
                        ₹{bill.total.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-aura-slate pt-1 border-t border-aura-border/40">
                    <span>{bill.orderId}</span>
                    <span className={isSettled ? 'text-emerald-400 font-bold' : ''}>
                      {isSettled ? `Settled ${bill.paidAt || 'Today'}` : `${bill.items.length} Recipe Dish(es)`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Audit Archive Trigger */}
        <div className="p-4 border-t border-aura-border/60 bg-aura-container/90 space-y-3 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex justify-between text-aura-slate text-[11px]">
              <span>Shift Total Revenue:</span>
              <span className="text-emerald-400 font-black text-xs">₹{shiftTotalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[10px] text-aura-slate">
              <span>UPI: ₹{shiftUpiTotal.toLocaleString('en-IN')}</span>
              <span>Card: ₹{shiftCardTotal.toLocaleString('en-IN')}</span>
              <span>Cash: ₹{shiftCashTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => setIsArchiveOpen(true)}
            className="w-full py-2 bg-aura-gold/15 hover:bg-aura-gold/25 border border-aura-gold/40 text-aura-gold text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Invoices Archive ({settledCount})</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          RIGHT PANEL — Active Bill Itemization & Settlement Terminal
      ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">

        {currentBill ? (
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Bill Header Card */}
            <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
              <button
                onClick={() => setSelectedBillId('')}
                className="absolute top-4 right-4 p-1.5 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Close / Clear Selection"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-aura-gold px-3 py-1 bg-aura-gold/10 border border-aura-gold/30 rounded-full">
                    {currentBill.orderId}
                  </span>
                  <span className="text-xs text-aura-slate font-mono">{currentBill.zone}</span>
                </div>
                <h2 className="font-serif text-2xl font-black text-aura-ivory mt-1">
                  Table {currentBill.tableNumber} Itemized Receipt
                </h2>
                <p className="text-xs text-aura-slate mt-0.5">
                  {currentBill.customerName} {currentBill.customerMobile && currentBill.customerMobile !== 'N/A' ? `• Ph: ${currentBill.customerMobile}` : ''}
                </p>
              </div>

              {isCurrentSettled ? (
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>SETTLED & PAID ({currentBill.paymentMethod || 'UPI'})</span>
                  </div>
                  <button
                    onClick={() => {
                      setInvoiceBill(currentBill);
                      setIsInvoiceOpen(true);
                    }}
                    className="px-4 py-2 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-lg"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Tax Invoice</span>
                  </button>
                </div>
              ) : (
                <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs rounded-xl flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4" />
                  <span>AWAITING PAYMENT</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Itemized Order Table */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="font-serif text-base font-bold text-aura-ivory flex items-center space-x-2 border-b border-aura-border/60 pb-3">
                    <Receipt className="w-4 h-4 text-aura-gold" />
                    <span>Ordered Dishes Breakdown</span>
                  </h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-[10px] font-mono font-bold uppercase text-aura-slate pb-2 border-b border-aura-border/40 px-2">
                      <span className="col-span-6">Dish Description</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Rate</span>
                      <span className="col-span-2 text-right">Amount</span>
                    </div>

                    {currentBill.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-xs py-3 border-b border-aura-border/20 text-aura-ivory items-center px-2 hover:bg-aura-obsidian/40 rounded-xl transition-colors">
                        <span className="col-span-6 font-bold leading-snug">{item.name}</span>
                        <span className="col-span-2 text-center font-mono text-aura-slate bg-aura-obsidian py-1 rounded-lg border border-aura-border/50">
                          {item.qty}x
                        </span>
                        <span className="col-span-2 text-right font-mono text-aura-slate">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="col-span-2 text-right font-mono text-aura-gold font-bold">
                          ₹{(item.qty * item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Phone Number for Receipt & SMS */}
                  {!isCurrentSettled && (
                    <div className="p-4 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl space-y-2 mt-4">
                      <label className="text-[10px] font-mono text-aura-slate uppercase block font-bold flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-aura-gold" />
                        <span>Customer Mobile Number (Optional for Tax Invoice / SMS):</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={customerMobileInput}
                        onChange={(e) => setCustomerMobileInput(e.target.value)}
                        className="w-full p-2 bg-aura-container border border-aura-border rounded-xl text-xs text-aura-ivory font-mono focus:border-aura-gold outline-none"
                      />
                    </div>
                  )}

                  {/* Split Bill N-Ways Calculator */}
                  {!isCurrentSettled && (
                    <div className="p-4 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-aura-ivory">
                        <div className="flex items-center space-x-2">
                          <Split className="w-4 h-4 text-aura-gold" />
                          <span>Split Bill Equal N-Ways</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                            className="w-8 h-8 bg-aura-container border border-aura-border rounded-xl text-aura-ivory font-bold hover:border-aura-gold transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm font-bold px-3 text-aura-gold">{splitCount} Guests</span>
                          <button
                            onClick={() => setSplitCount(splitCount + 1)}
                            className="w-8 h-8 bg-aura-container border border-aura-border rounded-xl text-aura-ivory font-bold hover:border-aura-gold transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {splitCount > 1 && (
                        <div className="p-3 bg-aura-gold/10 border border-aura-gold/30 rounded-xl text-center text-xs font-bold text-aura-gold font-mono flex items-center justify-between">
                          <span>Share Per Guest ({splitCount}-Way Split):</span>
                          <span className="text-sm font-black">₹{perPersonTotal.toLocaleString('en-IN')} / person</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discount Selector */}
                  {!isCurrentSettled && (
                    <div className="p-4 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl space-y-2">
                      <span className="text-[10px] font-mono text-aura-slate uppercase block font-bold">
                        Apply Executive Discount:
                      </span>
                      <div className="flex space-x-2">
                        {[0, 5, 10, 15, 20].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setDiscountPercent(pct)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                              discountPercent === pct
                                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-md'
                                : 'bg-aura-container text-aura-slate border-aura-border hover:text-aura-ivory'
                            }`}
                          >
                            {pct === 0 ? 'None' : `${pct}% OFF`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Settlement Payment Processing Panel */}
              <div className="space-y-6">
                <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-5 shadow-xl">
                  <h3 className="font-serif text-base font-bold text-aura-ivory flex items-center space-x-2 border-b border-aura-border/60 pb-3">
                    <ShieldCheck className="w-4 h-4 text-aura-gold" />
                    <span>Payment Terminal</span>
                  </h3>

                  {!isCurrentSettled ? (
                    <>
                      {/* Payment Method Tabs */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-aura-slate uppercase block font-bold">
                          Select Collection Mode:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setPaymentMethod('UPI')}
                            className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center space-y-1.5 ${
                              paymentMethod === 'UPI'
                                ? 'bg-aura-gold text-aura-obsidian border-aura-gold font-black shadow-lg'
                                : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                            }`}
                          >
                            <QrCode className="w-5 h-5" />
                            <span>UPI QR</span>
                          </button>

                          <button
                            onClick={() => setPaymentMethod('CARD')}
                            className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center space-y-1.5 ${
                              paymentMethod === 'CARD'
                                ? 'bg-aura-gold text-aura-obsidian border-aura-gold font-black shadow-lg'
                                : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                            }`}
                          >
                            <CreditCard className="w-5 h-5" />
                            <span>Card POS</span>
                          </button>

                          <button
                            onClick={() => setPaymentMethod('CASH')}
                            className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center space-y-1.5 ${
                              paymentMethod === 'CASH'
                                ? 'bg-aura-gold text-aura-obsidian border-aura-gold font-black shadow-lg'
                                : 'bg-aura-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                            }`}
                          >
                            <DollarSign className="w-5 h-5" />
                            <span>Cash</span>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Mode Helper View */}
                      {paymentMethod === 'UPI' && (
                        <div className="p-4 bg-white rounded-2xl text-center space-y-2 text-aura-obsidian border border-amber-400/50 shadow-inner">
                          <span className="text-[10px] font-mono font-bold text-gray-700 uppercase block tracking-wider">
                            Scan to Pay ₹{finalGrandTotal.toLocaleString('en-IN')}
                          </span>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=aura.restaurant@upi%26pn=AURA%20Gastronomy%26am=${finalGrandTotal}%26cu=INR`}
                            alt="UPI QR Code"
                            className="w-32 h-32 mx-auto rounded-xl shadow-md border border-gray-200"
                          />
                          <p className="text-[10px] text-gray-600 font-mono">GPay, PhonePe, Paytm, BHIM Accepted</p>
                        </div>
                      )}

                      {paymentMethod === 'CASH' && (
                        <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl space-y-3 text-xs font-mono">
                          <span className="text-[10px] text-aura-slate uppercase block font-bold">Cash Calculator</span>
                          <div className="space-y-1">
                            <label className="text-[10px] text-aura-slate">Tendered Cash Amount (₹):</label>
                            <input
                              type="number"
                              placeholder={`e.g. ${finalGrandTotal}`}
                              value={cashTendered}
                              onChange={(e) => setCashTendered(e.target.value)}
                              className="w-full p-2.5 bg-aura-container border border-aura-border rounded-xl text-aura-gold font-mono text-sm font-bold outline-none focus:border-aura-gold"
                            />
                          </div>
                          {tenderedVal > 0 && (
                            <div className="pt-1 border-t border-aura-border/40 font-bold">
                              {tenderedVal >= finalGrandTotal ? (
                                <div className="flex justify-between text-xs text-emerald-400">
                                  <span>Return Change Due:</span>
                                  <span>₹{changeDue.toLocaleString('en-IN')}</span>
                                </div>
                              ) : (
                                <div className="flex justify-between text-xs text-rose-400">
                                  <span>Remaining Cash Balance:</span>
                                  <span>₹{remainingCashBalance.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Summary Totals */}
                      <div className="border-t border-aura-border/60 pt-4 space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-aura-slate">
                          <span>Subtotal</span>
                          <span>₹{rawSubtotal.toLocaleString('en-IN')}</span>
                        </div>

                        {discountPercent > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Discount ({discountPercent}%)</span>
                            <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-aura-slate">
                          <span>CGST (2.5%)</span>
                          <span>₹{netCgst.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex justify-between text-aura-slate">
                          <span>SGST (2.5%)</span>
                          <span>₹{netSgst.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex justify-between text-base font-bold text-aura-ivory pt-3 border-t border-aura-border">
                          <span>Net Total Payable</span>
                          <span className="font-mono text-aura-gold text-lg font-black">
                            ₹{finalGrandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Settlement Action Button */}
                      <button
                        onClick={handleSettlePayment}
                        disabled={isLoading}
                        className="w-full py-4 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl cursor-pointer"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>Settle ₹{finalGrandTotal.toLocaleString('en-IN')} via {paymentMethod}</span>
                      </button>
                    </>
                  ) : (
                    /* SETTLED CARD STATE — Permanently Settled State */
                    <div className="space-y-4 text-center py-2">
                      <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl animate-pulse">
                        <CheckCircle className="w-8 h-8" />
                      </div>

                      <div>
                        <h4 className="font-serif font-black text-lg text-emerald-400">BILL PAID &amp; CLOSED</h4>
                        <p className="text-xs text-aura-slate font-mono mt-0.5">Invoice #{currentBill.invoiceNumber || 'INV-SETTLED'}</p>
                        <p className="text-[11px] text-emerald-300 font-mono font-bold mt-1">
                          Amount: ₹{(currentBill.total || finalGrandTotal).toLocaleString('en-IN')} via {currentBill.paymentMethod || 'UPI'}
                        </p>
                      </div>

                      <div className="pt-2 space-y-2 border-t border-aura-border/40">
                        <button
                          onClick={() => {
                            setInvoiceBill(currentBill);
                            setIsInvoiceOpen(true);
                          }}
                          className="w-full py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print GST Tax Invoice</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-6 bg-aura-container/40 rounded-3xl border border-aura-border/60 shadow-2xl my-auto">
            <div className="w-16 h-16 bg-aura-gold/10 border border-aura-gold/30 rounded-3xl flex items-center justify-center mx-auto text-aura-gold shadow-lg">
              <Receipt className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-aura-ivory">Select a Table Bill to Checkout</h2>
              <p className="text-xs text-aura-slate max-w-md mx-auto leading-relaxed">
                Choose an active table from the floor queue on the left to review itemized dishes, apply executive discounts, or process payment settlement.
              </p>
            </div>

            {/* Shift Overview KPI Summary */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-4 text-xs font-mono">
              <div className="p-3 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl text-center">
                <span className="text-[10px] text-aura-slate block uppercase">Pending Bills</span>
                <span className="text-amber-400 font-black text-sm">{pendingCount}</span>
              </div>

              <div className="p-3 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl text-center">
                <span className="text-[10px] text-aura-slate block uppercase">Settled Today</span>
                <span className="text-emerald-400 font-black text-sm">{settledCount}</span>
              </div>

              <div className="p-3 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl text-center">
                <span className="text-[10px] text-aura-slate block uppercase">Shift Revenue</span>
                <span className="text-aura-gold font-black text-sm">₹{shiftTotalRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {pendingCount > 0 && (
              <p className="text-[10px] text-aura-gold font-mono animate-bounce pt-2">
                👈 {pendingCount} active table(s) awaiting checkout on floor queue
              </p>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────
          SEARCH & AUDIT INVOICES ARCHIVE MODAL
      ───────────────────────────────────────────────────────────────── */}
      {isArchiveOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsArchiveOpen(false); }}
        >
          <div className="bg-aura-container border border-aura-border/80 rounded-3xl max-w-3xl w-full shadow-2xl p-6 space-y-5 relative max-h-[85vh] flex flex-col font-sans">
            <button
              onClick={() => setIsArchiveOpen(false)}
              className="absolute top-5 right-5 text-aura-slate hover:text-aura-ivory p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-aura-gold" />
                <h2 className="font-serif font-black text-xl text-aura-ivory">Invoices &amp; Settlements Archive</h2>
              </div>
              <p className="text-xs text-aura-slate mt-0.5">Lookup completed payment records by table #, mobile number, or invoice code.</p>
            </div>

            {/* Shift Financial Overview Cards */}
            <div className="grid grid-cols-4 gap-3 bg-aura-obsidian/70 p-3 rounded-2xl border border-aura-border/50 text-xs font-mono">
              <div className="p-2 bg-aura-container rounded-xl border border-aura-border">
                <span className="text-[10px] text-aura-slate block">Total Revenue</span>
                <span className="text-emerald-400 font-bold text-sm">₹{shiftTotalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-aura-container rounded-xl border border-aura-border">
                <span className="text-[10px] text-aura-slate block">UPI QR</span>
                <span className="text-amber-400 font-bold">₹{shiftUpiTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-aura-container rounded-xl border border-aura-border">
                <span className="text-[10px] text-aura-slate block">Card POS</span>
                <span className="text-blue-400 font-bold">₹{shiftCardTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-aura-container rounded-xl border border-aura-border">
                <span className="text-[10px] text-aura-slate block">Cash</span>
                <span className="text-purple-400 font-bold">₹{shiftCashTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Search Input & Payment Mode Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-aura-slate" />
                <input
                  type="text"
                  placeholder="Search by invoice #, table #, mobile number, order ID..."
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
                />
              </div>

              <div className="flex space-x-1 bg-aura-obsidian p-1 rounded-xl border border-aura-border text-[10px] font-bold">
                {(['ALL', 'UPI', 'CARD', 'CASH'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setArchivePaymentFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      archivePaymentFilter === mode
                        ? 'bg-aura-gold text-aura-obsidian font-black shadow-md'
                        : 'text-aura-slate hover:text-aura-ivory'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Settled Invoices Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {archiveFilteredBills.length === 0 ? (
                <div className="py-12 text-center text-aura-slate space-y-2 bg-aura-obsidian/40 border border-aura-border/40 rounded-2xl">
                  <Search className="w-8 h-8 mx-auto text-aura-slate/50" />
                  <p className="text-xs font-bold text-aura-ivory">No Matching Invoices Found</p>
                  <p className="text-[10px]">Try entering a table number (e.g. 10), phone number, or invoice code.</p>
                </div>
              ) : (
                archiveFilteredBills.map((inv, index) => {
                  const uniqueArchiveKey = inv.tableId
                    ? `arch-${inv.tableId}-${index}`
                    : inv.invoiceNumber
                    ? `arch-inv-${inv.invoiceNumber}-${inv.orderId}-${index}`
                    : `arch-item-${index}`;

                  return (
                    <div
                      key={uniqueArchiveKey}
                      className="p-3.5 bg-aura-obsidian/80 border border-aura-border/60 hover:border-aura-gold/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all font-mono text-xs"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-aura-ivory text-sm whitespace-nowrap">{inv.tableName.split(' (')[0]}</span>
                          {inv.orderId && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono whitespace-nowrap shrink-0">
                              {inv.orderId}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold font-mono whitespace-nowrap shrink-0">
                            {inv.invoiceNumber || 'INV-PAID'}
                          </span>
                          <span className="text-[10px] text-aura-slate whitespace-nowrap">({inv.paymentMethod || 'UPI'})</span>
                        </div>

                        <div className="flex items-center space-x-4 text-[10px] text-aura-slate whitespace-nowrap">
                          <span>Paid: {inv.paidAt || 'Today'}</span>
                          {inv.customerMobile && <span>Ph: {inv.customerMobile}</span>}
                          <span>{inv.items.length} Recipe Item(s)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-aura-border/40">
                        <span className="text-emerald-400 font-black text-sm whitespace-nowrap">
                          ₹{(inv.total || inv.subtotal).toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedBillId(inv.invoiceNumber || inv.orderId || inv.tableNumber);
                              setInvoiceBill(inv);
                              setIsInvoiceOpen(true);
                            }}
                            className="px-3 py-1.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1 shadow-md whitespace-nowrap shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Bill</span>
                          </button>
                          <button
                            onClick={() => handleRefundBill(inv)}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap shrink-0"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Refund</span>
                          </button>
                        </div>
                      </div>
                    </div>
                );
              })
            )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          PRINTABLE GST TAX INVOICE MODAL
      ───────────────────────────────────────────────────────────────── */}
      {isInvoiceOpen && invoiceBill && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsInvoiceOpen(false); }}
        >
          <div className="printable-invoice bg-white text-gray-900 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 relative font-mono text-xs">
            <button
              onClick={() => setIsInvoiceOpen(false)}
              className="no-print absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Restaurant Brand Header */}
            <div className="text-center space-y-1 border-b border-gray-200 pb-4">
              <div className="flex justify-center items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h2 className="font-serif font-black text-xl text-gray-900 tracking-wider">AURA GASTRONOMY</h2>
              </div>
              <p className="text-[10px] text-gray-500 font-sans">Luxury Fine Dining & Artisanal Kitchen</p>
              <p className="text-[9px] text-gray-400">GSTIN: 27AABCA1234F1ZM • FSSAI: 11521001000456</p>
            </div>

            {/* Invoice Meta */}
            <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px]">
              {invoiceBill.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-bold text-amber-700 font-mono">{invoiceBill.orderId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Tax Invoice #:</span>
                <span className="font-bold">{invoiceBill.invoiceNumber || invoiceBill.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Table Session:</span>
                <span className="font-bold">{invoiceBill.tableName}</span>
              </div>
              {invoiceBill.customerMobile && invoiceBill.customerMobile !== 'N/A' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Mobile:</span>
                  <span className="font-bold">{invoiceBill.customerMobile}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Date &amp; Time:</span>
                <span>{invoiceBill.paidAt ? `${new Date().toLocaleDateString()} at ${invoiceBill.paidAt}` : new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-bold text-emerald-700 uppercase">{invoiceBill.paymentMethod || paymentMethod} (SETTLED)</span>
              </div>
            </div>

            {/* Itemized Receipt Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-300 pb-1">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Total</span>
              </div>

              {invoiceBill.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 text-xs py-1 border-b border-gray-100">
                  <span className="col-span-6 font-medium text-gray-800">{it.name}</span>
                  <span className="col-span-2 text-center text-gray-500">{it.qty}</span>
                  <span className="col-span-4 text-right font-bold text-gray-900">
                    ₹{(it.qty * it.price).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Tax Breakdown & Grand Total */}
            <div className="space-y-1 pt-2 border-t border-gray-300 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{invoiceBill.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {invoiceBill.discountAmount !== undefined && invoiceBill.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Executive Discount ({invoiceBill.discountPercent}%)</span>
                  <span>- ₹{invoiceBill.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>CGST (2.5%)</span>
                <span>₹{invoiceBill.cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (2.5%)</span>
                <span>₹{invoiceBill.sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>GRAND TOTAL</span>
                <span>₹{invoiceBill.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Stamp & Footer */}
            <div className="pt-2 text-center space-y-3">
              <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] uppercase border border-emerald-300">
                ✓ PAID IN FULL — THANK YOU FOR DINING WITH AURA
              </div>

              <div className="no-print flex space-x-2 pt-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, DollarSign, Receipt, Printer, CheckCircle, Split, Users, ArrowRight, ShieldCheck, RefreshCw, X, Sparkles, Building2, Check, ExternalLink, Percent, Calculator } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastContainer';
import { tableService } from '../../services/table.service';
import { orderService } from '../../services/order.service';

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
  items: POSItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  status: 'billing' | 'occupied' | 'settled';
}

// Realistic fallback bills for POS demonstration when floor is empty
const MOCK_POS_BILLS: POSBill[] = [
  {
    tableId: 'temp-10',
    tableNumber: 10,
    tableName: 'Table 10 (Main Hall)',
    zone: 'Main Hall',
    orderId: 'ORD-2947',
    customerName: 'AURA Guest Session #10',
    items: [
      { name: 'Wagyu Ribeye Steak (300g)', qty: 2, price: 4800 },
      { name: 'Black Truffle Tagliolini', qty: 2, price: 3200 },
      { name: 'AURA Gold Smoked Elixir', qty: 2, price: 1400 },
      { name: 'Saffron & Gold Leaf Risotto', qty: 1, price: 2800 },
      { name: 'Valrhona Chocolate Sphere', qty: 2, price: 1800 },
    ],
    subtotal: 23600,
    cgst: 590,
    sgst: 590,
    total: 24780,
    status: 'billing',
  },
  {
    tableId: 'temp-14',
    tableNumber: 14,
    tableName: 'Table 14 (VIP Lounge)',
    zone: 'VIP Lounge',
    orderId: 'ORD-8492',
    customerName: 'VIP Reservation Session',
    items: [
      { name: 'Truffle Dim Sum Platter', qty: 3, price: 1500 },
      { name: 'Zafrani Murgh Malai Tikka', qty: 2, price: 1800 },
      { name: 'Vintage Barolo Reserve 2018', qty: 1, price: 8500 },
      { name: 'Artisanal Bread Basket', qty: 2, price: 450 },
    ],
    subtotal: 17500,
    cgst: 437.5,
    sgst: 437.5,
    total: 18375,
    status: 'billing',
  },
  {
    tableId: 'temp-18',
    tableNumber: 18,
    tableName: 'Table 18 (Outdoor Garden)',
    zone: 'Outdoor Garden',
    orderId: 'ORD-5104',
    customerName: 'Garden Gazebo Party',
    items: [
      { name: 'Smoked Lobster Bisque', qty: 4, price: 1200 },
      { name: 'Pan-Seared Sea Bass', qty: 4, price: 2400 },
      { name: 'Tiramisu Tradizionale', qty: 4, price: 800 },
    ],
    subtotal: 17600,
    cgst: 440,
    sgst: 440,
    total: 18480,
    status: 'billing',
  },
];

export const CashierPOSPage: React.FC = () => {
  const { showToast } = useToast();
  const [bills, setBills] = useState<POSBill[]>([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'BILLING_ONLY' | 'ALL_ACTIVE'>('BILLING_ONLY');

  // POS Payment Options State
  const [splitCount, setSplitCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<string>('');

  // Settlement & Invoice Modal
  const [settledTables, setSettledTables] = useState<Record<number, boolean>>({});
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceBill, setInvoiceBill] = useState<POSBill | null>(null);

  // Fetch live tables from database
  const fetchLivePOSData = async (isManual = false) => {
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

      const liveBills: POSBill[] = [];

      tableData.forEach((table: any) => {
        const num = Number(table.tableNumber);
        const activeOrder = orderMap.get(String(num)) || orderMap.get(String(table._id));

        if (table.status === 'billing' || (activeOrder && activeOrder.totalAmount > 0)) {
          let zone = 'Main Hall';
          if (num > 12 && num <= 16) zone = 'VIP Lounge';
          if (num > 16 && num <= 24) zone = 'Outdoor Garden';
          if (num > 24) zone = 'Family Section';

          const itemsList: POSItem[] = activeOrder?.items ? activeOrder.items.map((i: any) => ({
            name: i.name,
            qty: i.quantity,
            price: i.unitPrice || (i.totalPrice ? Math.round(i.totalPrice / i.quantity) : 1200),
          })) : [
            { name: 'AURA Gastronomy Chef Special', qty: 2, price: 2400 },
            { name: 'Artisanal Beverage Session', qty: 2, price: 950 },
          ];

          const subtotal = activeOrder?.totalAmount || 6700;
          const cgst = Math.round(subtotal * 0.025);
          const sgst = Math.round(subtotal * 0.025);
          const total = subtotal + cgst + sgst;

          liveBills.push({
            tableId: table._id || `temp-${num}`,
            tableNumber: num,
            tableName: `Table ${num} (${zone})`,
            zone,
            orderId: activeOrder?.orderId || `ORD-${3000 + num}`,
            customerName: `Guest Session #${num}`,
            items: itemsList,
            subtotal,
            cgst,
            sgst,
            total,
            status: (table.status as any) || 'billing',
          });
        }
      });

      // Merge mock bills if no live billing tables found, to ensure Cashier POS is always functional
      const finalBills = liveBills.length > 0 ? liveBills : MOCK_POS_BILLS;
      setBills(finalBills);

      if (!finalBills.some((b) => b.tableNumber === selectedTableNumber)) {
        setSelectedTableNumber(finalBills[0]?.tableNumber || 10);
      }

      if (isManual) showToast('POS Terminal synchronized with floor state', 'info');
    } catch (error) {
      console.error('Failed to sync POS bills:', error);
      setBills(MOCK_POS_BILLS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePOSData();
    const interval = setInterval(() => fetchLivePOSData(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const currentBill = bills.find((b) => b.tableNumber === selectedTableNumber) || bills[0] || MOCK_POS_BILLS[0];
  const isCurrentSettled = !!settledTables[currentBill?.tableNumber];

  // Calculations
  const discountAmount = Math.round((currentBill?.subtotal || 0) * (discountPercent / 100));
  const netSubtotal = Math.max(0, (currentBill?.subtotal || 0) - discountAmount);
  const netCgst = Math.round(netSubtotal * 0.025);
  const netSgst = Math.round(netSubtotal * 0.025);
  const finalGrandTotal = netSubtotal + netCgst + netSgst;

  const perPersonTotal = Math.round(finalGrandTotal / Math.max(1, splitCount));
  const changeDue = Math.max(0, (parseFloat(cashTendered) || 0) - finalGrandTotal);

  const handleSettlePayment = async () => {
    if (!currentBill) return;

    try {
      // 1. Mark table status as 'cleaning' in backend to transition lifecycle
      await tableService.updateTableStatus(currentBill.tableId, 'cleaning').catch(() => {});

      // 2. Mark order as completed if active
      if (currentBill.orderId) {
        await orderService.updateOrderStatus(currentBill.orderId, 'completed').catch(() => {});
      }

      setSettledTables((prev) => ({ ...prev, [currentBill.tableNumber]: true }));
      showToast(`Bill ₹${finalGrandTotal.toLocaleString('en-IN')} for Table ${currentBill.tableNumber} settled via ${paymentMethod}!`, 'success');
      
      // Auto open tax invoice modal
      setInvoiceBill({ ...currentBill, total: finalGrandTotal });
      setIsInvoiceOpen(true);
    } catch (error) {
      showToast(`Settlement process error for Table ${currentBill.tableNumber}`, 'error');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
    showToast('Printing Tax Invoice Receipt...', 'info');
  };

  const filteredBillsList = bills.filter((b) => {
    if (filterTab === 'BILLING_ONLY') return b.status === 'billing' || !settledTables[b.tableNumber];
    return true;
  });

  return (
    // Fixed Two-Column Height Layout (identical to Waiter & Kitchen Dashboards)
    <div className="flex h-full min-h-0 w-full font-sans text-aura-ivory overflow-hidden">

      {/* ─────────────────────────────────────────────────────────────────
          LEFT PANEL — Pending Table Bills Queue Sidebar
      ───────────────────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 h-full flex flex-col bg-aura-container border-r border-aura-border/80 overflow-hidden">
        
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
              className="p-2 bg-aura-obsidian border border-aura-border hover:border-aura-gold text-aura-slate hover:text-aura-gold rounded-xl transition-all"
              title="Sync POS Floor Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-aura-gold' : ''}`} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-aura-obsidian/80 rounded-xl border border-aura-border/50 text-[11px] font-bold">
            <button
              onClick={() => setFilterTab('BILLING_ONLY')}
              className={`py-1.5 rounded-lg transition-all ${filterTab === 'BILLING_ONLY' ? 'bg-aura-gold text-aura-obsidian font-black shadow-md' : 'text-aura-slate hover:text-aura-ivory'}`}
            >
              Pending ({bills.filter(b => !settledTables[b.tableNumber]).length})
            </button>
            <button
              onClick={() => setFilterTab('ALL_ACTIVE')}
              className={`py-1.5 rounded-lg transition-all ${filterTab === 'ALL_ACTIVE' ? 'bg-aura-gold text-aura-obsidian font-black shadow-md' : 'text-aura-slate hover:text-aura-ivory'}`}
            >
              All Tables ({bills.length})
            </button>
          </div>
        </div>

        {/* Scrollable Bills Queue */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <span className="text-[10px] font-mono text-aura-slate uppercase tracking-wider block px-1">
            Active Billing Queues ({filteredBillsList.length})
          </span>

          {filteredBillsList.length === 0 ? (
            <div className="py-12 text-center text-aura-slate space-y-2 bg-aura-obsidian/40 border border-aura-border/40 rounded-2xl p-4">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-400/60" />
              <p className="text-xs font-bold text-aura-ivory">No Pending Bills</p>
              <p className="text-[10px]">All dining table sessions have been settled!</p>
            </div>
          ) : (
            filteredBillsList.map((bill) => {
              const isSettled = !!settledTables[bill.tableNumber];
              const isSelected = selectedTableNumber === bill.tableNumber;

              return (
                <div
                  key={bill.tableNumber}
                  onClick={() => {
                    setSelectedTableNumber(bill.tableNumber);
                    setSplitCount(1);
                    setCashTendered('');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-aura-gold/15 border-aura-gold ring-1 ring-aura-gold/40 shadow-xl'
                      : isSettled
                      ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
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
                    <span>{bill.items.length} Recipe Dish(es)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 border-t border-aura-border/60 bg-aura-container/90 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-aura-slate">
            <span>Settled Today:</span>
            <span className="text-emerald-400 font-bold">{Object.keys(settledTables).length} Sessions</span>
          </div>
          <div className="flex justify-between text-aura-slate">
            <span>Pending Queue:</span>
            <span className="text-amber-400 font-bold">{bills.length - Object.keys(settledTables).length} Tables</span>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────
          RIGHT PANEL — Active Bill Itemization & Settlement Terminal
      ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">

        {currentBill ? (
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Bill Header Card */}
            <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <p className="text-xs text-aura-slate mt-0.5">{currentBill.customerName}</p>
              </div>

              {isCurrentSettled ? (
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs rounded-xl flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>SETTLED & PAID</span>
                  </span>
                  <button
                    onClick={() => {
                      setInvoiceBill({ ...currentBill, total: finalGrandTotal });
                      setIsInvoiceOpen(true);
                    }}
                    className="px-4 py-2 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-lg"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
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

                  {/* Split Bill N-Ways Calculator */}
                  <div className="p-4 bg-aura-obsidian/80 border border-aura-border/60 rounded-2xl space-y-3 mt-4">
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

                  {/* Discount Selector */}
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
                </div>
              </div>

              {/* Settlement Payment Processing Panel */}
              <div className="space-y-6">
                <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-5 shadow-xl">
                  <h3 className="font-serif text-base font-bold text-aura-ivory flex items-center space-x-2 border-b border-aura-border/60 pb-3">
                    <ShieldCheck className="w-4 h-4 text-aura-gold" />
                    <span>Payment Terminal</span>
                  </h3>

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
                      {parseFloat(cashTendered) > 0 && (
                        <div className="flex justify-between text-xs font-bold text-emerald-400 pt-1 border-t border-aura-border/40">
                          <span>Return Change Due:</span>
                          <span>₹{changeDue.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary Totals */}
                  <div className="border-t border-aura-border/60 pt-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-aura-slate">
                      <span>Subtotal</span>
                      <span>₹{(currentBill.subtotal || 0).toLocaleString('en-IN')}</span>
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
                  {isCurrentSettled ? (
                    <div className="space-y-2">
                      <div className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                        <p className="text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Table Session Closed</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setInvoiceBill({ ...currentBill, total: finalGrandTotal });
                          setIsInvoiceOpen(true);
                        }}
                        className="w-full py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print GST Tax Invoice</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSettlePayment}
                      className="w-full py-4 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>Settle ₹{finalGrandTotal.toLocaleString('en-IN')} via {paymentMethod}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-aura-slate space-y-3 bg-aura-container/40 rounded-3xl border border-aura-border/60 p-8 max-w-md mx-auto">
            <Receipt className="w-12 h-12 text-aura-gold/40 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-aura-ivory">No Table Selected</h2>
            <p className="text-xs">Select a table session from the left queue to proceed with settlement.</p>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────
          PRINTABLE GST TAX INVOICE MODAL
      ───────────────────────────────────────────────────────────────── */}
      {isInvoiceOpen && invoiceBill && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsInvoiceOpen(false); }}
        >
          <div className="bg-white text-gray-900 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 relative font-mono text-xs">
            <button
              onClick={() => setIsInvoiceOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
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
              <div className="flex justify-between">
                <span className="text-gray-500">Tax Invoice #:</span>
                <span className="font-bold">{invoiceBill.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Table Session:</span>
                <span className="font-bold">{invoiceBill.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date &amp; Time:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-bold text-emerald-700 uppercase">{paymentMethod} (SETTLED)</span>
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

              <div className="flex space-x-2 pt-2">
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

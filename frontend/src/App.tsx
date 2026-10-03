import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/feedback/ToastContainer';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { TableSessionRoute } from './routes/TableSessionRoute';

// Dynamic route-based code splitting for ultra-fast initial page loads
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m: any) => ({ default: m.LandingPage || m.default })));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then((m: any) => ({ default: m.LoginPage || m.default })));
const MenuPage = React.lazy(() => import('./pages/customer/MenuPage').then((m: any) => ({ default: m.MenuPage || m.default })));
const OrderTrackingPage = React.lazy(() => import('./pages/customer/OrderTrackingPage').then((m: any) => ({ default: m.OrderTrackingPage || m.default })));
const DineScanPage = React.lazy(() => import('./pages/customer/DineScanPage').then((m: any) => ({ default: m.DineScanPage || m.default })));
const KitchenDisplayPage = React.lazy(() => import('./pages/kitchen/KitchenDisplayPage').then((m: any) => ({ default: m.KitchenDisplayPage || m.default })));
const WaiterDashboardPage = React.lazy(() => import('./pages/waiter/WaiterDashboardPage').then((m: any) => ({ default: m.WaiterDashboardPage || m.default })));
const CashierPOSPage = React.lazy(() => import('./pages/cashier/CashierPOSPage').then((m: any) => ({ default: m.CashierPOSPage || m.default })));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage').then((m: any) => ({ default: m.AdminDashboardPage || m.default })));
const QrGeneratorPage = React.lazy(() => import('./pages/admin/QrGeneratorPage').then((m: any) => ({ default: m.QrGeneratorPage || m.default })));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage').then((m: any) => ({ default: m.SettingsPage || m.default })));
const ProfilePage = React.lazy(() => import('./pages/user/ProfilePage').then((m: any) => ({ default: m.ProfilePage || m.default })));


// Sleek fast loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center space-y-3">
    <div className="w-10 h-10 border-3 border-[#0C831F] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
      Loading Experience...
    </span>
  </div>
);

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Customer Menu & Landing Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Opaque QR Scan Routes for Physical Dining Tables */}
            <Route path="/dine/:token" element={<DineScanPage />} />
            <Route path="/t/:token" element={<DineScanPage />} />

            {/* Masked Customer Digital Menu & Order Tracking */}
            <Route element={<TableSessionRoute />}>
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/order/:orderId" element={<OrderTrackingPage />} />
              <Route path="/table/:tableId/menu" element={<MenuPage />} />
              <Route path="/table/:tableId/order/:orderId" element={<OrderTrackingPage />} />
            </Route>

            {/* Staff Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/staff" element={<Navigate to="/login" replace />} />

            {/* Kitchen KDS Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CHEF', 'ADMIN', 'RESTAURANT_OWNER']} />}>
              <Route path="/kitchen" element={<AppLayout><KitchenDisplayPage /></AppLayout>} />
              <Route path="/kitchen/kds" element={<AppLayout><KitchenDisplayPage /></AppLayout>} />
            </Route>

            {/* Waiter Dispatch Routes */}
            <Route element={<ProtectedRoute allowedRoles={['WAITER', 'ADMIN', 'RESTAURANT_OWNER']} />}>
              <Route path="/waiter" element={<AppLayout><WaiterDashboardPage /></AppLayout>} />
              <Route path="/waiter/dashboard" element={<AppLayout><WaiterDashboardPage /></AppLayout>} />
            </Route>

            {/* Cashier POS Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CASHIER', 'ADMIN', 'RESTAURANT_OWNER']} />}>
              <Route path="/cashier" element={<AppLayout><CashierPOSPage /></AppLayout>} />
              <Route path="/cashier/pos" element={<AppLayout><CashierPOSPage /></AppLayout>} />
            </Route>

            {/* Admin Command Center & Management */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RESTAURANT_OWNER', 'MANAGER']} />}>
              <Route path="/admin" element={<AppLayout><AdminDashboardPage /></AppLayout>} />
              <Route path="/admin/dashboard" element={<AppLayout><AdminDashboardPage /></AppLayout>} />
              <Route path="/admin/qr-generator" element={<AppLayout><QrGeneratorPage /></AppLayout>} />
              <Route path="/admin/qr-stands" element={<AppLayout><QrGeneratorPage /></AppLayout>} />
              <Route path="/qr-generator" element={<AppLayout><QrGeneratorPage /></AppLayout>} />
              {/* Redirect /owner seamlessly to /admin */}
              <Route path="/owner" element={<Navigate to="/admin" replace />} />
              <Route path="/owner/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
            </Route>

            {/* Fallback wildcard redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;

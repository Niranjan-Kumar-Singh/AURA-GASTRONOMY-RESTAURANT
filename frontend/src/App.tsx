import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/feedback/ToastContainer';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { MenuPage } from './pages/customer/MenuPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { KitchenDisplayPage } from './pages/kitchen/KitchenDisplayPage';
import { WaiterDashboardPage } from './pages/waiter/WaiterDashboardPage';
import { CashierPOSPage } from './pages/cashier/CashierPOSPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { OwnerDashboardPage } from './pages/admin/OwnerDashboardPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { TableSessionRoute } from './routes/TableSessionRoute';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Customer Menu & Landing Routes */}
          <Route path="/" element={<LandingPage />} />

          <Route element={<TableSessionRoute />}>
            <Route path="/table/:tableId/menu" element={<MenuPage />} />
            <Route path="/table/:tableId/order/:orderId" element={<OrderTrackingPage />} />
          </Route>

          {/* Staff Authentication */}
          <Route path="/login" element={<LoginPage />} />

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

          {/* Admin & Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RESTAURANT_OWNER', 'MANAGER']} />}>
            <Route path="/admin" element={<AppLayout><AdminDashboardPage /></AppLayout>} />
            <Route path="/admin/dashboard" element={<AppLayout><AdminDashboardPage /></AppLayout>} />
            <Route path="/owner" element={<AppLayout><OwnerDashboardPage /></AppLayout>} />
            <Route path="/owner/dashboard" element={<AppLayout><OwnerDashboardPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          </Route>

          {/* Fallback wildcard redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;

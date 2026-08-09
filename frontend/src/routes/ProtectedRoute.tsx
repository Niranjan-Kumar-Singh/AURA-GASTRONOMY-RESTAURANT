import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/use-auth-store';
import { Role } from '../types/user.types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen bg-aura-obsidian text-aura-ivory flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            403
          </div>
          <h1 className="font-serif text-3xl font-bold text-aura-ivory">Access Restricted</h1>
          <p className="text-aura-slate text-sm">
            Your user role <span className="font-mono text-aura-gold">{user.role}</span> does not have privilege to access this module.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 bg-aura-gold text-aura-obsidian font-semibold rounded-xl text-sm transition-all"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

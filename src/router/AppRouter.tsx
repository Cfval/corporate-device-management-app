import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/public/LoginPage';
import LandingPage from '../pages/public/LandingPage';
import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';
import type { UserRole } from '../types';

const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactElement; 
  requiredRole?: UserRole;
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'} replace />;
  }

  return children;
};

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/landing3" element={<LandingPage />} />
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'} replace /> : <LoginPage />} 
        />
        
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/client/*" 
          element={
            <ProtectedRoute requiredRole="CLIENT">
              <ClientLayout />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard') : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;


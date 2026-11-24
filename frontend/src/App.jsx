import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyRatings from './pages/user/MyRatings';

// Store Owner Pages
import StoreOwnerDashboard from './pages/store-owner/StoreOwnerDashboard';
import StoreOwnerRatings from './pages/store-owner/StoreOwnerRatings';

// Root Redirector based on user role
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'STORE_OWNER') return <Navigate to="/store-owner" replace />;
  return <Navigate to="/user" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 1. Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/stores" element={<ManageStores />} />
            <Route path="/admin/add-user" element={<AddUser />} />
            <Route path="/admin/add-store" element={<AddStore />} />
          </Route>

          {/* 2. Normal User Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/my-ratings" element={<MyRatings />} />
          </Route>

          {/* 3. Store Owner Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER', 'ADMIN']} />}>
            <Route path="/store-owner" element={<StoreOwnerDashboard />} />
            <Route path="/store-owner/ratings" element={<StoreOwnerRatings />} />
          </Route>

          {/* Root & Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

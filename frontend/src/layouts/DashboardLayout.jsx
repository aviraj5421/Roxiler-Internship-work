import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import {
  Store,
  LayoutDashboard,
  Users,
  Building2,
  UserPlus,
  PlusCircle,
  LogOut,
  KeyRound,
  Menu,
  X,
  Star,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Nav Items configured per role
  let navItems = [];

  if (role === 'ADMIN') {
    navItems = [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/users', label: 'Manage Users', icon: Users },
      { to: '/admin/stores', label: 'Manage Stores', icon: Building2 },
      { to: '/admin/add-user', label: 'Add User', icon: UserPlus },
      { to: '/admin/add-store', label: 'Add Store', icon: PlusCircle },
    ];
  } else if (role === 'STORE_OWNER') {
    navItems = [
      { to: '/store-owner', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/store-owner/ratings', label: 'Store Ratings', icon: Star },
    ];
  } else {
    // Normal USER
    navItems = [
      { to: '/user', label: 'Explore Stores', icon: Building2, end: true },
      { to: '/user/my-ratings', label: 'My Submitted Ratings', icon: Star },
    ];
  }

  const getRoleBadge = () => {
    if (role === 'ADMIN') return <span className="badge badge-admin">System Admin</span>;
    if (role === 'STORE_OWNER') return <span className="badge badge-owner">Store Owner</span>;
    return <span className="badge badge-user">Normal User</span>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar - Desktop */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="sidebar-desktop"
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Store Rating
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Roxiler Platform</div>
          </div>
        </div>

        {/* Current User Pill */}
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#131c31', margin: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Signed in as
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ marginTop: '0.35rem' }}>
            {getRoleBadge()}
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.75rem 0.5rem' }}>
            Menu
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? '#1e293b' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} color={location.pathname === item.to ? '#60a5fa' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#94a3b8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            className="sidebar-btn"
          >
            <KeyRound size={16} />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: 500,
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              {title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-name-header" style={{ fontWeight: 500 }}>{user?.name}</span>
            </div>
            {getRoleBadge()}
          </div>
        </header>

        {/* Main Viewport */}
        <main style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />

      {/* Responsive Styles */}
      <style>{`
        .sidebar-btn:hover {
          background-color: #1e293b !important;
          color: #ffffff !important;
        }
        @media (max-width: 860px) {
          .sidebar-desktop {
            display: ${mobileMenuOpen ? 'flex' : 'none'} !important;
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
          .user-name-header {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;

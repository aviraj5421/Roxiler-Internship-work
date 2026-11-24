import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import {
  Users,
  Building2,
  Star,
  UserPlus,
  PlusCircle,
  ShieldCheck,
  Store,
  User,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getDashboard();
      setStats(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="System Administration">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Platform Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Real-time statistics across users, stores, and ratings
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Total Users */}
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Total Users
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
              {loading ? '...' : stats?.totalUsers ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Admin, Store Owners & Normal Users
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
        </div>

        {/* Total Stores */}
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Total Stores
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
              {loading ? '...' : stats?.totalStores ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Registered commercial stores
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
        </div>

        {/* Total Ratings */}
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Total Ratings Submitted
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
              {loading ? '...' : stats?.totalRatings ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Customer reviews across stores
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} />
          </div>
        </div>
      </div>

      {/* Role Breakdown & Quick Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* User Role Distribution */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>User Distribution by Role</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Normal Users */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                  <User size={16} color="#0284c7" /> Normal Users
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats?.userRoleCounts?.normalUser ?? 0}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${stats?.totalUsers ? ((stats.userRoleCounts?.normalUser || 0) / stats.totalUsers) * 100 : 0}%`, height: '100%', backgroundColor: '#0284c7', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Store Owners */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                  <Store size={16} color="#7c3aed" /> Store Owners
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats?.userRoleCounts?.storeOwner ?? 0}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${stats?.totalUsers ? ((stats.userRoleCounts?.storeOwner || 0) / stats.totalUsers) * 100 : 0}%`, height: '100%', backgroundColor: '#7c3aed', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Admins */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                  <ShieldCheck size={16} color="#d97706" /> Administrators
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{stats?.userRoleCounts?.admin ?? 0}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${stats?.totalUsers ? ((stats.userRoleCounts?.admin || 0) / stats.totalUsers) * 100 : 0}%`, height: '100%', backgroundColor: '#d97706', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Quick Management Actions</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/admin/add-user"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.875rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>Add New User</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Create Normal, Admin, or Store Owner user</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="#94a3b8" />
            </Link>

            <Link
              to="/admin/add-store"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.875rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusCircle size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>Add New Store</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Register store & assign to store owner</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="#94a3b8" />
            </Link>

            <Link
              to="/admin/users"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.875rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>Search & Filter Users</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>View user directory and individual ratings</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="#94a3b8" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminOverview;

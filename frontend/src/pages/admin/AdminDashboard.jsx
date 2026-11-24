import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Users, Building2, Star } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="System Administration">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Roxiler System Administrator Control Center
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Users</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Phase 2 Loading...</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Stores</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Phase 2 Loading...</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Ratings</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Phase 2 Loading...</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import storeOwnerService from '../../services/storeOwnerService';
import { getErrorMessage } from '../../services/api';
import StarRating from '../../components/StarRating';
import {
  Store,
  Star,
  Users,
  MapPin,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected store if owner owns multiple
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  // Reviewers list
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await storeOwnerService.getDashboard();
      setDashboardData(res.data);
      if (res.data.hasStore && res.data.store) {
        setSelectedStoreId(res.data.store.id);
        fetchRatings(res.data.store.id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (storeId) => {
    setLoadingRatings(true);
    try {
      const res = await storeOwnerService.getRatings({ storeId });
      setRatings(res.data.ratings || []);
    } catch (err) {
      console.warn('Failed to load ratings list:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStoreChange = (e) => {
    const storeId = parseInt(e.target.value, 10);
    setSelectedStoreId(storeId);
    fetchRatings(storeId);
  };

  const currentStore =
    dashboardData?.allStores?.find((s) => s.id === selectedStoreId) ||
    dashboardData?.store;

  const totalRatingsCount = currentStore?.total_ratings || 0;
  const breakdown = currentStore?.rating_breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <DashboardLayout title="Store Owner Dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Store Performance & Customer Feedback
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Monitor your store's average ratings, 1-to-5 star breakdown, and review submissions
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboard}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading store data...
        </div>
      ) : !dashboardData?.hasStore ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Store size={44} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Store Associated</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto' }}>
            Your account is registered as a Store Owner, but no commercial store has been assigned to your profile yet.
            Please contact an Administrator to assign or register your store.
          </p>
        </div>
      ) : (
        <>
          {/* Store Selector if multiple stores owned */}
          {dashboardData.allStores && dashboardData.allStores.length > 1 && (
            <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>Select Active Store:</span>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '260px' }}
                value={selectedStoreId || ''}
                onChange={handleStoreChange}
              >
                {dashboardData.allStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({Number(s.average_rating).toFixed(2)} ★)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Store Info Banner */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              border: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  <Store size={16} /> Commercial Store Profile
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  {currentStore?.name}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={15} color="#94a3b8" /> {currentStore?.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="#94a3b8" /> {currentStore?.address}
                  </div>
                </div>
              </div>

              {/* Rating Big Badge */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.875rem 1.25rem', borderRadius: '12px', textAlign: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Average Rating
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1.1, margin: '0.25rem 0' }}>
                  {Number(currentStore?.average_rating) > 0 ? Number(currentStore?.average_rating).toFixed(2) : '0.00'}
                </div>
                <StarRating rating={Number(currentStore?.average_rating) || 0} size={16} />
              </div>
            </div>
          </div>

          {/* Metric Cards & Rating Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* KPI Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Average Customer Rating
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                    {Number(currentStore?.average_rating) > 0 ? Number(currentStore?.average_rating).toFixed(2) : '0.00'} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ 5.0</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Submitted Reviews
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                    {totalRatingsCount} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>{totalRatingsCount === 1 ? 'user' : 'users'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1 to 5 Star Distribution Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="card-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={20} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Rating Distribution (1–5 Stars)</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = breakdown[star] || 0;
                  const percentage = totalRatingsCount > 0 ? Math.round((count / totalRatingsCount) * 100) : 0;

                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                      <span style={{ minWidth: '48px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {star} <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      </span>
                      <div style={{ flex: 1, height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444',
                            borderRadius: '5px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ minWidth: '40px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {count}
                      </span>
                      <span style={{ minWidth: '40px', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>
                        ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Users Who Submitted Ratings Table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  Customer Reviews & Submitted Ratings
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                  Verified customer reviews submitted specifically for {currentStore?.name}
                </p>
              </div>
              <span className="badge badge-owner">
                {ratings.length} {ratings.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Customer Address</th>
                    <th>Submitted Rating</th>
                    <th>Review Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRatings ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        Loading customer ratings...
                      </td>
                    </tr>
                  ) : ratings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No customers have submitted a rating for this store yet.
                      </td>
                    </tr>
                  ) : (
                    ratings.map((r) => (
                      <tr key={r.rating_id}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.user_name}</td>
                        <td style={{ color: '#475569' }}>{r.user_email}</td>
                        <td style={{ color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.user_address}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={r.rating} size={16} />
                            <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.875rem' }}>
                              {r.rating} ★
                            </span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                          {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style>{`
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default StoreOwnerDashboard;

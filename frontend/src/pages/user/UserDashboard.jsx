import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import StarRating from '../../components/StarRating';
import {
  Store,
  Search,
  ArrowUpDown,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Search & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Currently rating store ID (for submitting animation)
  const [submittingStoreId, setSubmittingStoreId] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getStores({
        search,
        sortBy,
        order,
      });
      setStores(res.data.stores || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  // Submit or Modify Rating (1 to 5)
  const handleRateStore = async (storeId, ratingValue) => {
    setSubmittingStoreId(storeId);
    setError('');
    setActionSuccess('');

    try {
      const res = await userService.submitRating({
        store_id: storeId,
        rating: ratingValue,
      });

      // Update state locally for responsive UI
      setStores((prevStores) =>
        prevStores.map((store) => {
          if (store.id === storeId) {
            return {
              ...store,
              my_rating: ratingValue,
              my_rating_updated_at: new Date().toISOString(),
              overall_rating: res.data.storeStats.overall_rating,
              total_ratings: res.data.storeStats.total_ratings,
            };
          }
          return store;
        })
      );

      setActionSuccess(res.message || 'Rating recorded successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingStoreId(null);
    }
  };

  return (
    <DashboardLayout title="Explore Stores">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          Discover & Rate Local Stores
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
          Browse registered stores, view overall community feedback, and submit or update your ratings
        </p>
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Sort Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search stores by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>Sort by:</span>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Store Name</option>
              <option value="overall_rating">Overall Rating</option>
              <option value="created_at">Recently Added</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '130px' }}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <button type="submit" className="btn btn-secondary">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Stores Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading stores...
        </div>
      ) : stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Store size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Stores Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Try adjusting your search criteria or clear filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {stores.map((store) => {
            const hasUserRated = store.my_rating !== null && store.my_rating !== undefined;
            const isSubmitting = submittingStoreId === store.id;

            return (
              <div
                key={store.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  border: hasUserRated ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  boxShadow: hasUserRated ? '0 4px 6px -1px rgba(59, 130, 246, 0.08)' : 'var(--shadow-sm)',
                }}
              >
                <div>
                  {/* Store Name & Overall Rating Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                      {store.name}
                    </h3>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>{Number(store.overall_rating) > 0 ? Number(store.overall_rating).toFixed(2) : 'New'}</span>
                    </div>
                  </div>

                  {/* Store Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#64748b', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                    <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
                    <span>{store.address}</span>
                  </div>

                  {/* Overall Rating Breakdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#475569' }}>
                    <StarRating rating={Number(store.overall_rating) || 0} size={15} />
                    <span>
                      ({store.total_ratings} {store.total_ratings === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>

                {/* Rating Action Section */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', backgroundColor: hasUserRated ? '#f0fdf4' : '#f8fafc', margin: '0 -1.5rem -1.5rem', padding: '1rem 1.5rem', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: hasUserRated ? '#166534' : '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {hasUserRated ? 'Your Rating (Click to change):' : 'Rate this store:'}
                    </span>
                    {hasUserRated && (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> {store.my_rating} of 5 Stars
                      </span>
                    )}
                  </div>

                  {/* Interactive Star Component */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <StarRating
                      rating={store.my_rating || 0}
                      interactive={!isSubmitting}
                      size={24}
                      onRate={(starVal) => handleRateStore(store.id, starVal)}
                    />
                    {isSubmitting ? (
                      <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Saving...</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {hasUserRated ? 'Update' : 'Select 1–5'}
                      </span>
                    )}
                  </div>

                  {store.my_rating_updated_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#15803d', marginTop: '0.4rem' }}>
                      <Clock size={12} /> Last rated: {new Date(store.my_rating_updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default UserDashboard;

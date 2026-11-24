import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import StarRating from '../../components/StarRating';
import {
  Star,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updatingStoreId, setUpdatingStoreId] = useState(null);

  const fetchMyRatings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getMyRatings();
      setRatings(res.data.ratings || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const handleUpdateRating = async (storeId, newRating) => {
    setUpdatingStoreId(storeId);
    setError('');
    setActionSuccess('');

    try {
      await userService.submitRating({
        store_id: storeId,
        rating: newRating,
      });

      setRatings((prev) =>
        prev.map((r) =>
          r.store_id === storeId
            ? { ...r, rating: newRating, updated_at: new Date().toISOString() }
            : r
        )
      );

      setActionSuccess('Rating updated successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingStoreId(null);
    }
  };

  return (
    <DashboardLayout title="My Submitted Ratings">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          My Rating History
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
          View and adjust the feedback you have submitted for local stores
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading your ratings...
        </div>
      ) : ratings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Star size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Ratings Submitted Yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Explore registered stores and share your experience with the community.
          </p>
          <Link to="/user" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Explore Stores <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ratings.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  {r.store_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8125rem' }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span>{r.store_address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  <Clock size={13} /> Rated on {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>
                    Click stars to modify rating:
                  </div>
                  <StarRating
                    rating={r.rating}
                    interactive={updatingStoreId !== r.store_id}
                    size={22}
                    onRate={(val) => handleUpdateRating(r.store_id, val)}
                  />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', minWidth: '48px', textAlign: 'center' }}>
                  {r.rating} ★
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default MyRatings;

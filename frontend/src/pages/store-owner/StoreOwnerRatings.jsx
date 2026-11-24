import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import storeOwnerService from '../../services/storeOwnerService';
import { getErrorMessage } from '../../services/api';
import StarRating from '../../components/StarRating';
import {
  Star,
  Search,
  ArrowUpDown,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const StoreOwnerRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [filterRating, setFilterRating] = useState('');

  const fetchRatings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await storeOwnerService.getRatings({
        sortBy,
        order,
      });
      setRatings(res.data.ratings || []);
      setStore(res.data.store);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [sortBy, order]);

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setOrder('desc');
    }
  };

  // Filter ratings by star value if selected
  const filteredRatings = filterRating
    ? ratings.filter((r) => r.rating === parseInt(filterRating, 10))
    : ratings;

  return (
    <DashboardLayout title="Store Ratings & Customer Feedback">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Customer Reviews for {store?.name || 'Your Store'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Inspect full reviewer details and ratings submitted by consumers
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRatings}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Filter by star:</span>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '150px' }}
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="">All Star Ratings</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4 Stars Only</option>
          <option value="3">3 Stars Only</option>
          <option value="2">2 Stars Only</option>
          <option value="1">1 Star Only</option>
        </select>

        <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500, marginLeft: 'auto' }}>
          Showing {filteredRatings.length} of {ratings.length} reviews
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSortToggle('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  User Name <ArrowUpDown size={13} />
                </div>
              </th>
              <th>Email Address</th>
              <th>Physical Address</th>
              <th onClick={() => handleSortToggle('rating')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Rating <ArrowUpDown size={13} />
                </div>
              </th>
              <th onClick={() => handleSortToggle('created_at')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Date <ArrowUpDown size={13} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading ratings...
                </td>
              </tr>
            ) : filteredRatings.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No customer ratings match the selected filter.
                </td>
              </tr>
            ) : (
              filteredRatings.map((r) => (
                <tr key={r.rating_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.user_name}</td>
                  <td style={{ color: '#475569' }}>{r.user_email}</td>
                  <td style={{ color: '#64748b', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
    </DashboardLayout>
  );
};

export default StoreOwnerRatings;

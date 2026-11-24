import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import StarRating from '../../components/StarRating';
import {
  Building2,
  Search,
  ArrowUpDown,
  PlusCircle,
  Mail,
  MapPin,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Client Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStores({
        search,
        sortBy,
        order,
      });
      setStores(res.data.stores || []);
      setCurrentPage(1);
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

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setOrder('asc');
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(stores.length / pageSize) || 1;
  const paginatedStores = stores.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <DashboardLayout title="Store Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Registered Stores Directory
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            View all commercial stores with their overall average customer ratings
          </p>
        </div>
        <Link to="/admin/add-store" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Add New Store</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search stores by name, email, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Stores Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSortToggle('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Store Name <ArrowUpDown size={13} />
                </div>
              </th>
              <th onClick={() => handleSortToggle('email')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Contact Email <ArrowUpDown size={13} />
                </div>
              </th>
              <th>Address</th>
              <th>Store Owner</th>
              <th onClick={() => handleSortToggle('overall_rating')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Overall Rating <ArrowUpDown size={13} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading stores catalog...
                </td>
              </tr>
            ) : paginatedStores.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No stores found matching your search criteria.
                </td>
              </tr>
            ) : (
              paginatedStores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</td>
                  <td style={{ color: '#475569' }}>{s.email}</td>
                  <td style={{ color: '#64748b', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.address}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8125rem' }}>{s.owner_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.owner_email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StarRating rating={Number(s.overall_rating) || 0} size={16} />
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                        {Number(s.overall_rating) > 0 ? Number(s.overall_rating).toFixed(2) : '0.00'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({s.total_ratings} {s.total_ratings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && stores.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, stores.length)} of {stores.length} stores
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageStores;

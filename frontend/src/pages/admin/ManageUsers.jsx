import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import StarRating from '../../components/StarRating';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  UserPlus,
  Eye,
  X,
  Store,
  Calendar,
  MapPin,
  Mail,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Client Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // User Details Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUsers({
        search,
        role: roleFilter,
        sortBy,
        order,
      });
      setUsers(res.data.users || []);
      setCurrentPage(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, sortBy, order]);

  // Search on enter or debounce submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setOrder('asc');
    }
  };

  // View User Details
  const handleViewDetails = async (userId) => {
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await adminService.getUserById(userId);
      setSelectedUser(res.data.user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return <span className="badge badge-admin">Admin</span>;
    if (role === 'STORE_OWNER') return <span className="badge badge-owner">Store Owner</span>;
    return <span className="badge badge-user">Normal User</span>;
  };

  return (
    <DashboardLayout title="User Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            System Users Directory
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Search, filter, and inspect administrators, store owners, and consumers
          </p>
        </div>
        <Link to="/admin/add-user" className="btn btn-primary">
          <UserPlus size={16} />
          <span>Add New User</span>
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
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by name, email, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="USER">Normal User</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSortToggle('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Full Name <ArrowUpDown size={13} />
                </div>
              </th>
              <th onClick={() => handleSortToggle('email')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Email Address <ArrowUpDown size={13} />
                </div>
              </th>
              <th>Address</th>
              <th onClick={() => handleSortToggle('role')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Role <ArrowUpDown size={13} />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading users...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No users found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                  <td style={{ color: '#475569' }}>{u.email}</td>
                  <td style={{ color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.address}
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleViewDetails(u.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && users.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, users.length)} of {users.length} users
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

      {/* User Details Modal (With Store Owner Rating Display) */}
      {detailsModalOpen && (
        <div className="modal-backdrop" onClick={() => setDetailsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>User Profile Details</h3>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {loadingDetails || !selectedUser ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading profile...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Basic Info Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{selectedUser.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                        <Mail size={14} /> {selectedUser.email}
                      </div>
                    </div>
                    {getRoleBadge(selectedUser.role)}
                  </div>

                  {/* Address */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Registered Address
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>{selectedUser.address}</div>
                  </div>

                  {/* PDF Requirement: Display Store Owner's rating when viewing a Store Owner */}
                  {selectedUser.role === 'STORE_OWNER' && (
                    <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Store size={18} color="#7c3aed" />
                        <span style={{ fontWeight: 600, color: '#581c87', fontSize: '0.9375rem' }}>
                          Store Owner Overall Rating
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#581c87' }}>
                          {selectedUser.store_owner_rating > 0 ? selectedUser.store_owner_rating.toFixed(2) : '0.00'}
                        </div>
                        <StarRating rating={selectedUser.store_owner_rating || 0} size={22} />
                      </div>

                      {/* Owned Stores List */}
                      {selectedUser.stores && selectedUser.stores.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b21a8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            Stores Owned:
                          </div>
                          {selectedUser.stores.map((s) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f3e8ff', fontSize: '0.8125rem' }}>
                              <span style={{ fontWeight: 500 }}>{s.name}</span>
                              <span style={{ color: '#7c3aed', fontWeight: 600 }}>
                                {Number(s.overall_rating).toFixed(2)} ★ ({s.total_ratings} reviews)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Normal User Rating Submissions */}
                  {selectedUser.role === 'USER' && (
                    <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Star size={18} color="#0284c7" />
                        <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '0.9rem' }}>
                          Ratings Submitted: {selectedUser.total_submitted_ratings ?? 0}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#0284c7' }}>
                        Customer account active on the rating platform.
                      </div>
                    </div>
                  )}

                  {/* Joined Date */}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} /> Member since {new Date(selectedUser.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsers;

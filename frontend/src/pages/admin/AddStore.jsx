import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';
import { Building2, Mail, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';

const AddStore = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch list of users to select store owner
  useEffect(() => {
    const fetchPotentialOwners = async () => {
      try {
        const res = await adminService.getUsers();
        const allUsers = res.data.users || [];
        // Prioritize store owners or all users eligible
        setOwners(allUsers);
        // Pre-select first store owner if available
        const firstOwner = allUsers.find((u) => u.role === 'STORE_OWNER');
        if (firstOwner) {
          setFormData((prev) => ({ ...prev, owner_id: firstOwner.id }));
        } else if (allUsers.length > 0) {
          setFormData((prev) => ({ ...prev, owner_id: allUsers[0].id }));
        }
      } catch (err) {
        console.warn('Failed to fetch owners list:', err);
      } finally {
        setLoadingOwners(false);
      }
    };

    fetchPotentialOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const addressErr = validateAddress(formData.address);
    if (addressErr) errors.address = addressErr;

    if (!formData.owner_id) {
      errors.owner_id = 'A store owner must be selected.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await adminService.createStore({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        owner_id: parseInt(formData.owner_id, 10),
      });

      setSuccess(`Store "${formData.name}" registered successfully!`);
      setTimeout(() => {
        navigate('/admin/stores');
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Store">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Register New Store
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Add a commercial business listing and bind it to an authorized Store Owner
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Store Name */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Store Name <span className="required">*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: formData.name.length >= 20 && formData.name.length <= 60 ? '#10b981' : '#94a3b8' }}>
                  {formData.name.length}/60 chars (min 20)
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="name"
                  className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Downtown Supermarket Emporium"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
              <div className="form-hint">Must be 20 to 60 characters as per assignment requirements.</div>
            </div>

            {/* Store Email */}
            <div className="form-group">
              <label className="form-label">
                Store Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  name="email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="contact@storename.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
            </div>

            {/* Store Address */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Store Address <span className="required">*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: formData.address.length > 400 ? '#ef4444' : '#94a3b8' }}>
                  {formData.address.length}/400 chars
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <textarea
                  name="address"
                  className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter full physical address of the store (Max 400 characters)"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.address && <div className="form-error">{fieldErrors.address}</div>}
            </div>

            {/* Store Owner Selection */}
            <div className="form-group">
              <label className="form-label">
                Designated Store Owner <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select
                  name="owner_id"
                  className={`form-control ${fieldErrors.owner_id ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.owner_id}
                  onChange={handleChange}
                  disabled={loadingOwners}
                >
                  {loadingOwners ? (
                    <option value="">Loading eligible owners...</option>
                  ) : owners.length === 0 ? (
                    <option value="">No users found in system</option>
                  ) : (
                    owners.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — [{u.role}]
                      </option>
                    ))
                  )}
                </select>
              </div>
              {fieldErrors.owner_id && <div className="form-error">{fieldErrors.owner_id}</div>}
              <div className="form-hint">
                Select an existing Store Owner or user to assign ownership of this store.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/stores')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Store...' : 'Register Store'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddStore;

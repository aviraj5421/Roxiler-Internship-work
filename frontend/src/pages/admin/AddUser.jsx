import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_SPECIAL_REGEX,
} from '../../utils/validators';
import { UserPlus, User, Mail, Lock, MapPin, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) errors.password = passwordErr;

    if (!['USER', 'STORE_OWNER', 'ADMIN'].includes(formData.role)) {
      errors.role = 'Please select a valid role.';
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
      await adminService.createUser(formData);
      setSuccess(`User "${formData.name}" created successfully as ${formData.role}!`);
      setFormData({
        name: '',
        email: '',
        address: '',
        password: '',
        role: 'USER',
      });
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New User">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Create New Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Administrator tool to provision Normal Users, Store Owners, or Administrators
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
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">
                Account Role <span className="required">*</span>
              </label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                style={{ fontWeight: 500 }}
              >
                <option value="USER">Normal User (Consumer)</option>
                <option value="STORE_OWNER">Store Owner (Merchant)</option>
                <option value="ADMIN">System Administrator</option>
              </select>
              <div className="form-hint">
                Select the authorization permission level granted to this account.
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Full Name <span className="required">*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: formData.name.length >= 20 && formData.name.length <= 60 ? '#10b981' : '#94a3b8' }}>
                  {formData.name.length}/60 chars (min 20)
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="name"
                  className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Christopher Nolan Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
              <div className="form-hint">Must be 20 to 60 characters as per assignment requirements.</div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  name="email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
            </div>

            {/* Address */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Address <span className="required">*</span>
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
                  placeholder="Enter full physical address (Max 400 characters)"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.address && <div className="form-error">{fieldErrors.address}</div>}
            </div>

            {/* Initial Password */}
            <div className="form-group">
              <label className="form-label">
                Initial Password <span className="required">*</span>
              </label>
              <div className="input-password-wrapper">
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
              <div className="form-hint">
                Must be 8–16 characters with at least one uppercase letter and one special character.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating User...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddUser;

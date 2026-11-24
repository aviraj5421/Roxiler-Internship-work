import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_SPECIAL_REGEX,
} from '../../utils/validators';
import { Eye, EyeOff, Lock, Mail, User, MapPin, Store, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
      });

      setSuccessMessage('Account created successfully! Redirecting to user dashboard...');
      setTimeout(() => {
        navigate('/user', { replace: true });
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Live password indicator status
  const pwLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const pwUppercaseValid = PASSWORD_UPPERCASE_REGEX.test(formData.password);
  const pwSpecialValid = PASSWORD_SPECIAL_REGEX.test(formData.password);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)', marginBottom: '0.75rem' }}>
            <Store size={26} color="#60a5fa" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
            Create an Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Register as a normal user to discover and review local stores
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name Field */}
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
                  placeholder="e.g. Alexander Hamilton Consumer"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
              <div className="form-hint">Must be between 20 and 60 characters as per assignment specification.</div>
            </div>

            {/* Email Field */}
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
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
            </div>

            {/* Address Field */}
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
                  placeholder="Enter full address (Max 400 characters)"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.address && <div className="form-error">{fieldErrors.address}</div>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="input-password-wrapper">
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="8-16 characters, 1 uppercase, 1 special char"
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

              {/* Password Requirement Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: pwLengthValid ? '#ecfdf5' : '#f1f5f9', color: pwLengthValid ? '#065f46' : '#64748b', border: `1px solid ${pwLengthValid ? '#a7f3d0' : '#e2e8f0'}` }}>
                  8–16 characters
                </span>
                <span style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: pwUppercaseValid ? '#ecfdf5' : '#f1f5f9', color: pwUppercaseValid ? '#065f46' : '#64748b', border: `1px solid ${pwUppercaseValid ? '#a7f3d0' : '#e2e8f0'}` }}>
                  1 Uppercase
                </span>
                <span style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: pwSpecialValid ? '#ecfdf5' : '#f1f5f9', color: pwSpecialValid ? '#065f46' : '#64748b', border: `1px solid ${pwSpecialValid ? '#a7f3d0' : '#e2e8f0'}` }}>
                  1 Special Char (!@#$%^&*...)
                </span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="input-password-wrapper">
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Re-type your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <div className="form-error">{fieldErrors.confirmPassword}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Creating Account...
                </>
              ) : (
                <>
                  Register User <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link to Login */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: '#2563eb' }}>
            Sign in
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterPage;

/**
 * Roxiler Systems Validation Rules
 * Strict adherence to PDF requirements:
 * - Name: Minimum 20 characters, maximum 60 characters.
 * - Address: Maximum 400 characters.
 * - Password: 8–16 characters, at least one uppercase letter and one special character.
 * - Email: Standard email format.
 * - Rating: Integer between 1 and 5.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Full name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters in length.';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return 'Address is required.';
  const trimmed = address.trim();
  if (trimmed.length === 0) return 'Address is required.';
  if (trimmed.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
};

export const validateRating = (rating) => {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
};

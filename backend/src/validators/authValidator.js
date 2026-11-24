/**
 * Regex patterns and validation helper functions according to assignment specifications
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

const validateName = (name) => {
  if (typeof name !== 'string') return 'Name must be a string.';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters in length.';
  }
  return null;
};

const validateEmail = (email) => {
  if (typeof email !== 'string') return 'Email must be a string.';
  const trimmed = email.trim();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return 'Please provide a valid email address.';
  }
  return null;
};

const validatePassword = (password) => {
  if (typeof password !== 'string') return 'Password must be a string.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters in length.';
  }
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

const validateAddress = (address) => {
  if (typeof address !== 'string') return 'Address must be a string.';
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return 'Address is required.';
  }
  if (trimmed.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
};

const validateRegister = (req, res, next) => {
  const { name, email, password, address } = req.body;
  const errors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.address = address.trim();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const errors = {};

  if (!oldPassword || typeof oldPassword !== 'string') {
    errors.oldPassword = 'Old password is required.';
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    errors.newPassword = passwordError;
  }

  if (oldPassword && newPassword && oldPassword === newPassword) {
    errors.newPassword = 'New password cannot be the same as the old password.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRegister,
  validateLogin,
  validateChangePassword,
};

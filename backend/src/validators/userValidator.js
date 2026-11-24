const { validateName, validateEmail, validateAddress, validatePassword } = require('./authValidator');

const validateCreateUser = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;

  const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
  if (!role || !allowedRoles.includes(role)) {
    errors.role = `Role must be one of: ${allowedRoles.join(', ')}`;
  }

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
  req.body.role = role.trim();
  next();
};

module.exports = {
  validateCreateUser,
};

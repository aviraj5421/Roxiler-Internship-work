const { validateName, validateEmail, validateAddress } = require('./authValidator');

const validateCreateStore = (req, res, next) => {
  const { name, email, address, owner_id } = req.body;
  const errors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;

  if (owner_id === undefined || owner_id === null || isNaN(Number(owner_id))) {
    errors.owner_id = 'A valid numeric owner_id referencing a user is required.';
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
  req.body.owner_id = parseInt(owner_id, 10);
  next();
};

module.exports = {
  validateCreateStore,
};

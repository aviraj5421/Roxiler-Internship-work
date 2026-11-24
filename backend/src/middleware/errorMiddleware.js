const AppError = require('../utils/appError');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl} on this server.`,
  });
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // JSON Body Parser Syntax Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  }

  // PostgreSQL Specific Error Codes
  // 23505: Unique violation (e.g. email already exists, or user already rated store)
  if (err.code === '23505') {
    statusCode = 409;
    if (err.constraint && err.constraint.includes('users_email_key')) {
      message = 'An account with this email address already exists.';
      errors = { email: message };
    } else if (err.constraint && err.constraint.includes('uq_user_store_rating')) {
      message = 'You have already submitted a rating for this store. You can modify your existing rating instead.';
      errors = { rating: message };
    } else {
      message = 'A record with duplicate unique fields already exists.';
    }
  }

  // 23503: Foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    if (err.constraint && err.constraint.includes('owner_id')) {
      message = 'The specified store owner ID does not exist.';
      errors = { owner_id: message };
    } else if (err.constraint && err.constraint.includes('store_id')) {
      message = 'The specified store does not exist.';
      errors = { store_id: message };
    } else if (err.constraint && err.constraint.includes('user_id')) {
      message = 'The specified user does not exist.';
      errors = { user_id: message };
    } else {
      message = 'Referenced entity does not exist.';
    }
  }

  // 23514: Check constraint violation
  if (err.code === '23514') {
    statusCode = 400;
    message = 'Data does not satisfy validation constraints.';
  }

  // 22P02: Invalid text representation (e.g., string passed where integer expected in query)
  if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid parameter type provided. Expected a valid integer identifier.';
  }

  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

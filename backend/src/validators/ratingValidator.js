const validateRating = (req, res, next) => {
  const { rating, store_id } = req.body;
  const errors = {};

  // For POST requests, store_id is required either in body or params
  const targetStoreId = store_id || req.params.storeId;
  if (!targetStoreId || isNaN(Number(targetStoreId))) {
    errors.store_id = 'A valid numeric store_id is required.';
  }

  if (rating === undefined || rating === null) {
    errors.rating = 'Rating is required.';
  } else {
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      errors.rating = 'Rating must be an integer between 1 and 5.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.rating = parseInt(rating, 10);
  if (targetStoreId) {
    req.body.store_id = parseInt(targetStoreId, 10);
  }
  next();
};

module.exports = {
  validateRating,
};

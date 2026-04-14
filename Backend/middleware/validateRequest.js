const { errorResponse } = require('../utils/apiResponse');

const validateRequest = (validator) => (req, res, next) => {
  const errors = validator(req);

  if (errors.length > 0) {
    return errorResponse(res, errors.join(', '), 400);
  }

  return next();
};

module.exports = validateRequest;

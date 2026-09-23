const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Malformed request data',
      error: 'BAD_REQUEST',
    });
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(422).json({
        success: false,
        message: 'Invalid query parameters',
        error: 'QUERY_VALIDATION_ERROR',
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Malformed query parameters',
      error: 'BAD_REQUEST',
    });
  }
};

module.exports = {
  validateBody,
  validateQuery,
};

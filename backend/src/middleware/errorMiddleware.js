const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: 'NOT_FOUND',
  });
};

const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('[Error Occurred]:', err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    error: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

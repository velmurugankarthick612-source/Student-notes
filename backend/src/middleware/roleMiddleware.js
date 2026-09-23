const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for role verification.',
        error: 'UNAUTHORIZED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`,
        error: 'FORBIDDEN_INSUFFICIENT_ROLE',
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};

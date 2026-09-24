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
      if (allowedRoles.length === 1 && allowedRoles[0] === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
          error: 'FORBIDDEN',
        });
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`,
        error: 'FORBIDDEN',
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};

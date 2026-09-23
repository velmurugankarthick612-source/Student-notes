const { supabase, isConfigured } = require('../config/supabase');

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        error: 'UNAUTHORIZED',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Current user profile retrieved',
      data: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    // In JWT architecture, client discards token. We also acknowledge logout here.
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message,
    });
  }
};

module.exports = {
  getMe,
  logout,
};

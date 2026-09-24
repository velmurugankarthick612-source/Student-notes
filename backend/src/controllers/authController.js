const { supabase, isConfigured } = require('../config/supabase');
const studentService = require('../services/studentService');

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        error: 'UNAUTHORIZED',
      });
    }

    if (req.user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your administrator.',
        error: 'ACCOUNT_DEACTIVATED',
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS',
      });
    }

    // 1. Check for demo administrator credentials (development mode)
    const normEmail = (email || '').trim().toLowerCase();
    if (
      (normEmail === 'admin@studyhub.local' && password === 'Admin@12345') ||
      (normEmail === 'admin@studyhub.com' && password === 'Admin@123456')
    ) {
      const adminUser = {
        id: '33333333-3333-3333-3333-333333333333',
        full_name: 'StudyHub Administrator',
        email: normEmail,
        role: 'admin',
        status: 'active',
        register_number: 'ADM001',
      };
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: 'demo-token-admin',
        data: adminUser,
      });
    }

    // 2. Try student authentication service
    const authResult = await studentService.authenticateStudent(email, password);
    if (authResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: authResult.token,
        data: authResult.user,
      });
    }

    if (authResult.deactivated) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your administrator.',
        error: 'ACCOUNT_DEACTIVATED',
      });
    }

    // 3. Try Supabase Auth if configured
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.session) {
        // Check profile status
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.status === 'inactive') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Please contact your administrator.',
            error: 'ACCOUNT_DEACTIVATED',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token: data.session.access_token,
          data: profile || data.user,
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

const disableRegister = (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public student registration is disabled. Student accounts must be created by an administrator.',
    error: 'REGISTRATION_DISABLED',
  });
};

const logout = async (req, res) => {
  try {
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
  login,
  disableRegister,
  logout,
};

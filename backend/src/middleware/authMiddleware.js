const { supabase, isConfigured } = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
        error: 'UNAUTHORIZED_NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    // Demo token support for direct demo portal access
    if (token && token.startsWith('demo-token-')) {
      const demoRole = token.replace('demo-token-', '');
      const demoProfiles = {
        student: {
          id: '11111111-1111-1111-1111-111111111111',
          full_name: 'Priya Sharma (Demo Student)',
          email: 'student.demo@studyhub.edu',
          college: 'College of Engineering, Guindy',
          role: 'student',
          semester: 4,
          department_id: 'a0000000-0000-0000-0000-000000000001',
        },
        moderator: {
          id: '22222222-2222-2222-2222-222222222222',
          full_name: 'David Chen (Demo Moderator)',
          email: 'moderator.demo@studyhub.edu',
          college: 'National Institute of Technology',
          role: 'moderator',
          semester: 6,
          department_id: 'a0000000-0000-0000-0000-000000000002',
        },
        admin: {
          id: '33333333-3333-3333-3333-333333333333',
          full_name: 'StudyHub Administrator',
          email: 'admin.demo@studyhub.edu',
          college: 'Anna University Campus',
          role: 'admin',
          semester: 8,
          department_id: 'a0000000-0000-0000-0000-000000000001',
        },
      };

      req.user = demoProfiles[demoRole] || demoProfiles.student;
      return next();
    }

    if (!isConfigured || !supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase authentication service is not configured on the backend.',
        error: 'SUPABASE_NOT_CONFIGURED',
      });
    }

    // Verify token with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid or expired. Please log in again.',
        error: 'INVALID_TOKEN',
      });
    }

    const authUser = authData.user;

    // Retrieve or synchronize user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, college, department_id, semester, role, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile in authMiddleware:', profileError);
    }

    // If profile record does not exist yet (e.g. initial login before trigger), create fallback
    let userProfile = profile;
    if (!userProfile) {
      const newProfile = {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        email: authUser.email,
        college: authUser.user_metadata?.college || '',
        role: authUser.user_metadata?.role || 'student',
      };

      const { data: insertedProfile } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .maybeSingle();

      userProfile = insertedProfile || newProfile;
    }

    req.user = {
      id: authUser.id,
      email: authUser.email,
      role: userProfile.role || 'student',
      full_name: userProfile.full_name,
      college: userProfile.college,
      department_id: userProfile.department_id,
      semester: userProfile.semester,
      avatar_url: userProfile.avatar_url,
    };

    next();
  } catch (error) {
    console.error('Unexpected error in authMiddleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication verification.',
      error: 'AUTH_INTERNAL_ERROR',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (token && token.startsWith('demo-token-')) {
      const demoRole = token.replace('demo-token-', '');
      req.user = {
        id: demoRole === 'admin' ? '33333333-3333-3333-3333-333333333333' : '11111111-1111-1111-1111-111111111111',
        email: `${demoRole}.demo@studyhub.edu`,
        role: demoRole,
      };
      return next();
    }

    if (!isConfigured || !supabase) {
      req.user = null;
      return next();
    }

    const { data: authData } = await supabase.auth.getUser(token);
    if (!authData?.user) {
      req.user = null;
      return next();
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, college, department_id, semester, role, avatar_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    req.user = profile || {
      id: authData.user.id,
      email: authData.user.email,
      role: 'student',
    };

    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};

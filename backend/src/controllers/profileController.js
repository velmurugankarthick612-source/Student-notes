const { supabase, isConfigured } = require('../config/supabase');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isConfigured || !supabase) {
      return res.status(200).json({
        success: true,
        data: req.user,
      });
    }

    // Fetch profile with department details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        college,
        semester,
        role,
        avatar_url,
        created_at,
        updated_at,
        department:departments (
          id,
          name,
          code
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        error: 'PROFILE_NOT_FOUND',
      });
    }

    // Gather statistics: uploads count, bookmarks count, ratings given
    const [{ count: uploadsCount }, { count: bookmarksCount }, { count: ratingsCount }] =
      await Promise.all([
        supabase.from('resources').select('*', { count: 'exact', head: true }).eq('uploaded_by', userId),
        supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        ...profile,
        stats: {
          uploads: uploadsCount || 0,
          bookmarks: bookmarksCount || 0,
          ratings: ratingsCount || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, college, department_id, semester, avatar_url } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({
        success: false,
        message: 'Database is not configured',
        error: 'DB_NOT_CONFIGURED',
      });
    }

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (college !== undefined) updateData.college = college;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (semester !== undefined) updateData.semester = semester;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select(`
        id,
        full_name,
        email,
        college,
        semester,
        role,
        avatar_url,
        department:departments (
          id,
          name,
          code
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update profile: ${error.message}`,
        error: 'UPDATE_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

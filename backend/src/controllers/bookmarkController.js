const { supabase, isConfigured } = require('../config/supabase');

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        resource:resources (
          id,
          title,
          description,
          resource_type,
          file_name,
          file_path,
          file_size,
          mime_type,
          external_url,
          status,
          views,
          downloads,
          created_at,
          subject:subjects (
            id,
            name,
            code,
            semester,
            department:departments (
              id,
              name,
              code
            )
          ),
          unit:units (
            id,
            unit_number,
            title
          ),
          ratings (
            id,
            rating
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookmarks',
        error: error.message,
      });
    }

    // Format output with average ratings and filter out deleted resources
    const validBookmarks = (bookmarks || [])
      .filter((b) => b.resource && b.resource.status === 'approved')
      .map((b) => {
        const res = b.resource;
        const ratingsArr = res.ratings || [];
        const totalRatings = ratingsArr.length;
        const avgRating =
          totalRatings > 0
            ? Number((ratingsArr.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
            : 0;

        return {
          bookmark_id: b.id,
          bookmarked_at: b.created_at,
          ...res,
          average_rating: avgRating,
          ratings_count: totalRatings,
          is_bookmarked: true,
          ratings: undefined,
        };
      });

    return res.status(200).json({
      success: true,
      message: 'Bookmarks retrieved successfully',
      data: validBookmarks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving bookmarks',
      error: error.message,
    });
  }
};

const addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resourceId } = req.body;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required',
        error: 'MISSING_RESOURCE_ID',
      });
    }

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    // Verify resource exists and is approved
    const { data: resource, error: resError } = await supabase
      .from('resources')
      .select('id, status')
      .eq('id', resourceId)
      .single();

    if (resError || !resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
      });
    }

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        resource_id: resourceId,
      })
      .select()
      .single();

    if (error) {
      // Duplicate constraint 23505
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Resource is already bookmarked',
          error: 'ALREADY_BOOKMARKED',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Failed to bookmark resource: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Resource bookmarked successfully',
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding bookmark',
      error: error.message,
    });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resourceId } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to remove bookmark: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error removing bookmark',
      error: error.message,
    });
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
};

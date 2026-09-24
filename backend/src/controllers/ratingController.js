const { supabase, isConfigured } = require('../config/supabase');

const getResourceRatings = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select(`
        id,
        rating,
        review,
        created_at,
        updated_at,
        user:profiles!ratings_user_id_fkey (
          id,
          full_name,
          college,
          avatar_url
        )
      `)
      .eq('resource_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return res.status(200).json({ success: true, data: [] });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ratings',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: ratings || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving ratings',
      error: error.message,
    });
  }
};

const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: resourceId } = req.params;
    const { rating, review } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    // Verify resource exists
    const { data: resource, error: resError } = await supabase
      .from('resources')
      .select('id')
      .eq('id', resourceId)
      .single();

    if (resError || !resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
      });
    }

    // Upsert rating (if already rated, updates rating & review)
    const { data: upsertedRating, error } = await supabase
      .from('ratings')
      .upsert(
        {
          user_id: userId,
          resource_id: resourceId,
          rating,
          review: review || null,
        },
        { onConflict: 'user_id, resource_id' }
      )
      .select(`
        id,
        rating,
        review,
        created_at,
        updated_at,
        user:profiles!ratings_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to submit rating: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating and review submitted successfully',
      data: upsertedRating,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error submitting rating',
      error: error.message,
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ratingId } = req.params;
    const { rating, review } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: existing, error: findError } = await supabase
      .from('ratings')
      .select('id, user_id')
      .eq('id', ratingId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
        error: 'RATING_NOT_FOUND',
      });
    }

    if (existing.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own rating',
        error: 'FORBIDDEN',
      });
    }

    const { data: updated, error } = await supabase
      .from('ratings')
      .update({
        rating,
        review: review || null,
      })
      .eq('id', ratingId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update rating: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating rating',
      error: error.message,
    });
  }
};

const deleteRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ratingId } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: existing, error: findError } = await supabase
      .from('ratings')
      .select('id, user_id')
      .eq('id', ratingId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
        error: 'RATING_NOT_FOUND',
      });
    }

    if (existing.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own rating',
        error: 'FORBIDDEN',
      });
    }

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to delete rating: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting rating',
      error: error.message,
    });
  }
};

module.exports = {
  getResourceRatings,
  submitRating,
  updateRating,
  deleteRating,
};

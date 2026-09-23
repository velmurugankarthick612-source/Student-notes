const { supabase, isConfigured } = require('../config/supabase');
const { getSignedDownloadUrl } = require('./storageService');

const getResourceById = async (id, currentUser = null) => {
  if (!isConfigured || !supabase) {
    throw new Error('Database service is not configured.');
  }

  const { data: resource, error } = await supabase
    .from('resources')
    .select(`
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
      rejection_reason,
      views,
      downloads,
      created_at,
      updated_at,
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
        title,
        description
      ),
      uploader:profiles!resources_uploaded_by_fkey (
        id,
        full_name,
        email,
        college,
        role,
        avatar_url
      ),
      ratings (
        id,
        rating,
        review,
        created_at,
        user_id,
        user:profiles!ratings_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single();

  let activeResource = resource;
  if (error || !activeResource) {
    const mockMatch = require('../data/mockData').MOCK_RESOURCES.find((r) => r.id === id);
    if (mockMatch) {
      activeResource = {
        ...mockMatch,
        ratings: [],
      };
    } else {
      return null;
    }
  }

  // Access Control: If resource is not approved, only owner or moderator/admin can view it
  if (activeResource.status !== 'approved') {
    const isOwner = currentUser && currentUser.id === activeResource.uploader?.id;
    const isStaff = currentUser && ['moderator', 'admin'].includes(currentUser.role);
    if (!isOwner && !isStaff) {
      return { forbidden: true };
    }
  }

  // Compute ratings and user-specific stats
  const ratings = activeResource.ratings || [];
  const totalRatings = ratings.length;
  const avgRating =
    totalRatings > 0
      ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
      : 0;

  let isBookmarked = false;
  let userRating = null;

  if (currentUser) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('resource_id', id)
      .maybeSingle();

    isBookmarked = Boolean(bookmark);

    const existingRating = ratings.find((r) => r.user_id === currentUser.id);
    if (existingRating) {
      userRating = existingRating.rating;
    }
  }

  // Generate file URL (signed URL if stored in Supabase)
  let fileUrl = activeResource.external_url;
  if (activeResource.file_path) {
    fileUrl = await getSignedDownloadUrl(activeResource.file_path);
  }

  return {
    ...activeResource,
    file_url: fileUrl,
    average_rating: avgRating,
    ratings_count: totalRatings,
    is_bookmarked: isBookmarked,
    user_rating: userRating,
  };
};

const incrementViews = async (id) => {
  if (!isConfigured || !supabase) return false;
  const { error } = await supabase.rpc('increment_resource_views', { res_id: id });
  if (error) {
    // Fallback if rpc is not created yet
    const { data } = await supabase.from('resources').select('views').eq('id', id).single();
    if (data) {
      await supabase.from('resources').update({ views: (data.views || 0) + 1 }).eq('id', id);
    }
  }
  return true;
};

const incrementDownloads = async (id) => {
  if (!isConfigured || !supabase) return false;
  const { error } = await supabase.rpc('increment_resource_downloads', { res_id: id });
  if (error) {
    // Fallback if rpc is not created yet
    const { data } = await supabase.from('resources').select('downloads').eq('id', id).single();
    if (data) {
      await supabase.from('resources').update({ downloads: (data.downloads || 0) + 1 }).eq('id', id);
    }
  }
  return true;
};

module.exports = {
  getResourceById,
  incrementViews,
  incrementDownloads,
};

const { supabase, isConfigured } = require('../config/supabase');

const searchResources = async ({
  q,
  department,
  semester,
  subject,
  unit,
  resourceType,
  sort = 'newest',
  page = 1,
  limit = 12,
  status = 'approved',
  userId = null,
}) => {
  if (!isConfigured || !supabase) {
    return {
      data: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0,
      },
    };
  }

  const offset = (page - 1) * limit;

  // Build base query
  let query = supabase
    .from('resources')
    .select(
      `
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
        title
      ),
      uploader:profiles!resources_uploaded_by_fkey (
        id,
        full_name,
        email,
        college,
        role
      ),
      ratings (
        id,
        rating,
        user_id
      )
    `,
      { count: 'exact' }
    );

  // Status filter (if status is specified and not 'all')
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  // Text search on title or description
  if (q && q.trim()) {
    const trimmed = q.trim();
    // ilike for flexible matching
    query = query.or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`);
  }

  // Filter by subject
  if (subject) {
    query = query.eq('subject_id', subject);
  }

  // Filter by unit
  if (unit) {
    query = query.eq('unit_id', unit);
  }

  // Filter by resource type
  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  // Sorting
  if (sort === 'views') {
    query = query.order('views', { ascending: false });
  } else if (sort === 'downloads') {
    query = query.order('downloads', { ascending: false });
  } else {
    // Default: newest
    query = query.order('created_at', { ascending: false });
  }

  let rawData = [];
  let totalCount = 0;

  try {
    const { data, count, error } = await query.range(offset, offset + limit - 1);
    if (!error && data && data.length > 0) {
      rawData = data;
      totalCount = count || data.length;
    } else {
      throw error || new Error('No data found, fallback to sample data');
    }
  } catch (err) {
    // Graceful fallback to Mock Academic Resources
    let filtered = [...require('../data/mockData').MOCK_RESOURCES];

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (q && q.trim()) {
      const lower = q.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(lower) ||
          r.description?.toLowerCase().includes(lower) ||
          r.resource_type?.toLowerCase().includes(lower)
      );
    }
    if (department) {
      filtered = filtered.filter(
        (r) =>
          r.subject?.department?.id === department ||
          r.subject?.department?.code === department
      );
    }
    if (semester) {
      filtered = filtered.filter((r) => r.subject?.semester === Number(semester));
    }
    if (subject) {
      filtered = filtered.filter((r) => r.subject_id === subject || r.subject?.id === subject);
    }
    if (unit) {
      filtered = filtered.filter((r) => r.unit_id === unit || String(r.unit?.unit_number) === String(unit));
    }
    if (resourceType) {
      filtered = filtered.filter((r) => r.resource_type === resourceType);
    }

    if (sort === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === 'downloads') {
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    totalCount = filtered.length;
    rawData = filtered.slice(offset, offset + limit);

    return {
      data: rawData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  // Post-process resources:
  let processedData = rawData || [];

  if (department) {
    processedData = processedData.filter(
      (r) => r.subject?.department?.id === department || r.subject?.department?.code === department
    );
  }

  if (semester) {
    const semNum = Number(semester);
    processedData = processedData.filter((r) => r.subject?.semester === semNum);
  }

  // Compute average rating and user bookmark status if userId is provided
  let userBookmarksSet = new Set();
  if (userId) {
    const { data: userBookmarks } = await supabase
      .from('bookmarks')
      .select('resource_id')
      .eq('user_id', userId);

    if (userBookmarks) {
      userBookmarksSet = new Set(userBookmarks.map((b) => b.resource_id));
    }
  }

  processedData = processedData.map((res) => {
    const ratingsArr = res.ratings || [];
    const totalRatings = ratingsArr.length;
    const avgRating =
      totalRatings > 0
        ? Number(
            (ratingsArr.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
          )
        : 0;

    const userRatingObj = userId
      ? ratingsArr.find((r) => r.user_id === userId)
      : null;

    return {
      ...res,
      average_rating: avgRating,
      ratings_count: totalRatings,
      is_bookmarked: userBookmarksSet.has(res.id),
      user_rating: userRatingObj ? userRatingObj.rating : null,
      ratings: undefined, // Strip raw ratings array from card payload for speed
    };
  });

  // Sort by rating in memory if sort === 'rating'
  if (sort === 'rating') {
    processedData.sort((a, b) => b.average_rating - a.average_rating);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || (processedData.length > 0 ? 1 : 0);

  return {
    data: processedData,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };
};

module.exports = {
  searchResources,
};

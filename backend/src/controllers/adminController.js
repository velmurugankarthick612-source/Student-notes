const { supabase, isConfigured } = require('../config/supabase');
const { deleteResourceFile } = require('../services/storageService');
const subjectService = require('../services/subjectService');

const getPlatformStatistics = async (req, res) => {
  try {
    if (!isConfigured || !supabase) {
      const subjectStats = await subjectService.getSubjectStats();
      return res.status(200).json({
        success: true,
        data: {
          totalUsers: 0,
          totalResources: 0,
          pendingResources: 0,
          approvedResources: 0,
          totalDownloads: 0,
          totalReports: 0,
          totalDepartments: subjectStats.totalDepartments,
          totalSubjects: subjectStats.totalSubjects,
          activeSubjects: subjectStats.activeSubjects,
          inactiveSubjects: subjectStats.inactiveSubjects,
          totalUnits: subjectStats.totalUnits,
          recentUploads: [],
          pendingApprovals: [],
          recentReports: [],
          topDownloaded: [],
        },
      });
    }

    const [
      { count: totalUsers },
      { count: totalResources },
      { count: pendingResources },
      { count: approvedResources },
      { count: totalReports },
      { data: downloadSumData },
      { data: recentUploads },
      { data: pendingApprovals },
      { data: recentReports },
      { data: topDownloaded },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('resources').select('downloads'),
      supabase
        .from('resources')
        .select(`
          id,
          title,
          status,
          created_at,
          resource_type,
          uploader:profiles!resources_uploaded_by_fkey(full_name, email),
          subject:subjects(name, code)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('resources')
        .select(`
          id,
          title,
          created_at,
          resource_type,
          file_name,
          uploader:profiles!resources_uploaded_by_fkey(full_name, email),
          subject:subjects(name, code)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5),
      supabase
        .from('reports')
        .select(`
          id,
          reason,
          created_at,
          status,
          resource:resources(id, title),
          reporter:profiles!reports_reported_by_fkey(full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('resources')
        .select(`
          id,
          title,
          downloads,
          views,
          resource_type,
          subject:subjects(name, code)
        `)
        .eq('status', 'approved')
        .order('downloads', { ascending: false })
        .limit(5),
    ]);

    const totalDownloads = (downloadSumData || []).reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    const subjectStats = await subjectService.getSubjectStats();

    // Query Supabase for curriculum stats if available
    let deptCount = subjectStats.totalDepartments;
    let subjCount = subjectStats.totalSubjects;
    let activeSubjCount = subjectStats.activeSubjects;
    let inactiveSubjCount = subjectStats.inactiveSubjects;
    let unitCount = subjectStats.totalUnits;

    try {
      const [
        { count: dbDepts },
        { count: dbSubjs },
        { count: dbActiveSubjs },
        { count: dbInactiveSubjs },
        { count: dbUnits },
      ] = await Promise.all([
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
        supabase.from('units').select('*', { count: 'exact', head: true }),
      ]);

      if (dbDepts !== null && dbDepts !== undefined) deptCount = dbDepts;
      if (dbSubjs !== null && dbSubjs !== undefined) subjCount = dbSubjs;
      if (dbActiveSubjs !== null && dbActiveSubjs !== undefined) activeSubjCount = dbActiveSubjs;
      if (dbInactiveSubjs !== null && dbInactiveSubjs !== undefined) inactiveSubjCount = dbInactiveSubjs;
      if (dbUnits !== null && dbUnits !== undefined) unitCount = dbUnits;
    } catch (e) {
      // Keep subjectStats fallback
    }

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalResources: totalResources || 0,
        pendingResources: pendingResources || 0,
        approvedResources: approvedResources || 0,
        totalDownloads,
        totalReports: totalReports || 0,
        totalDepartments: deptCount,
        totalSubjects: subjCount,
        activeSubjects: activeSubjCount,
        inactiveSubjects: inactiveSubjCount,
        totalUnits: unitCount,
        recentUploads: recentUploads || [],
        pendingApprovals: pendingApprovals || [],
        recentReports: recentReports || [],
        topDownloaded: topDownloaded || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error calculating statistics',
      error: error.message,
    });
  }
};

const getPendingResources = async (req, res) => {
  try {
    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: pending, error } = await supabase
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
        created_at,
        uploader:profiles!resources_uploaded_by_fkey (
          id,
          full_name,
          email,
          college
        ),
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
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending resources',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: pending || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving pending resources',
      error: error.message,
    });
  }
};

const approveResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: updated, error } = await supabase
      .from('resources')
      .update({
        status: 'approved',
        rejection_reason: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to approve resource: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource successfully approved and published',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error approving resource',
      error: error.message,
    });
  }
};

const rejectResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: updated, error } = await supabase
      .from('resources')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'Resource does not meet academic guidelines or syllabus standards.',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to reject resource: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource marked as rejected',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error rejecting resource',
      error: error.message,
    });
  }
};

const deleteAdminResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: existing } = await supabase
      .from('resources')
      .select('file_path')
      .eq('id', id)
      .single();

    if (existing?.file_path) {
      await deleteResourceFile(existing.file_path);
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to delete resource: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource permanently deleted',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting resource',
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
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
        department:departments (id, name, code)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,college.ilike.%${term}%`);
    }

    const { data: users, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: users || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users',
      error: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    // Prevent removing admin role from oneself if it's the current user
    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote your own admin account.',
        error: 'CANNOT_DEMOTE_SELF',
      });
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select('id, full_name, email, role')
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update user role: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to '${role}'`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating user role',
      error: error.message,
    });
  }
};

module.exports = {
  getPlatformStatistics,
  getPendingResources,
  approveResource,
  rejectResource,
  deleteAdminResource,
  getUsers,
  updateUserRole,
};

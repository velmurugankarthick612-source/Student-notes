const { supabase, isConfigured } = require('../config/supabase');

const createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: resourceId } = req.params;
    const { reason, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    // Verify resource exists
    const { data: resource, error: resError } = await supabase
      .from('resources')
      .select('id, title')
      .eq('id', resourceId)
      .single();

    if (resError || !resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
      });
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        resource_id: resourceId,
        reported_by: userId,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to submit report: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback. Our moderation team will review this resource shortly.',
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error submitting report',
      error: error.message,
    });
  }
};

const getAdminReports = async (req, res) => {
  try {
    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { status } = req.query;

    let query = supabase
      .from('reports')
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        resolved_at,
        resource:resources (
          id,
          title,
          resource_type,
          file_name,
          file_path,
          status,
          uploaded_by,
          subject:subjects (
            id,
            name,
            code
          )
        ),
        reporter:profiles!reports_reported_by_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      if (error.code === 'PGRST205') {
        return res.status(200).json({ success: true, data: [] });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve reports',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: reports || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving reports',
      error: error.message,
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const updatePayload = {
      status,
      resolved_at: ['resolved', 'dismissed'].includes(status) ? new Date().toISOString() : null,
    };

    const { data: updated, error } = await supabase
      .from('reports')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update report status: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating report',
      error: error.message,
    });
  }
};

module.exports = {
  createReport,
  getAdminReports,
  updateReportStatus,
};

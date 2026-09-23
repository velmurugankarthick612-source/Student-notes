const { supabase, isConfigured } = require('../config/supabase');
const { searchResources } = require('../services/searchService');
const { getResourceById, incrementViews, incrementDownloads } = require('../services/resourceService');
const { uploadResourceFile, deleteResourceFile } = require('../services/storageService');

const searchResourcesEndpoint = async (req, res) => {
  try {
    const { q, department, semester, subject, unit, resourceType, sort, page, limit } = req.query;

    const results = await searchResources({
      q,
      department,
      semester,
      subject,
      unit,
      resourceType,
      sort,
      page,
      limit,
      status: 'approved',
      userId: req.user?.id || null,
    });

    return res.status(200).json({
      success: true,
      message: 'Resources retrieved successfully',
      data: results.data,
      pagination: results.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to search resources',
      error: error.message,
    });
  }
};

const getAllResources = searchResourcesEndpoint;

const getResourceByIdEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await getResourceById(id, req.user);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
      });
    }

    if (resource.forbidden) {
      return res.status(403).json({
        success: false,
        message: 'This resource is pending approval and can only be viewed by its owner or an administrator.',
        error: 'FORBIDDEN_RESOURCE_PENDING',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource retrieved successfully',
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching resource details',
      error: error.message,
    });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, description, subject_id, unit_id, resource_type, external_url } = req.body;
    const file = req.file;

    if (!file && !external_url) {
      return res.status(400).json({
        success: false,
        message: 'Either an uploaded PDF file or an external URL is required.',
        error: 'MISSING_FILE_OR_URL',
      });
    }

    if (!isConfigured || !supabase) {
      return res.status(500).json({
        success: false,
        message: 'Database is not configured',
        error: 'DB_NOT_CONFIGURED',
      });
    }

    // Retrieve subject & department info for structured storage naming
    const { data: subject, error: subjError } = await supabase
      .from('subjects')
      .select('id, name, code, semester, department:departments(code)')
      .eq('id', subject_id)
      .single();

    if (subjError || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID provided',
        error: 'INVALID_SUBJECT',
      });
    }

    let fileUploadResult = null;
    if (file) {
      fileUploadResult = await uploadResourceFile(file.buffer, {
        departmentCode: subject.department?.code || 'GEN',
        semester: subject.semester || 1,
        subjectCode: subject.code || 'SUBJ',
        originalName: file.originalname,
        mimeType: file.mimetype,
      });
    }

    // Construct resource insert object (status is ALWAYS 'pending' for students)
    const resourceInsert = {
      title,
      description: description || null,
      subject_id,
      unit_id: unit_id || null,
      uploaded_by: req.user.id,
      resource_type,
      file_name: fileUploadResult?.fileName || null,
      file_path: fileUploadResult?.filePath || null,
      file_size: fileUploadResult?.fileSize || null,
      mime_type: fileUploadResult?.mimeType || null,
      external_url: external_url || fileUploadResult?.publicUrl || null,
      status: 'pending', // Strictly pending for all student uploads
      views: 0,
      downloads: 0,
    };

    const { data: newResource, error: insertError } = await supabase
      .from('resources')
      .insert(resourceInsert)
      .select()
      .single();

    if (insertError) {
      // Rollback uploaded file if DB insert fails
      if (fileUploadResult?.filePath) {
        await deleteResourceFile(fileUploadResult.filePath);
      }
      return res.status(400).json({
        success: false,
        message: `Failed to create resource: ${insertError.message}`,
        error: insertError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Resource submitted successfully! It will be publicly visible once approved by a moderator or admin.',
      data: newResource,
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error uploading resource',
      error: error.message,
    });
  }
};

const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject_id, unit_id, resource_type, external_url } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    // Check existing resource
    const { data: existing, error: checkError } = await supabase
      .from('resources')
      .select('id, uploaded_by, status')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
      });
    }

    // Role check: Admin/moderator or owner if still pending
    const isOwner = req.user.id === existing.uploaded_by;
    const isStaff = ['moderator', 'admin'].includes(req.user.role);

    if (!isStaff && (!isOwner || existing.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own pending resources.',
        error: 'FORBIDDEN_EDIT',
      });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (subject_id) updateFields.subject_id = subject_id;
    if (unit_id !== undefined) updateFields.unit_id = unit_id;
    if (resource_type) updateFields.resource_type = resource_type;
    if (external_url !== undefined) updateFields.external_url = external_url;

    const { data: updated, error } = await supabase
      .from('resources')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update resource: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating resource',
      error: error.message,
    });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: existing, error: checkError } = await supabase
      .from('resources')
      .select('id, uploaded_by, status, file_path')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
      });
    }

    // Role check: Only admin or the owner if it is pending
    const isOwner = req.user.id === existing.uploaded_by;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isOwner || existing.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this resource.',
        error: 'FORBIDDEN_DELETE',
      });
    }

    // Delete file from storage if present
    if (existing.file_path) {
      await deleteResourceFile(existing.file_path);
    }

    const { error: deleteError } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: `Failed to delete resource: ${deleteError.message}`,
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
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

const recordView = async (req, res) => {
  try {
    const { id } = req.params;
    await incrementViews(id);
    return res.status(200).json({
      success: true,
      message: 'View recorded',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error recording view',
      error: error.message,
    });
  }
};

const recordDownload = async (req, res) => {
  try {
    const { id } = req.params;
    await incrementDownloads(id);
    return res.status(200).json({
      success: true,
      message: 'Download recorded',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error recording download',
      error: error.message,
    });
  }
};

const getMyUploads = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: uploads, error } = await supabase
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
          department:departments (id, name, code)
        ),
        unit:units (
          id,
          unit_number,
          title
        )
      `)
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve uploads',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: uploads || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user uploads',
      error: error.message,
    });
  }
};

module.exports = {
  searchResourcesEndpoint,
  getAllResources,
  getResourceByIdEndpoint,
  createResource,
  updateResource,
  deleteResource,
  recordView,
  recordDownload,
  getMyUploads,
};

const subjectService = require('../services/subjectService');

/**
 * POST /api/admin/subjects
 * Create new subject (Admin only)
 */
const createSubject = async (req, res) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message || 'Subject code already exists.',
        error: error.code || 'DUPLICATE_SUBJECT_CODE',
      });
    }
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'BAD_REQUEST',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subject',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * PUT /api/admin/subjects/:id
 * Update subject details (Admin only)
 */
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await subjectService.updateSubject(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updated,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message || 'Subject code already exists.',
        error: error.code || 'DUPLICATE_SUBJECT_CODE',
      });
    }
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Subject not found',
        error: 'SUBJECT_NOT_FOUND',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subject',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * PATCH /api/admin/subjects/:id/status
 * Toggle or update subject status (Admin only)
 */
const updateSubjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await subjectService.updateSubjectStatus(id, status);
    return res.status(200).json({
      success: true,
      message: `Subject status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Subject not found',
        error: 'SUBJECT_NOT_FOUND',
      });
    }
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to update subject status',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * DELETE /api/admin/subjects/:id
 * Delete subject (Admin only - prevents deletion if resources exist)
 */
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subjectService.deleteSubject(id);
    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      data: result.deleted,
    });
  } catch (error) {
    if (error.status === 400 && error.code === 'SUBJECT_HAS_RESOURCES') {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'SUBJECT_HAS_RESOURCES',
        recommendation: 'deactivate',
      });
    }
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Subject not found',
        error: 'SUBJECT_NOT_FOUND',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete subject',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * POST /api/admin/subjects/:subjectId/units
 * Add a unit to a subject (Admin only)
 */
const createSubjectUnit = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const unit = await subjectService.createUnit(subjectId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        error: error.code || 'DUPLICATE_UNIT_NUMBER',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create unit',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * PUT /api/admin/units/:id
 * Update unit details (Admin only)
 */
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await subjectService.updateUnit(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Unit updated successfully',
      data: unit,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        error: error.code || 'DUPLICATE_UNIT_NUMBER',
      });
    }
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found',
        error: 'UNIT_NOT_FOUND',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update unit',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * DELETE /api/admin/units/:id
 * Delete unit (Admin only)
 */
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subjectService.deleteUnit(id);
    return res.status(200).json({
      success: true,
      message: 'Unit deleted successfully',
      data: result.deleted,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found',
        error: 'UNIT_NOT_FOUND',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete unit',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

module.exports = {
  createSubject,
  updateSubject,
  updateSubjectStatus,
  deleteSubject,
  createSubjectUnit,
  updateUnit,
  deleteUnit,
};

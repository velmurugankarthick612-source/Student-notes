const subjectService = require('../services/subjectService');

/**
 * GET /api/subjects
 * Public/Student curriculum viewing.
 * Filters by department_id, semester, status, search.
 * By default, unauthenticated and student users only see active subjects.
 */
const getAllSubjects = async (req, res) => {
  try {
    const { department_id, semester, status, search } = req.query;
    const userRole = req.user?.role || 'student';

    const subjects = await subjectService.getAllSubjects({
      department_id: department_id || undefined,
      semester: semester ? Number(semester) : undefined,
      status: status || undefined,
      search: search || undefined,
      role: userRole,
    });

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve curriculum subjects',
      error: error.message,
    });
  }
};

/**
 * GET /api/subjects/:id
 * Retrieve single subject with its units and resource statistics.
 */
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await subjectService.getSubjectById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
        error: 'SUBJECT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving subject details',
      error: error.message,
    });
  }
};

/**
 * GET /api/subjects/:subjectId/units
 * Retrieve syllabus units for a subject.
 */
const getUnitsForSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const units = await subjectService.getUnitsForSubject(subjectId);

    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subject units',
      error: error.message,
    });
  }
};

/**
 * Legacy admin action delegates (for backward compatibility if hit via /api/subjects)
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
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to create subject',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

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
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to update subject',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

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
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to delete subject',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  getUnitsForSubject,
  createSubject,
  updateSubject,
  deleteSubject,
};

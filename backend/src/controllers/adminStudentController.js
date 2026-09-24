const studentService = require('../services/studentService');
const { getAuditLogs } = require('../services/auditService');

/**
 * POST /api/admin/students
 * Create a new student account (Admin only)
 */
const createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: student,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        error: error.code || 'DUPLICATE_ENTRY',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create student account',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * GET /api/admin/students
 * List all students with search & filters (Admin only)
 */
const getStudents = async (req, res) => {
  try {
    const { search, department_id, semester, status, page, limit } = req.query;
    const result = await studentService.getStudents({
      search,
      department_id,
      semester,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.students,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/students/:id
 * Retrieve a specific student by ID (Admin only)
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details',
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/students/:id
 * Update student information (Admin only)
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await studentService.updateStudent(id, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: 'Student details updated successfully',
      data: updated,
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        error: error.code || 'DUPLICATE_ENTRY',
      });
    }
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'NOT_FOUND',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update student',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * PATCH /api/admin/students/:id/status
 * Activate or deactivate student access (Admin only)
 */
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await studentService.updateStudentStatus(id, status, req.user);

    return res.status(200).json({
      success: true,
      message: `Student account ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'NOT_FOUND',
      });
    }
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to update student status',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * DELETE /api/admin/students/:id
 * Delete student account (Admin only)
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await studentService.deleteStudent(id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Student account deleted successfully',
      data: null,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'NOT_FOUND',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete student account',
      error: error.code || 'INTERNAL_ERROR',
    });
  }
};

/**
 * GET /api/admin/students/audit/logs
 * Retrieve administrative audit logs
 */
const getAdminAuditLogs = async (req, res) => {
  try {
    const logs = await getAuditLogs();
    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs',
      error: error.message,
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  getAdminAuditLogs,
};

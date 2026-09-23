const { supabase, isConfigured } = require('../config/supabase');
const { MOCK_DEPARTMENTS } = require('../data/mockData');

const getAllDepartments = async (req, res) => {
  try {
    if (!isConfigured || !supabase) {
      return res.status(200).json({ success: true, data: MOCK_DEPARTMENTS });
    }

    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name, code, description, created_at')
      .order('name', { ascending: true });

    if (error || !departments || departments.length === 0) {
      return res.status(200).json({
        success: true,
        data: MOCK_DEPARTMENTS,
      });
    }

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: MOCK_DEPARTMENTS,
    });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      const match = MOCK_DEPARTMENTS.find((d) => d.id === id);
      return match
        ? res.status(200).json({ success: true, data: match })
        : res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        code,
        description,
        created_at,
        subjects (
          id,
          name,
          code,
          semester
        )
      `)
      .eq('id', id)
      .single();

    if (error || !department) {
      const match = MOCK_DEPARTMENTS.find((d) => d.id === id);
      if (match) {
        return res.status(200).json({ success: true, data: match });
      }
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (error || !department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
        error: 'DEPARTMENT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving department',
      error: error.message,
    });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        name,
        code: code.toUpperCase(),
        description,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to create department: ${error.message}`,
        error: error.code === '23505' ? 'DEPARTMENT_CODE_EXISTS' : error.code,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating department',
      error: error.message,
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;

    const { data: department, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update department: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating department',
      error: error.message,
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to delete department: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting department',
      error: error.message,
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

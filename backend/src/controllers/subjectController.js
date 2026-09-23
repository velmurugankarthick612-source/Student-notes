const { supabase, isConfigured } = require('../config/supabase');
const { MOCK_SUBJECTS, MOCK_UNITS } = require('../data/mockData');

const getAllSubjects = async (req, res) => {
  try {
    const { department_id, semester } = req.query;

    if (!isConfigured || !supabase) {
      let filtered = [...MOCK_SUBJECTS];
      if (department_id) filtered = filtered.filter((s) => s.department_id === department_id);
      if (semester) filtered = filtered.filter((s) => s.semester === Number(semester));
      return res.status(200).json({ success: true, data: filtered });
    }

    let query = supabase
      .from('subjects')
      .select(`
        id,
        name,
        code,
        semester,
        description,
        created_at,
        department:departments (
          id,
          name,
          code
        ),
        units (
          id,
          unit_number,
          title
        )
      `)
      .order('semester', { ascending: true })
      .order('name', { ascending: true });

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    if (semester) {
      query = query.eq('semester', Number(semester));
    }

    const { data: subjects, error } = await query;

    if (error || !subjects || subjects.length === 0) {
      let filtered = [...MOCK_SUBJECTS];
      if (department_id) filtered = filtered.filter((s) => s.department_id === department_id);
      if (semester) filtered = filtered.filter((s) => s.semester === Number(semester));
      return res.status(200).json({
        success: true,
        data: filtered,
      });
    }

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    let filtered = [...MOCK_SUBJECTS];
    if (req.query?.department_id) filtered = filtered.filter((s) => s.department_id === req.query.department_id);
    if (req.query?.semester) filtered = filtered.filter((s) => s.semester === Number(req.query.semester));
    return res.status(200).json({
      success: true,
      data: filtered,
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        code,
        semester,
        description,
        created_at,
        department:departments (
          id,
          name,
          code
        ),
        units (
          id,
          unit_number,
          title,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error || !subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
        error: 'SUBJECT_NOT_FOUND',
      });
    }

    // Sort units ascending by unit_number
    if (subject.units) {
      subject.units.sort((a, b) => a.unit_number - b.unit_number);
    }

    // Also get count of approved resources for this subject
    const { count: resourcesCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', id)
      .eq('status', 'approved');

    return res.status(200).json({
      success: true,
      data: {
        ...subject,
        resources_count: resourcesCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving subject details',
      error: error.message,
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const { department_id, semester, name, code, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        department_id,
        semester,
        name,
        code,
        description,
      })
      .select(`
        id,
        name,
        code,
        semester,
        description,
        department:departments (id, name, code)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to create subject: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating subject',
      error: error.message,
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, semester, name, code, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const updateData = {};
    if (department_id) updateData.department_id = department_id;
    if (semester !== undefined) updateData.semester = semester;
    if (name) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;

    const { data: subject, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        code,
        semester,
        description,
        department:departments (id, name, code)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update subject: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating subject',
      error: error.message,
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to delete subject: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting subject',
      error: error.message,
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};

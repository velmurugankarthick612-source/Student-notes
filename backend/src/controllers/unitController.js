const { supabase, isConfigured } = require('../config/supabase');
const { MOCK_UNITS } = require('../data/mockData');

const getAllUnits = async (req, res) => {
  try {
    const { subject_id } = req.query;

    if (!isConfigured || !supabase) {
      let filtered = [...MOCK_UNITS];
      if (subject_id) filtered = filtered.filter((u) => u.subject_id === subject_id);
      return res.status(200).json({ success: true, data: filtered });
    }

    let query = supabase
      .from('units')
      .select(`
        id,
        subject_id,
        unit_number,
        title,
        description,
        created_at,
        subject:subjects (
          id,
          name,
          code,
          semester
        )
      `)
      .order('unit_number', { ascending: true });

    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    const { data: units, error } = await query;

    if (error || !units || units.length === 0) {
      let filtered = [...MOCK_UNITS];
      if (subject_id) filtered = filtered.filter((u) => u.subject_id === subject_id);
      return res.status(200).json({
        success: true,
        data: filtered,
      });
    }

    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    let filtered = [...MOCK_UNITS];
    if (req.query?.subject_id) filtered = filtered.filter((u) => u.subject_id === req.query.subject_id);
    return res.status(200).json({
      success: true,
      data: filtered,
    });
  }
};

const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      const match = MOCK_UNITS.find((u) => u.id === id);
      return match
        ? res.status(200).json({ success: true, data: match })
        : res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const { data: unit, error } = await supabase
      .from('units')
      .select(`
        id,
        subject_id,
        unit_number,
        title,
        description,
        created_at,
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
        )
      `)
      .eq('id', id)
      .single();

    if (error || !unit) {
      const match = MOCK_UNITS.find((u) => u.id === id);
      if (match) {
        return res.status(200).json({ success: true, data: match });
      }
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    return res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving unit',
      error: error.message,
    });
  }
};

const createUnit = async (req, res) => {
  try {
    const { subject_id, unit_number, title, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { data: unit, error } = await supabase
      .from('units')
      .insert({
        subject_id,
        unit_number,
        title,
        description,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to create unit: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating unit',
      error: error.message,
    });
  }
};

const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, unit_number, title, description } = req.body;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const updateData = {};
    if (subject_id) updateData.subject_id = subject_id;
    if (unit_number !== undefined) updateData.unit_number = unit_number;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const { data: unit, error } = await supabase
      .from('units')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to update unit: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Unit updated successfully',
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating unit',
      error: error.message,
    });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Database is not configured' });
    }

    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Failed to delete unit: ${error.message}`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Unit deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting unit',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};

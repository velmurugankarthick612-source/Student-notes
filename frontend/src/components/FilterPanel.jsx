import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Filter, RotateCcw } from 'lucide-react';

const RESOURCE_TYPES = [
  'PDF Notes',
  'Lecture Notes',
  'Question Bank',
  '2-Mark Questions',
  '8-Mark Questions',
  '16-Mark Questions',
  'Previous Year Questions',
  'Lab Manual',
  'Assignment',
  'Cheat Sheet',
  'Video',
  'External Link',
  'Book',
];

const FilterPanel = ({ filters = {}, onFilterChange, onReset }) => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  // Load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.success) {
          setDepartments(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load departments in filter:', err);
      }
    };
    fetchDepts();
  }, []);

  // Load subjects filtered by department & semester
  useEffect(() => {
    const fetchSubjs = async () => {
      try {
        const params = {};
        if (filters.department) params.department_id = filters.department;
        if (filters.semester) params.semester = filters.semester;

        const res = await api.get('/subjects', { params });
        if (res.success) {
          setSubjects(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load subjects in filter:', err);
      }
    };
    fetchSubjs();
  }, [filters.department, filters.semester]);

  // Load units when subject changes
  useEffect(() => {
    if (!filters.subject) {
      setUnits([]);
      return;
    }
    const fetchUnits = async () => {
      try {
        const res = await api.get('/units', { params: { subject_id: filters.subject } });
        if (res.success) {
          setUnits(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load units in filter:', err);
      }
    };
    fetchUnits();
  }, [filters.subject]);

  const handleChange = (field, value) => {
    const nextFilters = { ...filters, [field]: value };
    // Clear child selections when parent filter changes
    if (field === 'department') {
      delete nextFilters.subject;
      delete nextFilters.unit;
    } else if (field === 'semester') {
      delete nextFilters.subject;
      delete nextFilters.unit;
    } else if (field === 'subject') {
      delete nextFilters.unit;
    }
    onFilterChange(nextFilters);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Filter Resources</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Department Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Department
          </label>
          <select
            value={filters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Semester
          </label>
          <select
            value={filters.semester || ''}
            onChange={(e) => handleChange('semester', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Subject
          </label>
          <select
            value={filters.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code ? `[${sub.code}] ` : ''}
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Unit
          </label>
          <select
            value={filters.unit || ''}
            onChange={(e) => handleChange('unit', e.target.value)}
            disabled={!filters.subject}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unit_number}: {u.title}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Resource Type
          </label>
          <select
            value={filters.resourceType || ''}
            onChange={(e) => handleChange('resourceType', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Option */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Sort By
          </label>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="newest">Newest Uploads</option>
            <option value="views">Most Viewed</option>
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

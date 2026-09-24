import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Layers,
  AlertTriangle,
  Power,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getSemesterLabel } from '../utils/formatters';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Subject Modal State
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState(null);
  const [subjForm, setSubjForm] = useState({
    department_id: '',
    semester: 1,
    name: '',
    code: '',
    description: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Manage Units Modal State
  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const [activeSubjectForUnits, setActiveSubjectForUnits] = useState(null);
  const [unitsList, setUnitsList] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [unitForm, setUnitForm] = useState({
    unit_number: 1,
    title: '',
    description: '',
  });
  const [unitSubmitting, setUnitSubmitting] = useState(false);

  // Delete Subject Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, subjRes] = await Promise.all([
        api.get('/departments'),
        api.get('/subjects', {
          params: {
            department_id: filterDept || undefined,
            semester: filterSem || undefined,
            status: filterStatus !== 'all' ? filterStatus : undefined,
            search: searchQuery || undefined,
          },
        }),
      ]);

      if (deptRes.success) setDepartments(deptRes.data || []);
      if (subjRes.success) setSubjects(subjRes.data || []);
    } catch (err) {
      toast.error('Failed to load subjects data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [filterDept, filterSem, filterStatus, searchQuery]);

  // Open Add Subject Modal
  const openAddSubjectModal = () => {
    setEditingSubj(null);
    setFormErrors({});
    setSubjForm({
      department_id: departments[0]?.id || '',
      semester: 1,
      name: '',
      code: '',
      description: '',
      status: 'active',
    });
    setSubjectModalOpen(true);
  };

  // Open Edit Subject Modal
  const openEditSubjectModal = (subj) => {
    setEditingSubj(subj);
    setFormErrors({});
    setSubjForm({
      department_id: subj.department?.id || subj.department_id,
      semester: subj.semester,
      name: subj.name,
      code: subj.code || '',
      description: subj.description || '',
      status: subj.status || 'active',
    });
    setSubjectModalOpen(true);
  };

  // Save Subject (Create or Edit)
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side validation
    const errors = {};
    if (!subjForm.name.trim()) errors.name = 'Subject name is required.';
    if (!subjForm.code.trim()) errors.code = 'Subject code is required.';
    if (!subjForm.department_id) errors.department_id = 'Department is required.';
    if (!subjForm.semester || subjForm.semester < 1 || subjForm.semester > 8) {
      errors.semester = 'Invalid semester. Must be between 1 and 8.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        department_id: subjForm.department_id,
        semester: Number(subjForm.semester),
        name: subjForm.name.trim(),
        code: subjForm.code.trim().toUpperCase(),
        description: subjForm.description.trim() || null,
        status: subjForm.status,
      };

      if (editingSubj) {
        const res = await api.put(`/admin/subjects/${editingSubj.id}`, payload);
        if (res.success) {
          toast.success('Subject updated successfully.');
          setSubjectModalOpen(false);
          loadData();
        }
      } else {
        const res = await api.post('/admin/subjects', payload);
        if (res.success) {
          toast.success('Subject created successfully.');
          setSubjectModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      if (err.error === 'DUPLICATE_SUBJECT_CODE' || err.message?.includes('already exists')) {
        setFormErrors({ code: 'Subject code already exists in this department.' });
      } else {
        toast.error(err.message || 'Failed to save subject.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Subject Status
  const handleToggleStatus = async (subj) => {
    const nextStatus = subj.status === 'active' ? 'inactive' : 'active';
    const confirmMsg =
      nextStatus === 'inactive'
        ? `Deactivate "${subj.name}"? It will be hidden from student curriculum browsing.`
        : `Reactivate "${subj.name}"? It will become visible to students again.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/admin/subjects/${subj.id}/status`, { status: nextStatus });
      if (res.success) {
        toast.success(`Subject is now ${nextStatus}.`);
        setSubjects((prev) =>
          prev.map((s) => (s.id === subj.id ? { ...s, status: nextStatus } : s))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change subject status.');
    }
  };

  // Open Delete Subject Modal
  const openDeleteModal = (subj) => {
    setSubjectToDelete(subj);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Subject
  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await api.delete(`/admin/subjects/${subjectToDelete.id}`);
      if (res.success) {
        toast.success('Subject deleted successfully.');
        setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id));
        setDeleteModalOpen(false);
      }
    } catch (err) {
      setDeleteError(
        err.message || 'Cannot delete subject. Please deactivate it instead if resources are linked.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open Manage Units Modal
  const openUnitsModal = async (subj) => {
    setActiveSubjectForUnits(subj);
    setEditingUnitId(null);
    setUnitForm({
      unit_number: (subj.units?.length || 0) + 1,
      title: '',
      description: '',
    });
    setUnitsModalOpen(true);
    loadSubjectUnits(subj.id);
  };

  const loadSubjectUnits = async (subjectId) => {
    setUnitsLoading(true);
    try {
      const res = await api.get(`/subjects/${subjectId}/units`);
      if (res.success) {
        setUnitsList(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load units for subject.');
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    if (!unitForm.title.trim()) {
      toast.error('Unit title is required.');
      return;
    }

    setUnitSubmitting(true);
    try {
      if (editingUnitId) {
        const res = await api.put(`/admin/units/${editingUnitId}`, {
          unit_number: Number(unitForm.unit_number),
          title: unitForm.title.trim(),
          description: unitForm.description.trim() || null,
        });
        if (res.success) {
          toast.success('Unit updated successfully.');
          setEditingUnitId(null);
          setUnitForm({
            unit_number: unitsList.length + 1,
            title: '',
            description: '',
          });
          loadSubjectUnits(activeSubjectForUnits.id);
          loadData();
        }
      } else {
        const res = await api.post(`/admin/subjects/${activeSubjectForUnits.id}/units`, {
          unit_number: Number(unitForm.unit_number),
          title: unitForm.title.trim(),
          description: unitForm.description.trim() || null,
        });
        if (res.success) {
          toast.success('Unit added successfully.');
          setUnitForm({
            unit_number: unitsList.length + 2,
            title: '',
            description: '',
          });
          loadSubjectUnits(activeSubjectForUnits.id);
          loadData();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save unit.');
    } finally {
      setUnitSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Delete this unit? Associated notes will lose unit grouping.')) return;

    try {
      const res = await api.delete(`/admin/units/${unitId}`);
      if (res.success) {
        toast.success('Unit deleted.');
        loadSubjectUnits(activeSubjectForUnits.id);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete unit.');
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(subjects.length / itemsPerPage);
  const paginatedSubjects = subjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Academic Curriculum Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Subject Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Register, configure, and monitor course syllabus, semester mappings, and syllabus units
            </p>
          </div>

          <button
            onClick={openAddSubjectModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Subjects by code or title..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-56">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments ▼</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-full md:w-40">
            <select
              value={filterSem}
              onChange={(e) => setFilterSem(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Semesters ▼</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-36">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status ▼</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Subjects Table */}
        {loading ? (
          <LoadingSpinner text="Loading curriculum subjects..." />
        ) : paginatedSubjects.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Subject Code</th>
                    <th className="px-6 py-4">Subject Name</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedSubjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                        {s.code || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                        {s.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {s.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {s.department?.code || 'DEPT'}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                          {s.department?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {getSemesterLabel(s.semester)}
                      </td>
                      <td className="px-6 py-4">
                        {s.status === 'active' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Manage Units Button */}
                          <button
                            onClick={() => openUnitsModal(s)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Manage Units"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Units ({s.units?.length || 0})</span>
                          </button>

                          {/* Edit Subject Button */}
                          <button
                            onClick={() => openEditSubjectModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Deactivate / Activate Button */}
                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              s.status === 'active'
                                ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={s.status === 'active' ? 'Deactivate Subject' : 'Activate Subject'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Delete Subject Button */}
                          <button
                            onClick={() => openDeleteModal(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, subjects.length)} of {subjects.length} subjects
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        currentPage === pg
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No subjects registered"
            description="No subjects matched your filter criteria. Add a new subject to populate the curriculum."
            actionLabel="+ Add Subject"
            onAction={openAddSubjectModal}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* ADD / EDIT SUBJECT MODAL */}
        {/* ------------------------------------------------------------------ */}
        <Modal
          isOpen={subjectModalOpen}
          onClose={() => setSubjectModalOpen(false)}
          title={editingSubj ? 'Edit Subject' : 'Add New Subject'}
        >
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={subjForm.name}
                onChange={(e) => setSubjForm({ ...subjForm, name: e.target.value })}
                placeholder="e.g. Database Management Systems"
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  formErrors.name ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                value={subjForm.code}
                onChange={(e) => setSubjForm({ ...subjForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CS501"
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  formErrors.code ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {formErrors.code && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.code}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department *
                </label>
                <select
                  value={subjForm.department_id}
                  onChange={(e) => setSubjForm({ ...subjForm, department_id: e.target.value })}
                  required
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    formErrors.department_id ? 'border-rose-400' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
                {formErrors.department_id && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.department_id}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester *
                </label>
                <select
                  value={subjForm.semester}
                  onChange={(e) => setSubjForm({ ...subjForm, semester: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={subjForm.description}
                onChange={(e) => setSubjForm({ ...subjForm, description: e.target.value })}
                placeholder="Database management concepts, SQL, normalization and transaction processing."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={subjForm.status === 'active'}
                    onChange={() => setSubjForm({ ...subjForm, status: 'active' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={subjForm.status === 'inactive'}
                    onChange={() => setSubjForm({ ...subjForm, status: 'inactive' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Inactive</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSubjectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Saving...' : editingSubj ? 'Update Subject' : 'Create Subject'}
              </button>
            </div>
          </form>
        </Modal>

        {/* ------------------------------------------------------------------ */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ------------------------------------------------------------------ */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Subject?"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Are you sure you want to delete "{subjectToDelete?.name}" ({subjectToDelete?.code})?
                </p>
                <p className="mt-1 text-rose-700 leading-relaxed">
                  This action may affect associated units and learning resources.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <p className="font-bold mb-1">Notice:</p>
                <p>{deleteError}</p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      if (subjectToDelete) handleToggleStatus(subjectToDelete);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Deactivate Subject Instead
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-60 cursor-pointer"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>

        {/* ------------------------------------------------------------------ */}
        {/* MANAGE UNITS MODAL */}
        {/* ------------------------------------------------------------------ */}
        <Modal
          isOpen={unitsModalOpen}
          onClose={() => setUnitsModalOpen(false)}
          title={`Manage Units — ${activeSubjectForUnits?.name || ''} (${activeSubjectForUnits?.code || ''})`}
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Existing Units List */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Syllabus Units ({unitsList.length})
              </h4>
              {unitsLoading ? (
                <LoadingSpinner text="Loading units..." />
              ) : unitsList.length > 0 ? (
                <div className="space-y-2">
                  {unitsList.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            Unit {u.unit_number}
                          </span>
                          <h5 className="font-bold text-slate-900 text-xs">{u.title}</h5>
                        </div>
                        {u.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {u.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUnitId(u.id);
                            setUnitForm({
                              unit_number: u.unit_number,
                              title: u.title,
                              description: u.description || '',
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 rounded cursor-pointer"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(u.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No units added yet for this subject. Use the form below to add Unit 1.
                </div>
              )}
            </div>

            {/* Add / Edit Unit Form */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <h5 className="text-xs font-bold text-indigo-900 mb-3">
                {editingUnitId ? 'Edit Unit' : '+ Add Unit'}
              </h5>
              <form onSubmit={handleUnitSubmit} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unit Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={unitForm.unit_number}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, unit_number: Number(e.target.value) })
                      }
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unit Title *
                    </label>
                    <input
                      type="text"
                      value={unitForm.title}
                      onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                      placeholder="e.g. Relational Model & SQL"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Unit Description (Optional)
                  </label>
                  <textarea
                    value={unitForm.description}
                    onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                    placeholder="Syllabus topics, subtopics, and key concepts..."
                    rows={2}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  {editingUnitId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUnitId(null);
                        setUnitForm({
                          unit_number: unitsList.length + 1,
                          title: '',
                          description: '',
                        });
                      }}
                      className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={unitSubmitting}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {unitSubmitting
                      ? 'Saving...'
                      : editingUnitId
                      ? 'Update Unit'
                      : 'Add Unit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default SubjectManagement;

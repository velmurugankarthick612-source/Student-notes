import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { BookOpen, Plus, Edit2, Trash2, Building } from 'lucide-react';
import { getSemesterLabel } from '../utils/formatters';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState(null);
  const [form, setForm] = useState({
    department_id: '',
    semester: 1,
    name: '',
    code: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
  }, [filterDept, filterSem]);

  const openAddModal = () => {
    setEditingSubj(null);
    setForm({
      department_id: departments[0]?.id || '',
      semester: 1,
      name: '',
      code: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (subj) => {
    setEditingSubj(subj);
    setForm({
      department_id: subj.department?.id || subj.department_id,
      semester: subj.semester,
      name: subj.name,
      code: subj.code || '',
      description: subj.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        department_id: form.department_id,
        semester: Number(form.semester),
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
      };

      if (editingSubj) {
        const res = await api.put(`/subjects/${editingSubj.id}`, payload);
        if (res.success) {
          toast.success('Subject updated');
          loadData();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/subjects', payload);
        if (res.success) {
          toast.success('Subject created');
          loadData();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject and its units?')) return;

    try {
      const res = await api.delete(`/subjects/${id}`);
      if (res.success) {
        toast.success('Subject deleted');
        setSubjects((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Subject Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure course syllabus, semester mappings, and course codes
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-6 flex flex-wrap items-center gap-4">
          <div className="w-48">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <select
              value={filterSem}
              onChange={(e) => setFilterSem(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading subjects list..." />
        ) : subjects.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Course Code</th>
                    <th className="px-6 py-4">Subject Name</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Units</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">{s.code || '—'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                      <td className="px-6 py-4 text-slate-600">{s.department?.name || '—'}</td>
                      <td className="px-6 py-4">{getSemesterLabel(s.semester)}</td>
                      <td className="px-6 py-4 text-slate-500">{s.units?.length || 0} Units</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete subject"
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
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No subjects registered"
            actionLabel="Add Subject"
            onAction={openAddModal}
          />
        )}

        {/* Modal for Add / Edit */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSubj ? 'Edit Subject' : 'Create New Subject'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department *
                </label>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Semester *
                </label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Operating Systems"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CS8493"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course scope, learning outcomes, or syllabus details..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-60"
              >
                {submitting ? 'Saving...' : editingSubj ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default SubjectManagement;

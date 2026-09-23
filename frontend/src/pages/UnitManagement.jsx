import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';

const UnitManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({
    subject_id: '',
    unit_number: 1,
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.success && res.data?.length > 0) {
          setSubjects(res.data);
          setSelectedSubject(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  const loadUnits = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const res = await api.get('/units', { params: { subject_id: selectedSubject } });
      if (res.success) {
        setUnits(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [selectedSubject]);

  const openAddModal = () => {
    setEditingUnit(null);
    setForm({
      subject_id: selectedSubject,
      unit_number: (units.length || 0) + 1,
      title: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (unit) => {
    setEditingUnit(unit);
    setForm({
      subject_id: unit.subject_id,
      unit_number: unit.unit_number,
      title: unit.title,
      description: unit.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        subject_id: form.subject_id,
        unit_number: Number(form.unit_number),
        title: form.title.trim(),
        description: form.description.trim(),
      };

      if (editingUnit) {
        const res = await api.put(`/units/${editingUnit.id}`, payload);
        if (res.success) {
          toast.success('Unit updated');
          loadUnits();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/units', payload);
        if (res.success) {
          toast.success('Unit created');
          loadUnits();
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
    if (!window.confirm('Delete this unit?')) return;

    try {
      const res = await api.delete(`/units/${id}`);
      if (res.success) {
        toast.success('Unit deleted');
        setUnits((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete unit');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Syllabus Breakdown</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Unit Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure course syllabus modules and individual unit topic descriptions
            </p>
          </div>

          <button
            onClick={openAddModal}
            disabled={!selectedSubject}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Unit</span>
          </button>
        </div>

        {/* Subject Filter Dropdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-6 max-w-md">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code ? `[${sub.code}] ` : ''}
                {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading syllabus units..." />
        ) : units.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Unit #</th>
                    <th className="px-6 py-4">Unit Title</th>
                    <th className="px-6 py-4">Syllabus Overview</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {units.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-700">Unit {u.unit_number}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{u.title}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-md">{u.description || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit unit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete unit"
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
            icon={Layers}
            title="No units configured for this subject"
            actionLabel="Add Unit 1"
            onAction={openAddModal}
          />
        )}

        {/* Modal for Add / Edit */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingUnit ? 'Edit Unit' : 'Create New Unit'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit Number *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.unit_number}
                onChange={(e) => setForm({ ...form, unit_number: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Relational Data Model & SQL Queries"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topics Covered (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Key concepts included in this syllabus unit..."
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
                {submitting ? 'Saving...' : editingUnit ? 'Save Changes' : 'Create Unit'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default UnitManagement;

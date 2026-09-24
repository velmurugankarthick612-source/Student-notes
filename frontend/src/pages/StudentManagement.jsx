import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  Phone,
  Hash,
  School,
  Calendar,
  X,
  AlertTriangle,
  Lock,
  User,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete' | 'status', student: Object, targetStatus?: string }

  // Form states
  const initialFormData = {
    full_name: '',
    register_number: '',
    email: '',
    password: '',
    college: '',
    department_id: '',
    semester: 1,
    phone: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const toast = useToast();

  // Load Departments for select dropdowns
  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.warn('Failed to load departments list:', err.message);
    }
  };

  // Load Students
  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students', {
        params: {
          search: searchTerm || undefined,
          department_id: departmentFilter === 'all' ? undefined : departmentFilter,
          semester: semesterFilter === 'all' ? undefined : semesterFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          limit: 15,
        },
      });

      if (res.success) {
        setStudents(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      toast.error('Failed to load student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents(1);
  }, [departmentFilter, semesterFilter, statusFilter]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchStudents(1);
  };

  // Validate Add Student Form
  const validateForm = (data, isEdit = false) => {
    const errors = {};
    if (!data.full_name || data.full_name.trim().length < 2) {
      errors.full_name = 'Full name must be at least 2 characters';
    }
    if (!data.register_number || data.register_number.trim().length < 3) {
      errors.register_number = 'Register number must be at least 3 characters';
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Valid email address is required';
    }
    if (!isEdit && (!data.password || data.password.length < 6)) {
      errors.password = 'Temporary password must be at least 6 characters';
    }
    if (!data.college || data.college.trim().length < 2) {
      errors.college = 'College name is required';
    }
    if (!data.department_id) {
      errors.department_id = 'Please select a department';
    }
    if (!data.semester || data.semester < 1 || data.semester > 8) {
      errors.semester = 'Semester must be between 1 and 8';
    }
    return errors;
  };

  // Submit Add Student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData, false);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/students', formData);
      if (res.success) {
        toast.success(`Student "${res.data.full_name}" created successfully!`);
        setShowAddModal(false);
        setFormData(initialFormData);
        setFormErrors({});
        fetchStudents(1);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create student account');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(editStudent, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/admin/students/${editStudent.id}`, editStudent);
      if (res.success) {
        toast.success('Student details updated successfully');
        setEditStudent(null);
        setFormErrors({});
        fetchStudents(pagination.page);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  // Execute Confirmed Action (Delete or Status Toggle)
  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, student, targetStatus } = confirmAction;

    setSubmitting(true);
    try {
      if (type === 'delete') {
        const res = await api.delete(`/admin/students/${student.id}`);
        if (res.success) {
          toast.success(`Student "${student.full_name}" deleted.`);
          fetchStudents(pagination.page);
        }
      } else if (type === 'status') {
        const res = await api.patch(`/admin/students/${student.id}/status`, { status: targetStatus });
        if (res.success) {
          toast.success(`Student marked as ${targetStatus}.`);
          fetchStudents(pagination.page);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] transition-colors">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Enrollment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add new student profiles, manage enrollment details, and control platform access
            </p>
          </div>

          <button
            id="add-student-btn"
            onClick={() => {
              setFormData({
                ...initialFormData,
                department_id: departments[0]?.id || '',
              });
              setFormErrors({});
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Filters bar: [Search Student] [Department Filter] [Semester Filter] [Status Filter] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="lg:col-span-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, reg no, email..."
            />
          </div>

          <div>
            <select
              id="department-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="semester-filter"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <LoadingSpinner text="Retrieving student enrollment records..." />
        ) : students.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Register No</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Semester</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                            {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {student.full_name}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {student.college || 'College not set'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {student.register_number || 'N/A'}
                      </td>

                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {student.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {student.department?.code || 'N/A'}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-[150px]">
                          {student.department?.name}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        Semester {student.semester || 1}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            student.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              student.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="capitalize">{student.status || 'active'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Button */}
                          <button
                            title="View student profile"
                            onClick={() => setViewStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            title="Edit student details"
                            onClick={() => {
                              setEditStudent({
                                ...student,
                                department_id: student.department_id || departments[0]?.id || '',
                              });
                              setFormErrors({});
                            }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            title={student.status === 'active' ? 'Deactivate student access' : 'Activate student access'}
                            onClick={() =>
                              setConfirmAction({
                                type: 'status',
                                student,
                                targetStatus: student.status === 'active' ? 'inactive' : 'active',
                              })
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              student.status === 'active'
                                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {student.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            title="Permanently delete student"
                            onClick={() => setConfirmAction({ type: 'delete', student })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination pagination={pagination} onPageChange={fetchStudents} />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description="Try adjusting your search criteria, department, semester filters, or add a student."
          />
        )}

        {/* Modal: ADD STUDENT */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Student</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Creates Supabase authentication credentials and profile
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {formErrors.full_name && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.full_name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Register Number *
                    </label>
                    <input
                      type="text"
                      value={formData.register_number}
                      onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                      placeholder="e.g. 211420104050"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {formErrors.register_number && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.register_number}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@college.edu"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {formErrors.email && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Temporary Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {formErrors.password && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.password}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College / University Name *
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. College of Engineering, Guindy"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {formErrors.college && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.college}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.department_id && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.department_id}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Semester (1 - 8) *
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="active">Active (Can log in immediately)</option>
                      <option value="inactive">Inactive (Access disabled)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{submitting ? 'Creating Student...' : 'Create Student'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: EDIT STUDENT */}
        {editStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Student Details</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update student profile details and status
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editStudent.full_name || ''}
                      onChange={(e) => setEditStudent({ ...editStudent, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {formErrors.full_name && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.full_name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Register Number *
                    </label>
                    <input
                      type="text"
                      value={editStudent.register_number || ''}
                      onChange={(e) => setEditStudent({ ...editStudent, register_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {formErrors.register_number && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.register_number}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editStudent.email || ''}
                      onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {formErrors.email && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editStudent.phone || ''}
                      onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College *
                  </label>
                  <input
                    type="text"
                    value={editStudent.college || ''}
                    onChange={(e) => setEditStudent({ ...editStudent, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {formErrors.college && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.college}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={editStudent.department_id || ''}
                      onChange={(e) => setEditStudent({ ...editStudent, department_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Semester (1 - 8) *
                    </label>
                    <select
                      value={editStudent.semester || 1}
                      onChange={(e) => setEditStudent({ ...editStudent, semester: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStudent.status || 'active'}
                    onChange={(e) => setEditStudent({ ...editStudent, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditStudent(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: VIEW STUDENT DETAILS */}
        {viewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                    {viewStudent.full_name ? viewStudent.full_name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {viewStudent.full_name}
                    </h3>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        viewStudent.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <span className="capitalize">{viewStudent.status || 'active'}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    Register Number:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {viewStudent.register_number || 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    Email:
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium">
                    {viewStudent.email}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <School className="w-3.5 h-3.5 text-indigo-500" />
                    College:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium text-right max-w-[220px]">
                    {viewStudent.college || 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    Department:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium text-right max-w-[220px]">
                    {viewStudent.department?.name || 'N/A'} ({viewStudent.department?.code || 'N/A'})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Semester:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    Semester {viewStudent.semester || 1}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    Phone:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {viewStudent.phone || 'Not provided'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Enrolled Date:
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {formatDate(viewStudent.created_at)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewStudent(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: CONFIRMATION DIALOG (Deactivate/Reactivate & Delete) */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
              <div
                className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                  confirmAction.type === 'delete'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : confirmAction.targetStatus === 'inactive'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {confirmAction.type === 'delete' ? (
                  <Trash2 className="w-7 h-7" />
                ) : confirmAction.targetStatus === 'inactive' ? (
                  <XCircle className="w-7 h-7" />
                ) : (
                  <CheckCircle2 className="w-7 h-7" />
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {confirmAction.type === 'delete'
                  ? 'Delete Student Account?'
                  : confirmAction.targetStatus === 'inactive'
                  ? 'Deactivate Student Access?'
                  : 'Reactivate Student Access?'}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {confirmAction.type === 'delete'
                  ? `Are you sure you want to permanently delete student "${confirmAction.student.full_name}" (${confirmAction.student.register_number})? This action cannot be undone.`
                  : confirmAction.targetStatus === 'inactive'
                  ? `Deactivating "${confirmAction.student.full_name}" will immediately prevent this student from signing in and accessing course materials.`
                  : `Reactivating "${confirmAction.student.full_name}" will restore their sign-in access.`}
              </p>

              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeConfirmAction}
                  disabled={submitting}
                  className={`px-5 py-2.5 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer ${
                    confirmAction.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                      : confirmAction.targetStatus === 'inactive'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  }`}
                >
                  <span>
                    {submitting
                      ? 'Processing...'
                      : confirmAction.type === 'delete'
                      ? 'Yes, Delete Student'
                      : confirmAction.targetStatus === 'inactive'
                      ? 'Yes, Deactivate'
                      : 'Yes, Reactivate'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentManagement;

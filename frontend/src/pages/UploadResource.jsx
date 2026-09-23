import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Building,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

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

const UploadResource = () => {
  const [searchParams] = useSearchParams();
  const preselectedSubject = searchParams.get('subject') || '';

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Form selections
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(user?.department_id || '');
  const [selectedSem, setSelectedSem] = useState(user?.semester || 1);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(preselectedSubject);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');

  // Resource details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('PDF Notes');
  const [externalUrl, setExternalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.success) {
          setDepartments(res.data || []);
          if (!selectedDept && res.data.length > 0) {
            setSelectedDept(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  // Load subjects for selected department & semester
  useEffect(() => {
    if (!selectedDept) return;

    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects', {
          params: { department_id: selectedDept, semester: selectedSem },
        });
        if (res.success) {
          setSubjects(res.data || []);
          if (preselectedSubject) {
            setSelectedSubject(preselectedSubject);
          } else if (res.data.length > 0) {
            setSelectedSubject(res.data[0].id);
          } else {
            setSelectedSubject('');
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, [selectedDept, selectedSem]);

  // Load units for selected subject
  useEffect(() => {
    if (!selectedSubject) {
      setUnits([]);
      setSelectedUnit('');
      return;
    }

    const fetchUnits = async () => {
      try {
        const res = await api.get('/units', { params: { subject_id: selectedSubject } });
        if (res.success) {
          setUnits(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load units:', err);
      }
    };
    fetchUnits();
  }, [selectedSubject]);

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Only genuine PDF documents (.pdf) are permitted.');
      e.target.value = null;
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 20MB limit.');
      e.target.value = null;
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto-populate title cleanly from filename without .pdf
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSubject) {
      setErrorMsg('Please select a valid subject.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a title for the resource.');
      return;
    }

    if (!selectedFile && !externalUrl.trim()) {
      setErrorMsg('Please attach a PDF file or provide a valid resource URL.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject_id', selectedSubject);
      if (selectedUnit) formData.append('unit_id', selectedUnit);
      formData.append('resource_type', resourceType);
      if (externalUrl.trim()) formData.append('external_url', externalUrl.trim());
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        toast.success('Resource submitted! A moderator will review it shortly.');
        navigate('/my-uploads');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload Learning Resource
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Contribute study notes, question banks, or revision materials to help your fellow students
          </p>
        </div>

        {/* Moderation Guidance Alert */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 mb-8 flex items-start space-x-3 text-xs text-indigo-900">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold">Academic Review Workflow:</span> All student uploads are initially set to{' '}
            <span className="font-semibold underline">Pending Review</span> status. Once a moderator verifies the content
            meets syllabus quality standards, it will become publicly discoverable in search results.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Step 1: Department & Semester */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
              <span>Select Department & Semester</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Semester
                </label>
                <select
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Subject & Unit */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>
              <span>Course Subject & Syllabus Unit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject *
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Choose Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `[${sub.code}] ` : ''}
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Syllabus Unit (Optional)
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">General / Covers Entire Subject</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unit_number}: {u.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Resource Information */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">3</span>
              <span>Resource Metadata</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resource Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 2 Database Normalization Solved Numerical Problems"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resource Category / Type *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Topics Covered (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain key concepts included, professor notes, or tips for university examinations..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Step 4: File Upload or External Link */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">4</span>
              <span>Upload Document</span>
            </h3>

            {/* Drag & drop style file input */}
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-600 hover:underline">
                    Click to browse PDF file
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">PDF format up to 20MB</p>
                </div>
              </label>

              {selectedFile && (
                <div className="mt-4 p-3 rounded-xl bg-white border border-indigo-200 flex items-center justify-between text-xs max-w-md mx-auto">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-2">
                    {formatBytes(selectedFile.size)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Or External Reference URL (e.g. YouTube lecture or official document link)
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-2 disabled:opacity-60"
            >
              <span>{submitting ? 'Uploading & Validating...' : 'Submit Resource for Moderation'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UploadResource;

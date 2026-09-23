import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { BookOpen, Layers, ArrowRight, Building, GraduationCap } from 'lucide-react';
import { getSemesterLabel } from '../utils/formatters';

const Subjects = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.success && res.data?.length > 0) {
          setDepartments(res.data);
          setSelectedDept(res.data[0].id);
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
      setLoading(true);
      try {
        const res = await api.get('/subjects', {
          params: { department_id: selectedDept, semester: selectedSem },
        });
        if (res.success) {
          setSubjects(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedDept, selectedSem]);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curriculum & Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse structured courses, units, and learning materials by department and semester
          </p>
        </div>

        {/* Department Selection Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDept === d.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {d.code} — {d.name}
            </button>
          ))}
        </div>

        {/* Semester Selector Buttons */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 mb-8 flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSem(s)}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                selectedSem === s
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <LoadingSpinner text="Loading curriculum subjects..." />
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-indigo-300 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {sub.code || 'COURSE'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {getSemesterLabel(sub.semester)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">{sub.name}</h3>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {sub.description || 'Full course curriculum with units, lecture handouts, and question banks.'}
                  </p>

                  {/* Units count */}
                  {sub.units && sub.units.length > 0 && (
                    <div className="text-xs text-slate-600 space-y-1 mb-4 pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-700 block">Syllabus Units:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sub.units.map((u) => (
                          <span
                            key={u.id}
                            className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600"
                          >
                            Unit {u.unit_number}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/resources?subject=${sub.id}`}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    View Notes
                  </Link>

                  <Link
                    to={`/subjects/${sub.id}`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                  >
                    <span>Subject Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No subjects registered for this semester"
            description="Our academic syllabus is updated periodically. Select another semester or contact a moderator."
          />
        )}
      </main>
    </div>
  );
};

export default Subjects;

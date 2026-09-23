import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ResourceCard from '../components/ResourceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { BookOpen, Layers, Upload, ArrowLeft, Building, Calendar, FileText } from 'lucide-react';
import { getSemesterLabel } from '../utils/formatters';

const SubjectDetails = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchSubjectData = async () => {
      setLoading(true);
      try {
        const [subjRes, resRes] = await Promise.all([
          api.get(`/subjects/${id}`),
          api.get('/resources/search', { params: { subject: id, limit: 20 } }),
        ]);

        if (subjRes.success) {
          setSubject(subjRes.data);
        }
        if (resRes.success) {
          setResources(resRes.data || []);
        }
      } catch (err) {
        toast.error('Failed to load subject details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [id]);

  const handleToggleBookmark = async (resourceId, currentlyBookmarked) => {
    try {
      if (currentlyBookmarked) {
        await api.delete(`/bookmarks/${resourceId}`);
        toast.info('Removed from bookmarks');
      } else {
        await api.post('/bookmarks', { resourceId });
        toast.success('Saved to bookmarks');
      }

      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, is_bookmarked: !currentlyBookmarked } : r))
      );
    } catch (err) {
      toast.error(err.message || 'Bookmark action failed');
    }
  };

  const filteredResources =
    selectedUnit === 'all'
      ? resources
      : resources.filter((r) => r.unit?.id === selectedUnit);

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner text="Loading subject and units..." size="lg" />
        </main>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8">
          <EmptyState title="Subject not found" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <Link
          to="/subjects"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subjects</span>
        </Link>

        {/* Subject Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-lg text-sm font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {subject.code || 'COURSE'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {getSemesterLabel(subject.semester)}
              </span>
              {subject.department && (
                <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{subject.department.name}</span>
                </span>
              )}
            </div>

            <Link
              to={`/upload?subject=${subject.id}`}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Contribute Notes for this Subject</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            {subject.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {subject.description || 'Comprehensive university curriculum syllabus and unit notes repository.'}
          </p>
        </div>

        {/* Units Breakdown */}
        {subject.units && subject.units.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Syllabus Units</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subject.units.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(selectedUnit === unit.id ? 'all' : unit.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedUnit === unit.id
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-indigo-600">
                      Unit {unit.unit_number}
                    </span>
                    {selectedUnit === unit.id && (
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Filtered</span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5">{unit.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {unit.description || 'Click to view resources categorized under this unit.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources for this Subject */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Verified Notes & Resources</span>
              </h2>
              <p className="text-xs text-slate-500">
                {filteredResources.length} resources available for this subject
              </p>
            </div>

            {/* Quick unit tab selector */}
            {subject.units && subject.units.length > 0 && (
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedUnit('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedUnit === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Units
                </button>
                {subject.units.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnit(u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedUnit === u.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Unit {u.unit_number}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No resources found for this selection"
              description="Be the first to upload lecture handouts or study notes for this unit!"
              actionLabel="Upload Material"
              onAction={() => null}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SubjectDetails;

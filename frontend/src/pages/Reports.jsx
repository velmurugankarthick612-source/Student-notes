import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  Flag,
  CheckCircle,
  XCircle,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter },
      });
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}`, { status: newStatus });
      if (res.success) {
        toast.success(`Report marked as ${newStatus}`);
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update report status');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this resource permanently from the platform?')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/resources/${resourceId}`);
      if (res.success) {
        toast.success('Resource deleted from system');
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Dismissed
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Under Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Action
          </span>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-2">
            <Flag className="w-3.5 h-3.5" />
            <span>Content Integrity Triage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reported Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Investigate student reports regarding copyright issues, incorrect syllabus files, or broken attachments
          </p>
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center space-x-2 pb-4 overflow-x-auto mb-6">
          {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'All Reports' : status}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching reports list..." />
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {rep.reason}
                    </span>
                    {getStatusBadge(rep.status)}
                    <span className="text-xs text-slate-400">
                      Reported {formatDate(rep.created_at)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    Target Resource:{' '}
                    {rep.resource ? (
                      <Link
                        to={`/resources/${rep.resource.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {rep.resource.title}
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic">Deleted Resource</span>
                    )}
                  </h3>

                  {rep.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      "{rep.description}"
                    </p>
                  )}

                  <div className="text-xs text-slate-400">
                    Reported by: <span className="text-slate-700 font-medium">{rep.reporter?.full_name}</span> ({rep.reporter?.email})
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                      className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    >
                      Resolve
                    </button>
                  )}

                  {rep.status !== 'dismissed' && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                    >
                      Dismiss
                    </button>
                  )}

                  {rep.resource && (
                    <button
                      onClick={() => handleDeleteResource(rep.resource.id)}
                      className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Permanently Delete Reported Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="No reports match this status"
            description="The integrity queue is clear for this category."
          />
        )}
      </main>
    </div>
  );
};

export default Reports;

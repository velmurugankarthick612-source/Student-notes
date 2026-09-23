import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatDate, getResourceTypeColor } from '../utils/formatters';

const MyUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources/my-uploads');
      if (res.success) {
        setUploads(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const res = await api.delete(`/resources/${id}`);
      if (res.success) {
        toast.success('Resource deleted');
        setUploads((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Uploaded Resources
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track the moderation status, downloads, and feedback on your contributed materials
            </p>
          </div>

          <Link
            to="/upload"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Material</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching your uploaded resources..." />
        ) : uploads.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Resource Title</th>
                    <th className="px-6 py-4">Subject & Unit</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Engagement</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {uploads.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs">
                        <Link
                          to={`/resources/${res.id}`}
                          className="hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {res.title}
                        </Link>
                        {res.status === 'rejected' && res.rejection_reason && (
                          <div className="mt-1 text-[11px] text-rose-600 font-normal flex items-start space-x-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Reason: {res.rejection_reason}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {res.subject?.code ? `[${res.subject.code}] ` : ''}
                          {res.subject?.name}
                        </div>
                        {res.unit && (
                          <div className="text-[11px] text-slate-400">
                            Unit {res.unit.unit_number}: {res.unit.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getResourceTypeColor(
                            res.resource_type
                          )}`}
                        >
                          {res.resource_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 text-slate-500">
                          <span className="flex items-center space-x-1" title="Views">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{res.views || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1" title="Downloads">
                            <Download className="w-3.5 h-3.5" />
                            <span>{res.downloads || 0}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(res.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/resources/${res.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {res.status === 'pending' && (
                            <button
                              onClick={() => handleDelete(res.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete pending upload"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
            title="You haven't uploaded any resources yet"
            description="Help classmates learn by sharing solved questions, handwritten unit notes, or cheat sheets."
            actionLabel="Upload First Material"
            onAction={() => null}
          />
        )}
      </main>
    </div>
  );
};

export default MyUploads;

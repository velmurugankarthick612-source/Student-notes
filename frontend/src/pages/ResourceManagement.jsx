import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Clock,
  Eye,
  Download,
} from 'lucide-react';
import { formatDate, getResourceTypeColor } from '../utils/formatters';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const toast = useToast();

  const loadResources = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/resources/search', {
        params: {
          q: searchQuery || undefined,
          status: statusFilter,
          page,
          limit: 15,
        },
      });

      if (res.success) {
        setResources(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources(1);
  }, [statusFilter]);

  const handleSearch = (q) => {
    setSearchQuery(q);
    loadResources(1);
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/admin/resources/${id}/approve`);
      if (res.success) {
        toast.success('Resource marked as approved');
        loadResources(pagination.page);
      }
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;

    try {
      const res = await api.patch(`/admin/resources/${id}/reject`, { reason });
      if (res.success) {
        toast.info('Resource marked as rejected');
        loadResources(pagination.page);
      }
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource permanently?')) return;

    try {
      const res = await api.delete(`/admin/resources/${id}`);
      if (res.success) {
        toast.success('Resource permanently deleted');
        setResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resource Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, review, filter, and purge academic documents across all departments
          </p>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search title, description, or keyword..."
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">All Statuses (Approved, Pending, Rejected)</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading resource database..." />
        ) : resources.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Downloads</th>
                    <th className="px-6 py-4">Uploaded</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                        <Link to={`/resources/${res.id}`} className="hover:text-indigo-600">
                          {res.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800 block">
                          {res.subject?.code ? `[${res.subject.code}] ` : ''}
                          {res.subject?.name}
                        </span>
                        {res.unit && (
                          <span className="text-[11px] text-slate-400">Unit {res.unit.unit_number}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getResourceTypeColor(res.resource_type)}`}>
                          {res.resource_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{res.downloads || 0}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(res.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/resources/${res.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                            title="View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {res.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(res.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {res.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(res.id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(res.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Delete"
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

            <div className="p-4 border-t border-slate-100">
              <Pagination pagination={pagination} onPageChange={loadResources} />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No resources found"
            description="Try changing status filters or search query."
          />
        )}
      </main>
    </div>
  );
};

export default ResourceManagement;

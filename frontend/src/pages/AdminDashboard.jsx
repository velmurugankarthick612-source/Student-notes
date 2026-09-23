import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Users,
  FileCheck,
  Clock,
  Download,
  Flag,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
  Building,
} from 'lucide-react';
import { formatDate, formatBytes } from '../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/statistics');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load administrative statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/admin/resources/${id}/approve`);
      if (res.success) {
        toast.success('Resource approved and published!');
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve resource');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    try {
      const res = await api.patch(`/admin/resources/${id}/reject`, { reason });
      if (res.success) {
        toast.info('Resource rejected');
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject resource');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner text="Compiling administrative analytics..." size="lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Moderation & Administration Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Monitor academic resource uploads, verification queues, reported content, and users
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/admin/pending"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Review Pending Queue ({stats?.pendingResources || 0})</span>
            </Link>
          </div>
        </div>

        {/* 6 Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Resources</span>
              <FileCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalResources || 0}</div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-amber-600">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-700">{stats?.pendingResources || 0}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats?.approvedResources || 0}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Downloads</span>
              <Download className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalDownloads || 0}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Reports</span>
              <Flag className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">{stats?.totalReports || 0}</div>
          </div>
        </div>

        {/* Dual Section: Pending Approvals & Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Approvals */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-800 text-sm">Pending Verification Queue</h3>
                </div>
                <Link
                  to="/admin/pending"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats?.pendingApprovals && stats.pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  {stats.pendingApprovals.map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="max-w-[65%] truncate">
                        <Link
                          to={`/resources/${res.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {res.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          By {res.uploader?.full_name || 'Student'} • {res.subject?.name}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleApprove(res.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(res.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">
                  No materials waiting for approval. Queue is clear!
                </p>
              )}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-slate-800 text-sm">Flagged Reports</h3>
                </div>
                <Link
                  to="/admin/reports"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                >
                  <span>Manage reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats?.recentReports && stats.recentReports.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="max-w-[70%] truncate">
                        <span className="font-bold text-rose-600 block">{rep.reason}</span>
                        <p className="text-slate-700 font-medium truncate mt-0.5">
                          {rep.resource?.title || 'Resource'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Reported by {rep.reporter?.full_name || 'User'}
                        </p>
                      </div>

                      <Link
                        to="/admin/reports"
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-50"
                      >
                        Triage
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">
                  No active reports from students. Everything is clean!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Most Downloaded Notes Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Top Performing Academic Notes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Downloads</th>
                  <th className="px-4 py-3">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.topDownloaded?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <Link to={`/resources/${item.id}`} className="hover:text-indigo-600">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.subject?.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.resource_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{item.downloads}</td>
                    <td className="px-4 py-3 text-slate-500">{item.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

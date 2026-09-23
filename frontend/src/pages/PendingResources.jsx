import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  AlertCircle,
  User,
  Building,
  Calendar,
} from 'lucide-react';
import { formatDate, formatBytes, getResourceTypeColor } from '../utils/formatters';

const PendingResources = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const toast = useToast();

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources/pending');
      if (res.success) {
        setPendingList(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load pending resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      setSubmittingAction(true);
      const res = await api.patch(`/admin/resources/${id}/approve`);
      if (res.success) {
        toast.success('Resource approved and made publicly visible!');
        setPendingList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve resource');
    } finally {
      setSubmittingAction(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedResId(id);
    setRejectReason('Does not meet syllabus guidelines or duplicate content.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedResId) return;

    try {
      setSubmittingAction(true);
      const res = await api.patch(`/admin/resources/${selectedResId}/reject`, {
        reason: rejectReason,
      });

      if (res.success) {
        toast.info('Resource rejected');
        setPendingList((prev) => prev.filter((r) => r.id !== selectedResId));
        setRejectModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject resource');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Moderation Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pending Resource Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review uploaded materials for academic accuracy before publishing them to students
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching pending materials..." />
        ) : pendingList.length > 0 ? (
          <div className="space-y-4">
            {pendingList.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getResourceTypeColor(
                        res.resource_type
                      )}`}
                    >
                      {res.resource_type}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {formatDate(res.created_at)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    <Link to={`/resources/${res.id}`} className="hover:text-indigo-600 transition-colors">
                      {res.title}
                    </Link>
                  </h3>

                  {res.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                    {res.subject && (
                      <span className="flex items-center space-x-1 font-medium text-slate-700">
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {res.subject.code ? `[${res.subject.code}] ` : ''}
                          {res.subject.name}
                        </span>
                      </span>
                    )}

                    {res.unit && (
                      <span>Unit {res.unit.unit_number}: {res.unit.title}</span>
                    )}

                    {res.uploader && (
                      <span className="flex items-center space-x-1 text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span>Uploaded by {res.uploader.full_name} ({res.uploader.email})</span>
                      </span>
                    )}

                    {res.file_size && (
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {formatBytes(res.file_size)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex items-center space-x-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <Link
                    to={`/resources/${res.id}`}
                    target="_blank"
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Inspect resource"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => openRejectModal(res.id)}
                    disabled={submittingAction}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(res.id)}
                    disabled={submittingAction}
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="Moderation queue is empty"
            description="All student submitted resources have been vetted and published."
          />
        )}

        {/* Rejection Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Resource Submission"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <p className="text-xs text-slate-500">
              Provide feedback to the student explaining why this document cannot be published in the academic repository.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Does not match syllabus topics, blurry scan, or duplicate submission..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-60"
              >
                {submittingAction ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default PendingResources;

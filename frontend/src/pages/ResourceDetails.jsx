import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Download,
  Eye,
  Bookmark,
  Star,
  Flag,
  Calendar,
  Building,
  ArrowLeft,
  User,
  ExternalLink,
  ShieldAlert,
  Send,
  CheckCircle,
} from 'lucide-react';
import {
  formatDate,
  formatBytes,
  getResourceTypeColor,
  getSemesterLabel,
} from '../utils/formatters';

const REPORT_REASONS = [
  'Incorrect content',
  'Wrong subject',
  'Copyright concern',
  'Inappropriate content',
  'Broken file',
  'Other',
];

const ResourceDetails = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals & User actions
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Ratings
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // PDF Preview modal or inline toggle
  const [showPreview, setShowPreview] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadResource = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/resources/${id}`);
      if (res.success && res.data) {
        setResource(res.data);
        if (res.data.user_rating) {
          setRatingVal(res.data.user_rating);
        }
      }
      // Record view asynchronously
      api.post(`/resources/${id}/view`).catch(() => {});
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load resource details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResource();
  }, [id]);

  const handleDownload = async () => {
    if (!resource?.file_url) {
      toast.error('File link not available');
      return;
    }

    try {
      // Record download count
      api.post(`/resources/${id}/download`).catch(() => {});
      setResource((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));

      // Trigger download
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.target = '_blank';
      link.download = resource.file_name || 'studyhub_notes.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (err) {
      toast.error('Error starting download');
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.warning('Please log in to save bookmarks');
      navigate('/login');
      return;
    }

    try {
      if (resource.is_bookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setResource((prev) => ({ ...prev, is_bookmarked: false }));
        toast.info('Removed from bookmarks');
      } else {
        await api.post('/bookmarks', { resourceId: id });
        setResource((prev) => ({ ...prev, is_bookmarked: true }));
        toast.success('Saved to bookmarks!');
      }
    } catch (err) {
      toast.error(err.message || 'Bookmark update failed');
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to leave a rating');
      navigate('/login');
      return;
    }

    try {
      setSubmittingRating(true);
      const res = await api.post(`/resources/${id}/ratings`, {
        rating: Number(ratingVal),
        review: reviewText,
      });

      if (res.success) {
        toast.success('Rating & review submitted successfully!');
        setReviewText('');
        loadResource(); // Reload to refresh rating counts & reviews list
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to submit a report');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReport(true);
      const res = await api.post(`/resources/${id}/reports`, {
        reason: reportReason,
        description: reportDesc,
      });

      if (res.success) {
        toast.success('Report submitted to moderation team');
        setReportModalOpen(false);
        setReportDesc('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner text="Loading resource details..." size="lg" />
        </main>
      </div>
    );
  }

  if (errorMsg || !resource) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Resource Unavailable</h3>
            <p className="text-xs text-slate-500 mb-6">{errorMsg || 'Resource not found'}</p>
            <Link
              to="/resources"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Back to Resource Finder
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <Link
          to="/resources"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources</span>
        </Link>

        {/* Resource Header & Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8">
          {/* Top Badges & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${getResourceTypeColor(
                  resource.resource_type
                )}`}
              >
                {resource.resource_type}
              </span>

              {resource.status !== 'approved' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  {resource.status}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  resource.is_bookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${resource.is_bookmarked ? 'fill-amber-500' : ''}`} />
                <span>{resource.is_bookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                title="Report issue"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            {resource.title}
          </h1>

          {resource.description && (
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
              {resource.description}
            </p>
          )}

          {/* Academic Hierarchy Breadcrumbs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs mb-8">
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="font-semibold text-slate-800">
                {resource.subject?.department?.name || 'Academic Course'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Semester</span>
              <span className="font-semibold text-slate-800">
                {getSemesterLabel(resource.subject?.semester)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Subject</span>
              <span className="font-semibold text-slate-800">
                {resource.subject?.code ? `[${resource.subject.code}] ` : ''}
                {resource.subject?.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Syllabus Unit</span>
              <span className="font-semibold text-slate-800">
                {resource.unit
                  ? `Unit ${resource.unit.unit_number}: ${resource.unit.title}`
                  : 'All Units'}
              </span>
            </div>
          </div>

          {/* Metadata & Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
            {/* Uploader & Date */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {resource.uploader?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">
                  {resource.uploader?.full_name || 'Academic Peer'}
                </p>
                <p className="text-slate-400">
                  Uploaded on {formatDate(resource.created_at)}
                  {resource.file_size ? ` • ${formatBytes(resource.file_size)}` : ''}
                </p>
              </div>
            </div>

            {/* Metrics & Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-4 text-xs text-slate-500 mr-2">
                <span className="flex items-center space-x-1" title="Views">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{resource.views || 0}</span>
                </span>
                <span className="flex items-center space-x-1" title="Downloads">
                  <Download className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{resource.downloads || 0}</span>
                </span>
                <span className="flex items-center space-x-1" title="Rating">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{resource.average_rating || 'New'}</span>
                </span>
              </div>

              {resource.file_url ? (
                <>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? 'Hide Preview' : 'View PDF'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Notes</span>
                  </button>
                </>
              ) : resource.external_url ? (
                <a
                  href={resource.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Resource Link</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* PDF Viewer Section */}
        {showPreview && resource.file_url && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>PDF Document Preview</span>
              </h3>
              <a
                href={resource.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>Open in full screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full h-[700px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <iframe
                src={`${resource.file_url}#toolbar=1`}
                title={resource.title}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}

        {/* Ratings & Peer Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Reviews & Ratings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Peer feedback helps maintain high academic notes quality
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(resource.average_rating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-extrabold text-slate-800 text-lg">
                {resource.average_rating > 0 ? resource.average_rating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-slate-400">
                ({resource.ratings_count || 0} reviews)
              </span>
            </div>
          </div>

          {/* Rating Submission Form */}
          <form
            onSubmit={handleRatingSubmit}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 mb-8"
          >
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              {resource.user_rating ? 'Update Your Rating' : 'Leave a Rating & Review'}
            </h4>

            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-semibold text-slate-600">Your score:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRatingVal(s)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${s <= ratingVal ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 ml-1">{ratingVal} Star{ratingVal > 1 ? 's' : ''}</span>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a brief comment about whether this helped with exam preparation or syllabus clarity..."
              rows={3}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-3"
            />

            <button
              type="submit"
              disabled={submittingRating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingRating ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-4">
            {resource.ratings && resource.ratings.length > 0 ? (
              resource.ratings.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {rev.user?.full_name?.charAt(0) || 'S'}
                      </div>
                      <span className="font-semibold text-slate-800 text-xs">
                        {rev.user?.full_name || 'Anonymous Student'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] text-slate-400 ml-2">
                        {formatDate(rev.created_at)}
                      </span>
                    </div>
                  </div>

                  {rev.review && (
                    <p className="text-xs text-slate-600 leading-relaxed pl-9">
                      {rev.review}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No peer reviews posted yet. Be the first to share your thoughts on this study material!
              </p>
            )}
          </div>
        </div>

        {/* Report Modal */}
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title="Report Inappropriate or Incorrect Resource"
        >
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Report
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Explain why this content should be reviewed or removed..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-60"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ResourceDetails;

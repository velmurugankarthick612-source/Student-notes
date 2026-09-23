import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';
import { ResourceCardSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  BookOpen,
  Bookmark,
  Upload,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  ThumbsUp,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { getSemesterLabel } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    subjectsCount: 0,
    resourcesCount: 0,
    bookmarksCount: 0,
    uploadsCount: 0,
  });

  const [popularResources, setPopularResources] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [popRes, recRes, recoRes, statsRes] = await Promise.allSettled([
        api.get('/resources/search', { params: { sort: 'downloads', limit: 4 } }),
        api.get('/resources/search', { params: { sort: 'newest', limit: 4 } }),
        api.get('/resources/search', {
          params: {
            department: user?.department_id || undefined,
            semester: user?.semester || undefined,
            limit: 4,
          },
        }),
        api.get('/profile'),
      ]);

      if (popRes.status === 'fulfilled' && popRes.value.success) {
        setPopularResources(popRes.value.data || []);
      }
      if (recRes.status === 'fulfilled' && recRes.value.success) {
        setRecentResources(recRes.value.data || []);
      }
      if (recoRes.status === 'fulfilled' && recoRes.value.success) {
        setRecommendedResources(recoRes.value.data || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        const profileData = statsRes.value.data;
        setStats({
          uploadsCount: profileData.stats?.uploads || 0,
          bookmarksCount: profileData.stats?.bookmarks || 0,
          ratingsCount: profileData.stats?.ratings || 0,
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleToggleBookmark = async (resourceId, currentlyBookmarked) => {
    try {
      if (currentlyBookmarked) {
        await api.delete(`/bookmarks/${resourceId}`);
        toast.info('Removed from bookmarks');
      } else {
        await api.post('/bookmarks', { resourceId });
        toast.success('Saved to bookmarks');
      }

      // Update in all lists
      const updater = (list) =>
        list.map((r) => (r.id === resourceId ? { ...r, is_bookmarked: !currentlyBookmarked } : r));

      setPopularResources(updater);
      setRecentResources(updater);
      setRecommendedResources(updater);
    } catch (err) {
      toast.error(err.message || 'Bookmark action failed');
    }
  };

  const handleSearchSubmit = (q) => {
    if (q) {
      navigate(`/resources?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-700/10 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-sm mb-2">
                  Academic Workspace
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.full_name || 'Student'}!
                </h1>
                <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                  {user?.department?.name || 'Academic Studies'}{' '}
                  {user?.semester ? `• ${getSemesterLabel(user.semester)}` : ''}{' '}
                  {user?.college ? `• ${user.college}` : ''}
                </p>
              </div>

              <Link
                to="/upload"
                className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Notes</span>
              </Link>
            </div>

            {/* In-Dashboard Quick Search */}
            <div className="max-w-xl mt-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search notes, subjects, or topics..."
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchSubmit(searchQuery)}
                  className="mt-2 text-xs font-semibold text-white underline hover:text-indigo-200"
                >
                  Press Enter or Click to search all resources for "{searchQuery}"
                </button>
              )}
            </div>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 bottom-0 -mb-20 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none"></div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/subjects"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">Curriculum</div>
            <div className="text-xs text-slate-500 mt-0.5">Explore by Semester</div>
          </Link>

          <Link
            to="/resources"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">Resource Finder</div>
            <div className="text-xs text-slate-500 mt-0.5">Filter by Unit & Type</div>
          </Link>

          <Link
            to="/bookmarks"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">{stats.bookmarksCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Saved Bookmarks</div>
          </Link>

          <Link
            to="/my-uploads"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">{stats.uploadsCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">My Uploads Tracked</div>
          </Link>
        </div>

        {/* Recommended For You Section */}
        {user?.department_id && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Recommended For Your Semester</h2>
              </div>
              <Link
                to={`/resources?department=${user.department_id}&semester=${user.semester || 1}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <ResourceCardSkeleton key={i} />
                ))}
              </div>
            ) : recommendedResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommendedResources.map((res) => (
                  <ResourceCard key={res.id} resource={res} onToggleBookmark={handleToggleBookmark} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No resources for your semester yet"
                description="Be the first to upload lecture handouts or study notes for your branch!"
                actionLabel="Upload Material"
                onAction={() => navigate('/upload')}
              />
            )}
          </section>
        )}

        {/* Popular Resources Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Popular Downloads</h2>
            </div>
            <Link
              to="/resources?sort=downloads"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : popularResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularResources.map((res) => (
                <ResourceCard key={res.id} resource={res} onToggleBookmark={handleToggleBookmark} />
              ))}
            </div>
          ) : (
            <EmptyState title="No popular notes yet" />
          )}
        </section>

        {/* Recently Added Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900">Recently Added</h2>
            </div>
            <Link
              to="/resources?sort=newest"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : recentResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentResources.map((res) => (
                <ResourceCard key={res.id} resource={res} onToggleBookmark={handleToggleBookmark} />
              ))}
            </div>
          ) : (
            <EmptyState title="No recent notes found" />
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

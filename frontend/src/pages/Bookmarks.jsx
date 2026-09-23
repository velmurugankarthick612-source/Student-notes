import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ResourceCard from '../components/ResourceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { Bookmark, Search } from 'lucide-react';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks');
      if (res.success) {
        setBookmarks(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleToggleBookmark = async (resourceId, currentlyBookmarked) => {
    try {
      await api.delete(`/bookmarks/${resourceId}`);
      toast.info('Removed from saved bookmarks');
      setBookmarks((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove bookmark');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quick access to saved formula sheets, question banks, and notes for exam prep
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your bookmarked resources..." />
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((res) => (
              <ResourceCard
                key={res.id}
                resource={{ ...res, is_bookmarked: true }}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks saved yet"
            description="When browsing notes, click the bookmark icon on any card to save it for quick review."
            actionLabel="Discover Notes"
            onAction={() => null}
          />
        )}
      </main>
    </div>
  );
};

export default Bookmarks;

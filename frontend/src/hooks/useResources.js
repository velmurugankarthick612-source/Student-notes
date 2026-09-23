import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const useResources = (initialFilters = {}) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(initialFilters);
  const toast = useToast();

  const fetchResources = useCallback(
    async (currentFilters = filters, page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...currentFilters,
          page,
          limit: pagination.limit || 12,
        };

        // Remove empty strings or nulls
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const res = await api.get('/resources/search', { params });
        if (res.success) {
          setResources(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  useEffect(() => {
    fetchResources(filters, 1);
  }, [filters]);

  const toggleBookmark = async (resourceId, currentlyBookmarked) => {
    try {
      if (currentlyBookmarked) {
        await api.delete(`/bookmarks/${resourceId}`);
        toast.info('Removed from bookmarks');
      } else {
        await api.post('/bookmarks', { resourceId });
        toast.success('Saved to bookmarks!');
      }

      // Update in-place in resource list
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId ? { ...r, is_bookmarked: !currentlyBookmarked } : r
        )
      );
      return !currentlyBookmarked;
    } catch (err) {
      toast.error(err.message || 'Failed to update bookmark');
      return currentlyBookmarked;
    }
  };

  return {
    resources,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchResources,
    toggleBookmark,
  };
};

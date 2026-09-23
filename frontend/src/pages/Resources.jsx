import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ResourceCard from '../components/ResourceCard';
import Pagination from '../components/Pagination';
import { ResourceCardSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useResources } from '../hooks/useResources';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract initial filters from search parameters
  const initialFilters = {
    q: searchParams.get('q') || '',
    department: searchParams.get('department') || '',
    semester: searchParams.get('semester') || '',
    subject: searchParams.get('subject') || '',
    unit: searchParams.get('unit') || '',
    resourceType: searchParams.get('resourceType') || '',
    sort: searchParams.get('sort') || 'newest',
  };

  const {
    resources,
    loading,
    pagination,
    filters,
    setFilters,
    fetchResources,
    toggleBookmark,
  } = useResources(initialFilters);

  // Synchronize URL search params with state
  const updateFiltersAndUrl = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) {
        params.set(k, newFilters[k]);
      }
    });
    setSearchParams(params);
  };

  const handleSearchChange = (query) => {
    updateFiltersAndUrl({ ...filters, q: query });
  };

  const handleFilterChange = (updated) => {
    updateFiltersAndUrl(updated);
  };

  const handleResetFilters = () => {
    updateFiltersAndUrl({ sort: 'newest' });
  };

  const handlePageChange = (newPage) => {
    fetchResources(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Resource Finder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search and filter notes, previous year question banks, formulas, and syllabus handouts
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={filters.q || ''}
            onChange={handleSearchChange}
            placeholder="Search by topic, unit name, question bank, or keyword..."
          />
        </div>

        {/* Filter Panel */}
        <div className="mb-8">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Resources Grid / Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="No resources matched your criteria"
            description="Try changing your search terms, removing filters, or choosing another semester."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        )}
      </main>
    </div>
  );
};

export default Resources;

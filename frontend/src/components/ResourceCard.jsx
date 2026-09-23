import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  Star,
  Eye,
  Download,
  Calendar,
  Building,
} from 'lucide-react';
import {
  formatRelativeTime,
  getResourceTypeColor,
  formatBytes,
} from '../utils/formatters';

const ResourceCard = ({ resource, onToggleBookmark }) => {
  if (!resource) return null;

  const {
    id,
    title,
    description,
    resource_type,
    views = 0,
    downloads = 0,
    average_rating = 0,
    ratings_count = 0,
    file_size,
    created_at,
    subject,
    unit,
    uploader,
    is_bookmarked = false,
  } = resource;

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(id, is_bookmarked);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Card Header & Content */}
      <div className="p-5 flex-1">
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getResourceTypeColor(
              resource_type
            )}`}
          >
            {resource_type}
          </span>

          <button
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-lg border transition-colors ${
              is_bookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-500 hover:bg-amber-100'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={is_bookmarked ? 'Remove bookmark' : 'Save bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${is_bookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title Link */}
        <Link to={`/resources/${id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {title}
          </h3>
        </Link>

        {/* Description snippet */}
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Subject & Unit Metadata */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {subject && (
            <div className="flex items-center space-x-1.5 truncate font-medium text-slate-700 dark:text-slate-300">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">
                {subject.code ? `${subject.code} — ` : ''}
                {subject.name}
              </span>
            </div>
          )}

          {unit && (
            <div className="flex items-center space-x-1.5 truncate text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
              <span className="truncate font-normal">
                Unit {unit.unit_number}: {unit.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Statistics */}
      <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        {/* Rating */}
        <div className="flex items-center space-x-1">
          <Star className={`w-3.5 h-3.5 ${average_rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {average_rating > 0 ? average_rating.toFixed(1) : 'New'}
          </span>
          {ratings_count > 0 && (
            <span className="text-slate-400 text-[11px]">({ratings_count})</span>
          )}
        </div>

        {/* Views & Downloads */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 dark:text-slate-400">
          <span className="flex items-center space-x-1" title={`${views} views`}>
            <Eye className="w-3.5 h-3.5" />
            <span>{views}</span>
          </span>
          <span className="flex items-center space-x-1" title={`${downloads} downloads`}>
            <Download className="w-3.5 h-3.5" />
            <span>{downloads}</span>
          </span>
          {file_size ? (
            <span className="font-mono text-[10px] bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {formatBytes(file_size)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;

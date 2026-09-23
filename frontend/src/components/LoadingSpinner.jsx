import React from 'react';

export const LoadingSpinner = ({ text = 'Loading resources...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export const ResourceCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between animate-pulse">
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 w-24 bg-slate-200 rounded"></div>
        <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
      <div className="h-4 w-full bg-slate-100 rounded mb-4"></div>
      <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
    </div>
    <div className="pt-4 mt-6 border-t border-slate-100 flex justify-between">
      <div className="h-4 w-16 bg-slate-100 rounded"></div>
      <div className="h-4 w-20 bg-slate-100 rounded"></div>
    </div>
  </div>
);

export default LoadingSpinner;

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return formatDate(dateString);
};

export const getSemesterLabel = (sem) => {
  if (!sem) return '';
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  return `${ordinals[sem] || sem} Semester`;
};

export const getResourceTypeColor = (type) => {
  switch (type) {
    case 'PDF Notes':
    case 'Lecture Notes':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Question Bank':
    case 'Previous Year Questions':
    case '2-Mark Questions':
    case '8-Mark Questions':
    case '16-Mark Questions':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Cheat Sheet':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Lab Manual':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

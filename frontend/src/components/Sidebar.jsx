import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Bookmark,
  Upload,
  User,
  Shield,
  FileCheck,
  Users,
  Building2,
  FolderKanban,
  Flag,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isModerator, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resources', label: 'Resource Finder', icon: Search },
    { to: '/subjects', label: 'Curriculum Subjects', icon: BookOpen },
    { to: '/upload', label: 'Upload Resource', icon: Upload },
    { to: '/my-uploads', label: 'My Uploads', icon: FolderKanban },
    { to: '/bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview & Stats', icon: Shield },
    { to: '/admin/pending', label: 'Pending Approvals', icon: FileCheck },
    { to: '/admin/reports', label: 'Reported Content', icon: Flag },
    { to: '/admin/resources', label: 'All Resources', icon: BookOpen },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/subjects', label: 'Subjects Management', icon: FolderKanban },
    { to: '/admin/users', label: 'User Roles', icon: Users, adminOnly: true },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden lg:flex transition-colors">
      <div className="space-y-6">
        {/* User Mini Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.full_name || 'Student Account'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'student'}</p>
            </div>
          </div>
        </div>

        {/* Student Links */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Student Portal
          </p>
          <div className="space-y-1">
            {studentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Admin Links */}
        {(isAdmin || isModerator) && (
          <div>
            <p className="px-3 text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">
              Staff & Moderation
            </p>
            <div className="space-y-1">
              {adminLinks
                .filter((link) => !link.adminOnly || isAdmin)
                .map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink key={link.to} to={link.to} className={linkClass}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center">
        StudyHub Academic v1.0
      </div>
    </aside>
  );
};

export default Sidebar;

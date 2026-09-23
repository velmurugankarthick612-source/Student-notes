import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, UserCheck, Search, Building } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const { user: currentUser } = useAuth();
  const toast = useToast();

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: searchTerm || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
          page,
          limit: 15,
        },
      });

      if (res.success) {
        setUsers(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchUsers(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id && newRole !== 'admin') {
      toast.warning('You cannot remove the admin role from your own session.');
      return;
    }

    if (!window.confirm(`Update this user role to ${newRole}?`)) {
      return;
    }

    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        toast.success(`User role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Identity Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Roles & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student, moderator, and administrator access levels across the platform
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by student name, college, or email..."
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="moderator">Moderators</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner text="Loading user directory..." />
        ) : users.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Department & Sem</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {u.full_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {u.college || 'College not set'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800">
                          {u.department?.code || 'None'}
                        </span>
                        {u.semester && (
                          <span className="text-[11px] text-slate-400 block">Sem {u.semester}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(u.created_at)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role || 'student'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none transition-colors ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'moderator'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="student">Student</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100">
              <Pagination pagination={pagination} onPageChange={fetchUsers} />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try changing your search terms or role filter."
          />
        )}
      </main>
    </div>
  );
};

export default UserManagement;

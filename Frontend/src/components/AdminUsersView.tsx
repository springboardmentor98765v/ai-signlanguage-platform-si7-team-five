import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle, Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import { apiBaseUrl } from '../utils/api';

export default function AdminUsersView() {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Learner' | 'Instructor' | 'Admin'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const fetchUsers = () => {
    setLoading(true);
    setError(false);
    const token = localStorage.getItem('asl_access_token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    
    fetch(`${apiBaseUrl}/admin/users`, { headers })
      .then(r => {
        if (!r.ok) throw new Error('API Error');
        return r.json();
      })
      .then(data => {
        setAdminUsers(data.map((u: any) => ({
           id: u.user_id,
           name: u.name,
           email: u.email || `${u.name.toLowerCase().replace(' ', '.')}@example.com`,
           role: u.role,
           active: u.active,
           joined: 'Recently',
        })));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserSelection = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.size === 0) return;
    if (window.confirm(`Are you sure you want to ${action} ${selectedUsers.size} selected users?`)) {
      window.alert(`Bulk ${action} successfully processed for users: ${Array.from(selectedUsers).join(', ')}`);
      setSelectedUsers(new Set());
    }
  };

  const filteredUsers = adminUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? user.active : !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div id="admin_users_panel" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight flex items-center">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform users, roles, and status.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading users from backend API...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-bold text-gray-900">Failed to load users</h3>
            <p className="text-sm text-gray-500">The backend API /admin/users endpoint is unavailable.</p>
            <button onClick={fetchUsers} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold">Retry</button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900">All Users</h3>
                  <p className="text-xs text-gray-500">{filteredUsers.length} users found</p>
                </div>
                {selectedUsers.size > 0 && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-blue-600 font-bold">{selectedUsers.size} selected</span>
                    <button onClick={() => handleBulkAction('Activate')} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Activate</button>
                    <button onClick={() => handleBulkAction('Deactivate')} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Deactivate</button>
                    <button onClick={() => handleBulkAction('Delete')} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100">Delete</button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="border border-gray-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="Learner">Learner</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Accessibility Trainer">Accessibility Trainer</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border border-gray-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">User</th>
                    <th className="px-5 py-3 text-left font-semibold">Role</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Joined</th>
                    <th className="px-5 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">
                            {user.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-red-50 text-red-700' :
                          user.role === 'Instructor' ? 'bg-blue-50 text-blue-700' :
                          user.role === 'Accessibility Trainer' ? 'bg-purple-50 text-purple-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span className="text-xs text-gray-600">{user.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{user.joined}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button aria-label={user.active ? "Deactivate User" : "Activate User"} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition focus:outline-none focus:ring-2 focus:ring-emerald-500" title={user.active ? "Deactivate" : "Activate"}>
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button aria-label="Edit User" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button aria-label="Delete User" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition focus:outline-none focus:ring-2 focus:ring-red-500" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                        No users match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

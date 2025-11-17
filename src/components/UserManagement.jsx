import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { UserPlus, Trash2, Search, X } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Worker',
    password: '',
  });
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(null);

  // Fetch logged-in user
  const fetchLoggedInUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching logged-in user:', error);
      return;
    }
    setLoggedInUserEmail(data.user?.email || null);
  };

  // Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  useEffect(() => {
    fetchLoggedInUser();
    fetchUsers();

    const subscription = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchUsers()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (users || []).filter(
      (user) =>
        (user.name?.toLowerCase().includes(query) || false) ||
        (user.email?.toLowerCase().includes(query) || false)
    );
  }, [users, searchQuery]);

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;

    const { data, error } = await supabase.from('users').insert([
      {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Active',
        password: newUser.password, // For dev/testing only
      },
    ]);

    if (error) {
      console.error('Error adding user:', error);
    } else {
      setUsers((prev) => [...prev, ...(data || [])]);
      setNewUser({ name: '', email: '', role: 'Worker', password: '' });
      setShowAddUser(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id, email) => {
    if (email === loggedInUserEmail) {
      alert("You cannot delete your own account.");
      return;
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Error deleting user:', error);
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // Toggle user status
  const toggleUserStatus = async (id, email) => {
    if (email === loggedInUserEmail) {
      alert("You cannot deactivate your own account.");
      return;
    }

    const user = users.find((u) => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">User Management</h3>
              <p className="text-sm text-gray-500">Manage system users and their permissions in real-time.</p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 h-10 font-medium transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </button>
          </div>

          {/* Search */}
          <div className="p-6 pt-0">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* User Table */}
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left font-medium text-gray-500">Name</th>
                    <th className="h-12 px-4 text-left font-medium text-gray-500">Email</th>
                    <th className="h-12 px-4 text-left font-medium text-gray-500">Role</th>
                    <th className="h-12 px-4 text-left font-medium text-gray-500">Status</th>
                    <th className="h-12 px-4 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              user.role?.toLowerCase() === 'admin'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              user.status?.toLowerCase() === 'active'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.email)}
                              className="h-9 px-3 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                            >
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="h-9 px-3 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-8">
                        No users found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 pb-3">
              <h3 className="text-sm font-medium">Total Users</h3>
            </div>
            <div className="p-6 pt-0 text-3xl font-bold text-indigo-600">{users.length}</div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 pb-3">
              <h3 className="text-sm font-medium">Active Users</h3>
            </div>
            <div className="p-6 pt-0 text-3xl font-bold text-emerald-600">
              {users.filter((u) => u.status?.toLowerCase() === 'active').length}
            </div>
          </div>

          {/* Active Admins */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 pb-3">
              <h3 className="text-sm font-medium">Active Admins</h3>
            </div>
            <div className="p-6 pt-0 text-3xl font-bold text-red-600">
              {users.filter(
                (u) =>
                  u.status?.toLowerCase() === 'active' &&
                  u.role?.toLowerCase() === 'admin'
              ).length}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-2xl font-semibold tracking-tight">Add New User</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-gray-500 hover:text-gray-900" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Worker">Worker</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center h-10 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Add User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 h-10 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

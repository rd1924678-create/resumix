import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Users, FileText, Download, Award, Trash2, ShieldCheck, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, resumesRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getUsers(),
        adminService.getResumes(),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (resumesRes.data.success) setResumes(resumesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This will remove all their saved resumes.')) return;
    try {
      const res = await adminService.deleteUser(id);
      if (res.data.success) {
        setUsers(users.filter(u => u._id !== id));
        // Refresh analytics as total counts have changed
        const analyticsRes = await adminService.getAnalytics();
        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      toast.error('Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading analytics metrics...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 resume-builder-dark-theme">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-7 text-slate-950 sm:text-3xl">
          System Admin Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Telemetry dashboard reporting active users, templates, and resume scores.
        </p>
      </div>

      {/* Telemetry Widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Users</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{analytics?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Resumes</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{analytics?.totalResumes || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Downloads</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{analytics?.totalDownloads || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Avg ATS Score</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{analytics?.averageScore || 0}/100</p>
          </div>
        </div>
      </div>

      {/* Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-slate-200 mb-6 flex space-x-4">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeSubTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Registered Users ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('resumes')}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeSubTab === 'resumes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Created Resumes ({resumes.length})
            </button>
          </div>

          {activeSubTab === 'users' ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Joined Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-3">Resume Title</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">ATS Score</th>
                    <th className="px-6 py-3">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {resumes.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{r.title}</td>
                      <td className="px-6 py-4">{r.user ? r.user.name : 'Deleted User'}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${r.atsScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {r.atsScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">{r.downloadsCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar templates metrics */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-950 text-sm mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              Template Usage Distribution
            </h3>
            <div className="space-y-4">
              {analytics?.templateStats?.map((stat) => (
                <div key={stat._id}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="capitalize">{stat._id.replace('-', ' ')}</span>
                    <span>{stat.count} Resumes</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${(stat.count / (analytics.totalResumes || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

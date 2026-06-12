import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeService } from '../services/api';
import { Plus, Edit2, Trash2, Eye, FileText, Download, Award, RefreshCw, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await resumeService.getAll();
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await resumeService.delete(id);
      if (res.data.success) {
        setResumes(resumes.filter(r => r._id !== id));
        toast.success('Resume deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  // Calculate quick metrics
  const totalResumes = resumes.length;
  const downloadsCount = resumes.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
  const highestScore = resumes.length > 0 ? Math.max(...resumes.map(r => r.atsScore || 0)) : 0;
  const lastUpdated = resumes.length > 0 ? new Date(resumes[0].updatedAt).toLocaleDateString() : 'N/A';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-slate-950 sm:text-3xl sm:truncate">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage recruiter-optimized resumes to maximize interview callbacks.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/builder/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Build New Resume
          </Link>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="bg-white overflow-hidden border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Resumes</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{totalResumes}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top ATS Score</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{highestScore}/100</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">PDF Downloads</p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">{downloadsCount}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden border border-slate-200 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Last Updated</p>
            <p className="text-xl font-bold text-slate-950 mt-1">{lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Resumes List */}
      <h2 className="text-lg font-bold text-slate-950 mb-4">Your Resumes</h2>
      
      {loading ? (
        <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
          <p className="text-slate-500 text-sm">Loading your resumes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl flex flex-col items-center">
          <FileText className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No resumes yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            Kickstart your application process by building your first ATS-friendly developer resume.
          </p>
          <Link
            to="/builder/new"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Build First Resume
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {resumes.map((resume) => (
              <li key={resume._id} className="hover:bg-slate-50 transition">
                <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{resume.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{resume.templateId.replace('-', ' ')} Template</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Score badge */}
                    <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      <span className="text-xs text-slate-500 font-semibold">Score:</span>
                      <span className={`text-xs font-bold ${
                        resume.atsScore >= 80 ? 'text-emerald-600' :
                        resume.atsScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {resume.atsScore}/100
                      </span>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/builder/${resume._id}`}
                        className="text-slate-600 hover:text-slate-950 p-2 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/preview/${resume._id}`}
                        className="text-slate-600 hover:text-slate-950 p-2 hover:bg-slate-100 rounded-lg transition"
                        title="Preview & Print"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

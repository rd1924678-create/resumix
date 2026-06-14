import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resumeService } from '../services/api';
import { Plus, Trash2, FileText, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col font-sans">
      {/* Background decorations */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.02]" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col justify-start">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 flex-shrink-0 border-b border-slate-900 pb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Create, customize, and optimize your ATS-compatible developer resumes.
            </p>
          </div>
          
          <Link
            to="/select-template"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/15"
          >
            <Plus className="-ml-1 mr-1.5 h-4 w-4" />
            Build New Resume
          </Link>
        </div>

        {/* Resumes Workspace list */}
        <div className="flex-grow">
          {loading ? (
            <div className="text-center py-16 bg-slate-900/20 border border-slate-900 rounded-2xl">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-semibold">Loading your dashboard workspace...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-rose-950/20 border border-rose-900/30 rounded-2xl text-rose-350 text-xs font-semibold">
              {error}
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center p-6">
              <FileText className="h-10 w-10 text-slate-700 mb-4" />
              <h3 className="font-bold text-white text-base">No resumes yet</h3>
              <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                Kickstart your application process by building your first ATS-friendly developer resume.
              </p>
              <Link
                to="/select-template"
                className="mt-6 inline-flex items-center px-4.5 py-2 border border-transparent rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Build First Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Documents</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded-full border border-slate-850">
                  {resumes.length}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="bg-slate-900/35 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 hover:bg-slate-900/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Meta info */}
                      <div className="flex items-center justify-between mb-4.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                          {resume.templateId.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850">
                          <span className={`text-[10px] font-black ${
                            resume.atsScore >= 80 ? 'text-emerald-450' :
                            resume.atsScore >= 60 ? 'text-amber-455' : 'text-rose-455'
                          }`}>
                            {resume.atsScore}% ATS
                          </span>
                        </div>
                      </div>

                      {/* Document Title */}
                      <h3 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-blue-400 transition-colors">
                        {resume.title}
                      </h3>

                      {/* Date details */}
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center justify-between mt-6 pt-3.5 border-t border-slate-950">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/builder/${resume._id}`}
                          className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3.5 py-1.5 rounded-lg border border-blue-500/10"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/preview/${resume._id}`}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg"
                        >
                          Preview
                        </Link>
                      </div>

                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="text-slate-600 hover:text-rose-400 p-1.5 hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Delete Resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

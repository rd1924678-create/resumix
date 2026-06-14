import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid or expired reset token');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-955 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-grid-white">
      {/* Decorative blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors duration-200">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">Resumix</span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-white">Enter New Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/40 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-900">
          {error && (
            <div className="mb-4 bg-rose-955/40 border-l-4 border-rose-500 p-4 rounded-lg text-sm text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-emerald-955/40 border-l-4 border-emerald-500 p-4 rounded-lg text-sm text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{message}. Redirecting to login...</span>
            </div>
          )}

          {!token ? (
            <div className="text-center p-4 bg-rose-955/45 text-rose-300 rounded-lg text-sm border border-slate-800">
              No reset token found in URL path. Please initiate password reset again.
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-355 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 block w-full px-3.5 py-2.5 bg-slate-955 border border-slate-900 rounded-lg text-white placeholder-slate-655 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-355 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 block w-full px-3.5 py-2.5 bg-slate-955 border border-slate-900 rounded-lg text-white placeholder-slate-655 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-55 transform active:scale-95 cursor-pointer"
                >
                  {loading ? 'Resetting...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-grid-white">
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
        <h2 className="mt-6 text-3xl font-extrabold text-white">Reset Your Password</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your registered email and we will generate a password recovery token.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/40 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-900">
          {error && (
            <div className="mb-4 bg-rose-950/40 border-l-4 border-rose-500 p-4 rounded-lg text-sm text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-emerald-950/40 border-l-4 border-emerald-500 p-4 rounded-lg text-sm text-emerald-300 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{message}</span>
              </div>
              {resetToken && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-xs">
                  <p className="font-semibold text-emerald-400">Developer/Demo Helper:</p>
                  <p className="text-slate-400 mt-1">Since email sending is simulated, click below to set a new password:</p>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="mt-1 inline-block font-bold text-blue-400 hover:text-blue-300 underline"
                  >
                    Reset Password Link
                  </Link>
                </div>
              )}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-900 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-55 transform active:scale-95 cursor-pointer"
              >
                {loading ? 'Sending link...' : 'Generate Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-blue-400 hover:text-blue-300">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

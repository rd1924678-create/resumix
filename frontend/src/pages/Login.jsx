import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { FileText, AlertCircle, ArrowLeft, Check, Star, Shield, KeyRound, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Debounced secret code detection (only runs when the user types in the input section)
  useEffect(() => {
    if (!email || showPassword || showOtp) return;
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        if (email.trim().length >= 4) {
          const res = await authService.checkSecretCode(email.trim());
          if (res.data.success && res.data.matched) {
            setEmail(res.data.adminEmail);
            setShowPassword(true);
            setShowOtp(false);
            setError('');
            setInfoMessage('Admin secret code detected! Please enter your admin password.');
          }
        }
      } catch (err) {
        console.error('Failed to verify secret code', err);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [email, showPassword, showOtp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (showPassword) {
        // Admin logging in with email and password
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else if (showOtp) {
        // Regular user submitting OTP
        const result = await verifyOtp(email, otp);
        setLoading(false);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else {
        // Regular user requesting OTP
        const result = await login(email);
        setLoading(false);
        if (result.success && result.requiresOtp) {
          setShowOtp(true);
          setInfoMessage('A verification code has been sent to your email.');
        } else {
          setError(result.message || 'Failed to send OTP.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResetForm = () => {
    setEmail('');
    setPassword('');
    setOtp('');
    setShowPassword(false);
    setShowOtp(false);
    setReceivedOtp('');
    setError('');
    setInfoMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
      {/* Back to Home Action */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-full px-3 py-1.5 transition-all duration-200 backdrop-blur-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Left Pane - Form Panel */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 z-10 bg-slate-950 relative border-r border-slate-900/50">
        <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mx-auto w-full max-w-md z-10">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">Resumix</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-sm text-slate-400">
              New to Resumix?{' '}
              <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Create a free account
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/20 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            {error && (
              <div className="mb-4 bg-rose-950/40 border-l-4 border-rose-500 p-4 rounded-lg text-sm text-rose-300 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 bg-blue-950/40 border-l-4 border-blue-500 p-4 rounded-lg text-sm text-blue-300 flex items-start gap-2 animate-fadeIn">
                <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  disabled={showOtp}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 auth-input disabled:opacity-60"
                  placeholder="name@company.com"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {showPassword && (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                      Admin Password
                    </label>
                    <button type="button" onClick={handleResetForm} className="text-xs font-semibold text-blue-450 hover:text-blue-350">
                      Cancel Admin Mode
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 auth-input"
                    placeholder="••••••••"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              )}

              {showOtp && (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label htmlFor="otp" className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                      6-Digit OTP Verification
                    </label>
                    <button type="button" onClick={handleResetForm} className="text-xs font-semibold text-blue-450 hover:text-blue-350">
                      Change Email
                    </button>
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-slate-700 rounded-lg text-center font-bold tracking-[0.2em] text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 auth-input"
                    placeholder="000000"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-55 transform active:scale-95 cursor-pointer"
              >
                {loading ? 'Processing...' : (showPassword ? 'Admin Sign In' : (showOtp ? 'Verify OTP & Enter' : 'Get Verification Code'))}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Pane - Marketing Panel */}
      <div className="hidden md:flex md:w-[55%] bg-slate-955/65 flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        
        {/* Top Metric Header */}
        <div className="flex justify-end z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-3.5 py-1.5 text-xs text-slate-300 font-semibold shadow-lg backdrop-blur-md">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>GDPR & ATS Compliant System</span>
          </div>
        </div>

        {/* Center Marketing Copy */}
        <div className="max-w-xl mx-auto my-auto space-y-10 z-10 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-1 bg-blue-955/50 border border-blue-900/60 rounded px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
              Featured Platform
            </div>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Craft high-indexing single column resumes in minutes.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Resumix is custom engineered to match applicant tracking algorithms used by Fortune 550 tech firms. No tables, no columns, no graphs. Just raw optimized code readiness.
            </p>
          </div>

          <ul className="space-y-4 text-sm">
            {[
              "Real-time visual ATS keyword analyzer checks densities",
              "5 pre-formatted system designs certified by tech recruiters",
              "Dynamic secure exports ready for one-click PDF downloading",
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3 text-slate-300">
                <div className="h-5 w-5 rounded-full bg-blue-955 flex items-center justify-center border border-blue-900/50 flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Glowing Testimonial Box */}
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-xl backdrop-blur-sm shadow-xl max-w-lg">
            <div className="flex items-center gap-1 mb-2.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
              ))}
            </div>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              "Resumix helped me format my internship and project descriptions cleanly. My previous resume had visual timeline charts that ATS systems couldn't parse. After copying my details over, my response rate skyrocketed."
            </p>
            <div className="mt-3.5 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                AK
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-200">Abhishek Kumar</div>
                <div className="text-[8px] text-slate-500">Incoming SWE Intern @ Microsoft</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright/footer notice */}
        <div className="text-xs text-slate-655 z-10 flex justify-between">
          <span>© Resumix Systems Inc.</span>
          <span>Security Certified</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

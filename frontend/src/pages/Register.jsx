import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, Check, Star, Users, Sparkles } from 'lucide-react';
import logo from '../assets/resumixlogo-removebg-preview.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState('');

  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (showOtp) {
        // Submit OTP code
        const result = await verifyOtp(email, otp);
        setLoading(false);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else {
        // Register name/email and request OTP
        const result = await register(name, email);
        setLoading(false);
        if (result.success && result.requiresOtp) {
          setShowOtp(true);
          setInfoMessage('A verification code has been sent to your email.');
        } else {
          setError(result.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setOtp('');
    setShowOtp(false);
    setReceivedOtp('');
    setError('');
    setInfoMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-955 flex flex-col md:flex-row relative overflow-hidden">
      {/* Back to Home Action */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-full px-3 py-1.5 transition-all duration-200 backdrop-blur-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Left Pane - Form Panel */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-4 py-8 sm:px-12 sm:py-12 lg:px-16 z-10 bg-slate-955 relative border-r border-slate-900/50">
        <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mx-auto w-full max-w-md z-10">
          <div className="mb-6 mt-12 md:mt-0">
            <Link to="/" className="inline-flex items-center">
              <img src={logo} alt="Resumix Logo" className="h-8 w-auto object-contain -mr-1" />
              <span className="font-extrabold text-xl text-white tracking-tight mt-0.5">esumix</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">Create Free Profile</h2>
            <p className="mt-2 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/20 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            {error && (
              <div className="mb-4 bg-rose-955/40 border-l-4 border-rose-500 p-4 rounded-lg text-sm text-rose-300 flex items-start gap-2 animate-fadeIn">
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

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!showOtp ? (
                <>
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 block w-full px-3.5 py-2.5 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 auth-input"
                      placeholder="Rahul Kumar"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-355 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 block w-full px-3.5 py-2.5 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 auth-input"
                      placeholder="rahul.kumar@gmail.com"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </>
              ) : (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label htmlFor="otp" className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                      6-Digit OTP Verification
                    </label>
                    <button type="button" onClick={handleResetForm} className="text-xs font-semibold text-blue-450 hover:text-blue-355">
                      Change Details
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

              <div className="text-[10px] text-slate-500 leading-normal">
                By registering, you agree to build clean text-based resumes matching global recruiter ATS standards.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-55 transform active:scale-95 cursor-pointer"
              >
                {loading ? 'Processing...' : (showOtp ? 'Verify OTP & Create Profile' : 'Register Profile & Send OTP')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Pane - Marketing Panel */}
      <div className="hidden md:flex md:w-[55%] bg-slate-955/65 flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        
        {/* Top Metric Header */}
        <div className="flex justify-end z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-3.5 py-1.5 text-xs text-slate-300 font-semibold shadow-lg backdrop-blur-md">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span>Join 10,000+ Software Engineers</span>
          </div>
        </div>

        {/* Center Marketing Copy */}
        <div className="max-w-xl mx-auto my-auto space-y-10 z-10 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-1 bg-indigo-950/50 border border-indigo-900/60 rounded px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
              Quick Setup
            </div>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Say goodbye to graphical template filters.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Resumix is optimized specifically to showcase developer skill matrices, platform certifications, coding languages, and projects vertical ordering without parser breakages.
            </p>
          </div>

          <ul className="space-y-4 text-sm text-slate-305">
            {[
              "Highlight certifications with custom platform templates",
              "ATS Scoring updates live as you build sections",
              "Clean, single-column export format eliminates visual bugs",
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3 text-slate-300">
                <div className="h-5 w-5 rounded-full bg-blue-955 flex items-center justify-center border border-blue-900/50 flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial Box */}
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-xl backdrop-blur-sm shadow-xl max-w-lg">
            <div className="flex items-center gap-1 mb-2.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
              ))}
            </div>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              "Building resumes tailormade for software roles used to be a hassle. This tool parses perfectly. I used the Classic Professional design and got invited to 4 tech hiring loops in a week."
            </p>
            <div className="mt-3.5 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                NK
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-200">Nikhil Kapoor</div>
                <div className="text-[8px] text-slate-500">Incoming SWE @ Oracle India</div>
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

export default Register;

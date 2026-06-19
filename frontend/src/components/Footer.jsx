import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/resumixlogo-removebg-preview.png';

// Inline SVG components to bypass any lucide-react version compatibility issues
const GithubIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const ExternalLinkIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11 11 13 15 9" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-slate-950/90 border-t border-slate-900 pt-16 pb-8 no-print mt-auto transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-flex items-center">
              <img src={logo} alt="Resumix Logo" className="h-8 w-auto object-contain -mr-1" />
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-white font-sans mt-0.5">esumix</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering engineers and tech professionals to design ATS-optimized, high-scoring resumes with AI-driven analysis.
            </p>
            <p className="text-slate-500 text-xs font-medium">
              This project is 100% open source to all on GitHub.
            </p>
            <div className="flex items-center space-x-4 pt-1">
              <a 
                href="https://github.com/rd1924678-create/resumix" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs"
              >
                <GithubIcon className="h-4 w-4" />
                <span>View Repository</span>
              </a>
            </div>
          </div>

          {/* Features Column */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Features</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/ats-scorer" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                  ATS Score Analyzer
                </Link>
              </li>
              <li>
                <Link to="/select-template" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                  Interactive Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                  User Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Platform Column */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">AI Technology</h4>
            <ul className="space-y-2.5">
              <li>
                <a 
                  href="https://build.nvidia.com/models" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors duration-150"
                >
                  NVIDIA NIM API <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-400 text-sm">
                  Llama 3.3 70B Instruct
                </span>
              </li>
              <li>
                <span className="text-slate-500 text-xs italic block mt-1">
                  100% Free LLM Inference Pipeline
                </span>
              </li>
            </ul>
          </div>

          {/* Legal / Trust Column */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Support & Trust</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-slate-400 text-sm block">
                  B.Tech, BCA, MCA Targeted Layouts
                </span>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-emerald-400/90 text-sm">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Secure & Private Processing</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Resumix. All rights reserved. Designed for optimal ATS parser alignment.
          </p>
          <div className="flex space-x-6 text-xs text-slate-500">
            <span className="hover:text-slate-400 cursor-pointer transition-colors duration-150">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors duration-150">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

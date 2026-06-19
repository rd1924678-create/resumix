import React from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, ShieldCheck } from 'lucide-react';
import logo from '../assets/resumixlogo-removebg-preview.png';

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
                <Github className="h-4 w-4" />
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
                  NVIDIA NIM API <ExternalLink className="h-3 w-3" />
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
                  <ShieldCheck className="h-4 w-4" />
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

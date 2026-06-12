import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-900">Resumix</span>
          <span className="text-slate-400 text-sm">|</span>
          <span className="text-slate-500 text-sm">ATS-Compliant Resume Architect</span>
        </div>
        <p className="text-slate-500 text-xs">
          &copy; {new Date().getFullYear()} Resumix. All rights reserved. Optimized for BCA, MCA, and B.Tech CSE graduates.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

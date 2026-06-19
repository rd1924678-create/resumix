import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, ShieldAlert, Award, FileText, Check, ArrowRight,
  Star, Zap, Cpu, Lock, Target, TrendingUp, ChevronDown, Sparkles,
  Users, Download, Eye, BarChart3, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTemplateComponent } from '../templates/ResumeTemplates';
import { MOCK_RESUME_DATA } from '../utils/mockData';
import { atsService } from '../services/api';

const templatesList = [
  { id: "classic", name: "Classic Professional", badge: "Most Popular", color: "blue", desc: "Traditional standard look, ideal for BCA/MCA general roles.", tag: "General IT" },
  { id: "software-engineer", name: "Software Engineer ATS", badge: "Top Pick", color: "violet", desc: "Top skills block format, optimized for junior developers.", tag: "Tech Roles" },
  { id: "fresh-graduate", name: "Fresh Graduate ATS", badge: "Fresher Friendly", color: "emerald", desc: "Highlight academic records and training, ideal for students.", tag: "Students" },
  { id: "modern-minimal", name: "Modern Minimal ATS", badge: "Clean Design", color: "amber", desc: "Serif heading, clean and compact for crowded experiences.", tag: "Minimalist" },
  { id: "it-professional", name: "IT Professional ATS", badge: "Experienced", color: "rose", desc: "Structured for network, databases, and platform certs.", tag: "Senior Roles" }
];

const steps = [
  { num: "01", title: "Choose Your Template", desc: "Pick from 5 expertly crafted, ATS-validated resume layouts built for tech roles.", icon: Eye },
  { num: "02", title: "Fill In Your Details", desc: "Our guided step-by-step wizard makes filling in your resume fast, clear, and intuitive.", icon: FileText },
  { num: "03", title: "Download & Apply", desc: "Export your resume as a print-ready PDF and start applying to your dream companies.", icon: Download },
];

const features = [
  { icon: Shield, title: "100% ATS Compliant", desc: "All templates are tested against major ATS parsers used by top tech recruiters.", color: "blue" },
  { icon: Zap, title: "AI-Powered Live Scoring", desc: "Real-time AI ATS auditor checks structure, keywords, and spelling to rate your match score.", color: "violet" },
  { icon: Target, title: "AI Role Presets", desc: "One-click AI presets generate summaries and skill matrices for MERN, Java, DevOps, and more.", color: "emerald" },
  { icon: TrendingUp, title: "Dynamic Scale Preview", desc: "Live A4 document preview scales smoothly to fit any desktop, tablet, or mobile viewport without clipping.", color: "amber" },
  { icon: Lock, title: "Template Locked Flow", desc: "Choose your template once. The wizard keeps you focused on content, not formatting.", color: "rose" },
  { icon: BarChart3, title: "Section Reordering", desc: "Drag and drop resume sections to match what recruiters in your target role want to see first.", color: "cyan" },
];

const faqs = [
  { q: "What makes a resume 'ATS-Friendly'?", a: "Applicant Tracking Systems parse resumes as plain text. Fancy tables, graphics, profile photos, icons, and progress bars confuse the parsers, leading to rejected applications. An ATS-friendly resume has a clean, single-column format, standard section headings, and selectable text." },
  { q: "Can B.Tech CSE / MCA freshers use this platform?", a: "Yes! The platform is custom-built for freshers. The templates place emphasis on academic records, technical project contributions, and core programming skill matrices to help you land interview shortlists." },
  { q: "Is there a limit on how many resumes I can build?", a: "No. You can create, edit, customize, and save multiple versions of your resume tailored to different jobs (e.g., Frontend Developer vs. Backend Developer)." },
  { q: "How does the ATS Resume Scoring System work?", a: "Our algorithm scans your resume for critical sections, link placements (like GitHub and LinkedIn), skill variety, and item counts to evaluate readiness and match recruiter expectations." },
  { q: "Can I change my template after I start building?", a: "For best results, we ask you to select a template before you begin. This keeps the wizard focused and ensures section ordering is optimized for the template from the start." },
];

const colorMap = {
  blue: { border: "border-blue-500/60", glow: "shadow-blue-500/20", badge: "bg-blue-950/60 text-blue-300 border-blue-800/40", dot: "bg-blue-500", icon: "text-blue-400 bg-blue-950/60" },
  violet: { border: "border-violet-500/60", glow: "shadow-violet-500/20", badge: "bg-violet-950/60 text-violet-300 border-violet-800/40", dot: "bg-violet-500", icon: "text-violet-400 bg-violet-950/60" },
  emerald: { border: "border-emerald-500/60", glow: "shadow-emerald-500/20", badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40", dot: "bg-emerald-500", icon: "text-emerald-400 bg-emerald-950/60" },
  amber: { border: "border-amber-500/60", glow: "shadow-amber-500/20", badge: "bg-amber-950/60 text-amber-300 border-amber-800/40", dot: "bg-amber-500", icon: "text-amber-400 bg-amber-950/60" },
  rose: { border: "border-rose-500/60", glow: "shadow-rose-500/20", badge: "bg-rose-950/60 text-rose-300 border-rose-800/40", dot: "bg-rose-500", icon: "text-rose-400 bg-rose-950/60" },
  cyan: { border: "border-cyan-500/60", glow: "shadow-cyan-500/20", badge: "bg-cyan-950/60 text-cyan-300 border-cyan-800/40", dot: "bg-cyan-500", icon: "text-cyan-400 bg-cyan-950/60" },
};

const AccordionItem = ({ faq, isOpen, onToggle }) => (
  <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-blue-500/40 bg-blue-950/10' : 'border-slate-800 bg-slate-900/40'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-5 text-left"
    >
      <span className="font-semibold text-white text-sm sm:text-base pr-4">{faq.q}</span>
      <ChevronDown className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
    </button>
    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
      <p className="px-6 pb-5 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
    </div>
  </div>
);

const LandingPage = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [openFaq, setOpenFaq] = useState(null);

  const [fitScale, setFitScale] = useState(0.5);
  const previewWrapRef = useRef(null);
  const A4_W = 794;
  const A4_H = 1123;

  const [stats, setStats] = useState({
    developersHelped: '10,000+',
    resumesCreated: '25,000+',
    atsPassRate: '98%',
    avgBuildTime: '< 5m',
    userRating: '4.9/5'
  });

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const response = await atsService.getPublicStats();
        if (active && response.data && response.data.success) {
          const { developersHelped, resumesCreated, atsPassRate, avgBuildTime, userRating } = response.data.data;
          const formatVal = (val) => {
            if (typeof val === 'number') {
              return val > 0 ? `${val.toLocaleString()}+` : '0';
            }
            return val;
          };
          setStats({
            developersHelped: formatVal(developersHelped),
            resumesCreated: formatVal(resumesCreated),
            atsPassRate,
            avgBuildTime,
            userRating
          });
        }
      } catch (err) {
        console.error('Failed to load public stats:', err);
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const calc = () => {
      const parentEl = el.parentElement;
      const containerW = parentEl ? parentEl.offsetWidth : el.offsetWidth;
      const isMobile = window.innerWidth < 640;
      const parentPad = isMobile ? 40 : 64; // p-5 vs p-8
      const innerPad = 48; // p-6
      const scale = (containerW - parentPad - innerPad) / A4_W;
      setFitScale(Math.min(1.0, scale));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedTemplate]);

  const PreviewComponent = getTemplateComponent(selectedTemplate);
  const selectedTmpl = templatesList.find(t => t.id === selectedTemplate);
  const colors = colorMap[selectedTmpl?.color || 'blue'];

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col relative overflow-hidden">
      {/* Global mesh background */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none z-0" />
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative pt-12 pb-16 sm:pt-32 sm:pb-40 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left copy */}
          <div className="lg:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-300 mb-6 shadow-lg shadow-blue-900/20">
              <Zap className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              AI-Powered ATS Builder • Trusted by 10,000+ developers
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Land More<br />
              Interviews<br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                Faster.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              Build ATS-optimized developer resumes in minutes — fully mobile-responsive with AI-powered suggestions, auto-scaled templates, and smart role presets.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                to={user ? "/select-template" : "/register"}
                className="group bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm sm:text-base transform hover:-translate-y-0.5"
              >
                Build My Resume — Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#templates"
                className="text-slate-300 hover:text-white font-semibold px-6 py-4 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900 hover:border-slate-700 text-center text-sm sm:text-base"
              >
                See Templates
              </a>
            </div>

            {/* Social proof micro-stats */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-900 w-full grid grid-cols-3 gap-3 sm:gap-6">
              {[
                { val: stats.atsPassRate, label: "Avg. ATS Score" },
                { val: stats.resumesCreated, label: "Resumes Built" },
                { val: stats.avgBuildTime, label: "Avg. Build Time" },
              ].map(s => (
                <div key={s.label}>
                  <span className="block text-lg sm:text-3xl font-black text-white">{s.val}</span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating resume mockup */}
          <div className="lg:col-span-6 relative flex justify-center items-center hidden sm:flex">
            <div className="absolute w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Browser chrome */}
              <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 shadow-2xl shadow-black/50 backdrop-blur-md animate-float">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono bg-slate-800/60 px-2 py-0.5 rounded">resumix — builder</div>
                </div>

                {/* Mini resume sheet */}
                <div className="bg-white rounded-xl p-5 text-[6px] text-slate-900 leading-normal shadow-inner select-none pointer-events-none aspect-[1/1.414]">
                  <div className="text-center border-b pb-2 mb-3">
                    <div className="font-extrabold text-[10px] tracking-tight uppercase text-slate-900">{MOCK_RESUME_DATA.personalInfo.fullName}</div>
                    <div className="text-[5.5px] text-slate-500 mt-1 flex justify-center gap-2 flex-wrap">
                      <span>{MOCK_RESUME_DATA.personalInfo.email}</span><span>•</span><span>{MOCK_RESUME_DATA.personalInfo.phoneNumber}</span><span>•</span><span>{MOCK_RESUME_DATA.personalInfo.location}</span>
                    </div>
                  </div>
                  <div className="mb-2.5">
                    <div className="font-bold text-[6.5px] border-b pb-0.5 mb-1.5 text-slate-900 uppercase tracking-wide">Technical Skills</div>
                    <div className="text-[5.5px] text-slate-700 leading-normal space-y-0.5">
                      <div><strong>Languages:</strong> {MOCK_RESUME_DATA.skills.programmingLanguages.slice(0, 3).join(', ')}</div>
                      <div><strong>Frontend:</strong> {MOCK_RESUME_DATA.skills.frontend.slice(0, 3).join(', ')}</div>
                      <div><strong>Backend:</strong> {MOCK_RESUME_DATA.skills.backend.slice(0, 2).join(', ')} · <strong>DB:</strong> {MOCK_RESUME_DATA.skills.database.slice(0, 2).join(', ')}</div>
                    </div>
                  </div>
                  <div className="mb-2.5">
                    <div className="font-bold text-[6.5px] border-b pb-0.5 mb-1.5 text-slate-900 uppercase tracking-wide">Experience</div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[5.5px]">{MOCK_RESUME_DATA.experience[0].position} – {MOCK_RESUME_DATA.experience[0].company}</span>
                      <span className="text-[5px] text-slate-500">{MOCK_RESUME_DATA.experience[0].duration}</span>
                    </div>
                    <ul className="list-disc pl-2.5 mt-0.5 text-[5px] text-slate-600 space-y-0.5">
                      {MOCK_RESUME_DATA.experience[0].description.map((desc, idx) => (
                        <li key={idx}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-[6.5px] border-b pb-0.5 mb-1.5 text-slate-900 uppercase tracking-wide">Education</div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[5.5px]">{MOCK_RESUME_DATA.education[0].degree}</span>
                      <span className="text-[5px] text-slate-500">{MOCK_RESUME_DATA.education[0].startDate} – {MOCK_RESUME_DATA.education[0].endDate}</span>
                    </div>
                    <div className="text-[5px] text-slate-600">{MOCK_RESUME_DATA.education[0].college} • {MOCK_RESUME_DATA.education[0].score}</div>
                  </div>
                </div>

                {/* Floating ATS badge */}
                <div className="absolute -top-5 -right-5 bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3 backdrop-blur-md animate-bounce-slow">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-11 h-11 -rotate-90">
                      <circle cx="22" cy="22" r="18" stroke="currentColor" className="text-slate-800" strokeWidth="3.5" fill="transparent" />
                      <circle cx="22" cy="22" r="18" stroke="currentColor" className="text-blue-500" strokeWidth="3.5" fill="transparent" strokeDasharray="113" strokeDashoffset="14" />
                    </svg>
                    <span className="absolute text-[11px] font-black text-white">88</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-200">ATS Score</div>
                    <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Recruiter Ready
                    </div>
                  </div>
                </div>

                {/* Floating skill audit badge */}
                <div className="absolute -bottom-4 -left-5 bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-lg hidden sm:flex items-center gap-2.5 max-w-[175px] backdrop-blur-md">
                  <div className="h-7 w-7 rounded-lg bg-violet-900/50 flex items-center justify-center flex-shrink-0 border border-violet-800/40">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-200">Smart Preset Applied</div>
                    <div className="text-[8px] text-slate-400">MERN Stack Developer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
      <section className="relative py-24 z-10 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-950/60 border border-violet-800/40 px-3 py-1.5 rounded-full">Simple 3-Step Process</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-5 leading-tight">
              Your Resume, Ready in<br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Minutes</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
              No design skills. No formatting headaches. Just a guided, step-by-step experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative bg-slate-900/50 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                      <Icon className="h-5 w-5 text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to={user ? "/select-template" : "/register"}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────── FEATURES ─────────────────────── */}
      <section className="relative py-24 z-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-full">Everything Included</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-5">
              Built for Modern{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Developers</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const c = colorMap[feat.color];
              return (
                <div key={idx} className={`group border ${c.border} bg-slate-900/40 rounded-2xl p-6 hover:shadow-xl ${c.glow} transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`w-11 h-11 rounded-xl ${c.icon} border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────── WHY ATS ─────────────────────── */}
      <section className="relative py-20 z-10 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-rose-900/40 hover:border-rose-700/50 rounded-2xl p-8 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2 bg-rose-950/60 rounded-lg border border-rose-800/40">
                <ShieldAlert className="h-6 w-6 text-rose-400" />
              </div>
              <h2 className="text-lg font-bold text-rose-300">Why Fancy Resumes Fail ATS</h2>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-400">
              {[
                ["Visual Timelines & Charts", "ATS systems cannot parse complex graphics — they get indexed as blank data."],
                ["Skills Percentage Bars", "Stating \"80% Java\" fails automated keyword density checks."],
                ["Multi-column Grids", "Side-by-side columns get parsed out of order, rendering statements unreadable."],
                ["Profile Photos & Icons", "Graphics pollute parsing results, causing instant filter disqualification."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5 flex-shrink-0">✕</span>
                  <span><strong className="text-rose-300">{t}:</strong> {d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm border border-emerald-900/40 hover:border-emerald-700/50 rounded-2xl p-8 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2 bg-emerald-950/60 rounded-lg border border-emerald-800/40">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-emerald-300">The Resumix Advantage</h2>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-400">
              {[
                ["Selectable PDF Text", "Custom generated raw string layout built for fast, indexing-ready search algorithms."],
                ["Single Column Hierarchy", "Structured vertically to optimize sequential parse ordering."],
                ["Standard Headers", "Built-in compliance labels matching automated industry filters exactly."],
                ["Smart Developer Presets", "Predefined CSE/IT sections, project bullets, and preset suggestions."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span><strong className="text-emerald-300">{t}:</strong> {d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────── TEMPLATE SHOWCASE ─────────────────────── */}
      <section id="templates" className="relative py-24 z-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 border border-blue-800/40 px-3 py-1.5 rounded-full">5 Validated Formats</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-5">
              Pick Your Perfect<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Resume Layout</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto text-sm">
              Click any card to preview it live with real sample data. Select once — your template locks in when you start building.
            </p>
          </div>

          {/* Template selector tabs */}
          <div className="flex gap-3 justify-start sm:justify-center mb-10 scroll-x-mobile pb-2">
            {templatesList.map((tmpl) => {
              const c = colorMap[tmpl.color];
              const isActive = selectedTemplate === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`group flex items-center gap-2.5 border rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? `${c.border} bg-slate-800/80 text-white shadow-lg ${c.glow}`
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? c.dot : 'bg-slate-700'}`} />
                  {tmpl.name}
                  {isActive && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${c.badge}`}>
                      {tmpl.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Preview Box */}
          <div className={`border ${colors.border} bg-slate-900/30 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-black/50 transition-all duration-500`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${colors.badge}`}>
                  {selectedTmpl?.tag}
                </span>
                <h3 className="font-bold text-white text-lg mt-2">{selectedTmpl?.name}</h3>
                <p className="text-slate-400 text-sm mt-0.5">{selectedTmpl?.desc}</p>
              </div>
              <Link
                to={user ? `/select-template` : "/register"}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                Use This Template
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div 
              ref={previewWrapRef}
              className="bg-slate-950/40 p-6 rounded-2xl flex justify-center items-start overflow-hidden border border-slate-900 w-full"
            >
              <div
                style={{
                  width: `${A4_W * fitScale}px`,
                  height: `${A4_H * fitScale}px`,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.2s ease-out'
                }}
              >
                <div
                  className="resume-preview-sheet"
                  style={{
                    width: `${A4_W}px`,
                    height: `${A4_H}px`,
                    transform: `scale(${fitScale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    margin: 0,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    padding: '56px 64px',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <PreviewComponent data={MOCK_RESUME_DATA} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── SOCIAL PROOF ─────────────────────── */}
      <section className="relative py-20 z-10 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, val: stats.developersHelped, label: "Developers Helped", color: "blue" },
              { icon: FileText, val: stats.resumesCreated, label: "Resumes Created", color: "violet" },
              { icon: Award, val: stats.atsPassRate, label: "Avg. ATS Score", color: "emerald" },
              { icon: Star, val: stats.userRating, label: "User Rating", color: "amber" },
            ].map(s => {
              const Icon = s.icon;
              const c = colorMap[s.color];
              return (
                <div key={s.label} className={`border ${c.border} bg-slate-900/40 rounded-2xl p-6 text-center hover:shadow-lg ${c.glow} transition-all duration-300`}>
                  <div className={`w-10 h-10 ${c.icon} rounded-xl border border-slate-700 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────── FAQ ─────────────────────── */}
      <section className="relative py-24 z-10 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              Frequently Asked<br />
              <span className="bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                faq={faq}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── FINAL CTA ─────────────────────── */}
      <section className="relative py-16 sm:py-24 z-10 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-blue-950/60 to-violet-950/60 border border-blue-800/40 rounded-2xl sm:rounded-3xl p-6 sm:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white opacity-50 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-200 mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Free to use. No credit card required.
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight">
                Your Next Interview<br />Starts Here.
              </h2>
              <p className="text-blue-200/80 mt-5 max-w-lg mx-auto text-base">
                Join thousands of developers who landed their dream jobs with a Resumix-built, ATS-optimized resume.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={user ? "/select-template" : "/register"}
                  className="group bg-white hover:bg-blue-50 text-blue-700 font-black px-10 py-4 rounded-xl shadow-2xl shadow-blue-900/30 transition-all duration-300 flex items-center gap-2.5 text-base transform hover:-translate-y-0.5"
                >
                  Build My Resume Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    className="text-blue-200 hover:text-white font-semibold px-6 py-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 text-sm"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

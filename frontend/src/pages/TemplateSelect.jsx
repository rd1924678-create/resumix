import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Lock, Eye, Star, Zap, Plus, Minus, Info } from 'lucide-react';
import { getTemplateComponent } from '../templates/ResumeTemplates';
import { MOCK_RESUME_DATA as MOCK_DATA } from '../utils/mockData';

const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    badge: "Most Popular",
    tag: "General IT & Corporate",
    color: "blue",
    desc: "Traditional center-aligned layout with clean horizontal dividers. Universally recognized by all major ATS systems.",
    bestFor: ["General Software Roles", "BCA / MCA Graduates", "Mid-level IT positions"],
    atsScore: 96,
  },
  {
    id: "software-engineer",
    name: "Software Engineer ATS",
    badge: "Top Pick",
    tag: "Technical Stack Rich",
    color: "violet",
    desc: "Left-aligned layout featuring a prominent tech skills matrix at the top to highlight technical stack immediately.",
    bestFor: ["MERN / MEAN Developers", "Junior Engineers", "Tech company applications"],
    atsScore: 98,
  },
  {
    id: "fresh-graduate",
    name: "Fresh Graduate ATS",
    badge: "Fresher Friendly",
    tag: "Academic Highlights",
    color: "emerald",
    desc: "Education-first layout with academic credentials and scores at the top. Tailored for campus drives and fresh grads.",
    bestFor: ["Final Year Students", "Campus Placements", "First Job Seekers"],
    atsScore: 95,
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal ATS",
    badge: "Sleek look",
    tag: "Minimalist",
    color: "amber",
    desc: "High text density, serif headers, and zero decorative accents. Perfect for candidates with deep experience.",
    bestFor: ["Experienced Developers", "Product Roles", "Design-aware Engineers"],
    atsScore: 94,
  },
  {
    id: "it-professional",
    name: "IT Professional ATS",
    badge: "Experienced",
    tag: "Structured Sections",
    color: "rose",
    desc: "Highly structured with left border accents. Optimized for platform, cloud, and systems infrastructure engineers.",
    bestFor: ["Senior Developers", "DevOps / Cloud Engineers", "IT Managers"],
    atsScore: 97,
  },
];

const THEME_COLORS = [
  { name: 'Slate Blue', hex: '#1e293b', bgClass: 'bg-[#1e293b] border border-slate-700' },
  { name: 'Royal Blue', hex: '#1d4ed8', bgClass: 'bg-[#1d4ed8]' },
  { name: 'Deep Teal', hex: '#0f766e', bgClass: 'bg-[#0f766e]' },
  { name: 'Midnight Black', hex: '#111827', bgClass: 'bg-[#111827] border border-slate-800' },
  { name: 'Deep Purple', hex: '#701a75', bgClass: 'bg-[#701a75]' },
];

const colorMap = {
  blue: {
    active: "border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/15",
    hover: "hover:border-blue-500/50",
    badge: "bg-blue-950/80 text-blue-300 border-blue-700/50",
    tag: "bg-blue-950/60 text-blue-400 border-blue-800/40",
    score: "text-blue-400",
    scoreBar: "bg-blue-500",
    btn: "from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-500/25",
    check: "text-blue-400 bg-blue-950/60",
    dot: "bg-blue-500",
    glow: "shadow-blue-500/20",
  },
  violet: {
    active: "border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/15",
    hover: "hover:border-violet-500/50",
    badge: "bg-violet-950/80 text-violet-300 border-violet-700/50",
    tag: "bg-violet-950/60 text-violet-400 border-violet-800/40",
    score: "text-violet-400",
    scoreBar: "bg-violet-500",
    btn: "from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-violet-500/25",
    check: "text-violet-400 bg-violet-950/60",
    dot: "bg-violet-500",
    glow: "shadow-violet-500/20",
  },
  emerald: {
    active: "border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/15",
    hover: "hover:border-emerald-500/50",
    badge: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
    tag: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
    score: "text-emerald-400",
    scoreBar: "bg-emerald-500",
    btn: "from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-emerald-500/25",
    check: "text-emerald-400 bg-emerald-950/60",
    dot: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  amber: {
    active: "border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/15",
    hover: "hover:border-amber-500/50",
    badge: "bg-amber-950/80 text-amber-300 border-amber-700/50",
    tag: "bg-amber-950/60 text-amber-400 border-amber-800/40",
    score: "text-amber-400",
    scoreBar: "bg-amber-500",
    btn: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25",
    check: "text-amber-400 bg-amber-950/60",
    dot: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
  rose: {
    active: "border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/15",
    hover: "hover:border-rose-500/50",
    badge: "bg-rose-950/80 text-rose-300 border-rose-700/50",
    tag: "bg-rose-950/60 text-rose-400 border-rose-800/40",
    score: "text-rose-400",
    scoreBar: "bg-rose-500",
    btn: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/25",
    check: "text-rose-400 bg-rose-950/60",
    dot: "bg-rose-500",
    glow: "shadow-rose-500/20",
  },
};

const TemplateSelect = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('classic');
  const [previewId, setPreviewId] = useState('classic');
  const [zoomPercent, setZoomPercent] = useState(100);
  const [fitScale, setFitScale] = useState(0.42);
  const [selectedColor, setSelectedColor] = useState('#1e293b');
  const [selectedFont, setSelectedFont] = useState('sans');
  const previewWrapRef = useRef(null);

  // A4 Dimensions (Standard 96dpi)
  const A4_W = 794;
  const A4_H = 1123;

  // Handle auto-fit calculations based on container size
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const calc = () => {
      const containerW = el.offsetWidth;
      const containerH = el.offsetHeight || 520;
      const padX = 48; // padding spacing
      const padY = 48;
      const scaleW = (containerW - padX) / A4_W;
      const scaleH = (containerH - padY) / A4_H;
      // We scale to fit whichever bounds are more restrictive
      setFitScale(Math.min(scaleW, scaleH));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleSelect = (id) => {
    setSelected(id);
    setPreviewId(id);
  };

  const handleContinue = () => {
    if (selected) {
      navigate(`/builder/new?template=${selected}&color=${encodeURIComponent(selectedColor)}&font=${selectedFont}`);
    }
  };

  const PreviewComponent = getTemplateComponent(previewId);
  const previewTmpl = templates.find(t => t.id === previewId);
  const pc = colorMap[previewTmpl?.color || 'blue'];
  const selectedTmpl = templates.find(t => t.id === selected);
  const sc = selected ? colorMap[selectedTmpl.color] : colorMap['blue'];

  // Final scale factor applied to the document
  const previewScale = fitScale * (zoomPercent / 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col font-sans">
      {/* Background decorations */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-5" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col justify-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 rounded-full px-4 py-1.5 text-xs font-bold text-blue-300">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            Step 1 of 3 — Choose Design Layout
          </div>
          <div className="w-28 invisible sm:block" />
        </div>

        {/* Page Title & Hook */}
        <div className="text-center mb-10 flex-shrink-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Select Your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Resume Layout
            </span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Choose a professional structure tailored to your target industry. Your choice locks in to ensure seamless parsing.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            Once selected, the document structure remains optimized to maintain layout integrity.
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch flex-grow">
          {/* Left Column: Template Cards & Customize Panel */}
          <div className="xl:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Layouts</h2>
              {templates.map((tmpl, index) => {
                const isSelected = selected === tmpl.id;
                const isPreviewed = previewId === tmpl.id;
                const c = colorMap[tmpl.color];

                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelect(tmpl.id)}
                    onMouseEnter={() => setPreviewId(tmpl.id)}
                    className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-slate-900/90 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Number Index */}
                      <span className="font-mono text-xs font-bold text-slate-500 flex-shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm tracking-tight">{tmpl.name}</span>
                          {tmpl.badge && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${c.badge}`}>
                              {tmpl.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-1 line-clamp-1">
                          {tmpl.tag} • {tmpl.desc.split('.')[0]}
                        </span>
                      </div>
                    </div>

                    {/* ATS Matching Score Indicator */}
                    <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">ATS Score</span>
                        <span className="text-sm font-black text-emerald-400">{tmpl.atsScore}%</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar bottom: Customization panel */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-blue-400" /> Layout Customizer (Instant Preview)
              </h3>

              {/* Theme Colors Picker */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 font-medium">Accent Signature Color</span>
                  <span className="text-[10px] font-semibold text-slate-500 italic">Pre-loaded in builder</span>
                </div>
                <div className="flex items-center gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color.hex)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${color.bgClass} ${
                        selectedColor === color.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-white/5'
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      title={color.name}
                    >
                      {selectedColor === color.hex && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Picker */}
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-2">Font Family</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'sans', name: 'Modern Sans' },
                    { id: 'serif', name: 'Classic Serif' },
                    { id: 'mono', name: 'Developer Mono' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font.id)}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all text-center ${
                        selectedFont === font.id
                          ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Document PDF Canvas */}
          <div className="xl:col-span-7 flex flex-col">
            <div className={`border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 bg-slate-900/60 backdrop-blur-sm flex flex-col h-full flex-grow`}>
              {/* Document Mockup Header */}
              <div className="bg-slate-900 border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono tracking-wide">resume-preview.pdf</span>
                </div>

                {/* PDF Header Tools */}
                <div className="flex items-center gap-4">
                  {/* Zoom Controller */}
                  <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setZoomPercent(prev => Math.max(50, prev - 10))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      title="Zoom Out"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-300 min-w-[34px] text-center font-bold">
                      {zoomPercent}%
                    </span>
                    <button
                      onClick={() => setZoomPercent(prev => Math.min(150, prev + 10))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      title="Zoom In"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomPercent(100)}
                      className="px-2 py-0.5 hover:bg-slate-800 rounded text-[9px] font-bold text-slate-400 hover:text-white transition-colors border-l border-slate-800"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${pc.badge}`}>
                      {previewTmpl?.name}
                    </span>
                    <span className={`text-xs font-bold ${pc.score}`}>
                      {previewTmpl?.atsScore}% ATS
                    </span>
                  </div>
                </div>
              </div>

              {/* A4 Canvas Container */}
              <div
                ref={previewWrapRef}
                className="bg-slate-950/65 flex justify-center items-start overflow-auto p-6 relative flex-grow"
                style={{ height: '480px', minHeight: '480px' }}
              >
                {/* Scale Container wrapping the A4 Sheet to eliminate layout overflows */}
                <div
                  style={{
                    width: `${A4_W * previewScale}px`,
                    height: `${A4_H * previewScale}px`,
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <div
                    style={{
                      width: `${A4_W}px`,
                      height: `${A4_H}px`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      backgroundColor: 'white',
                      padding: '56px 64px',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
                      borderRadius: '6px',
                    }}
                  >
                    <PreviewComponent
                      data={{
                        ...MOCK_DATA,
                        themeColor: selectedColor,
                        fontFamily: selectedFont
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Continue Button */}
            <div className="mt-5 flex-shrink-0">
              <button
                onClick={handleContinue}
                className={`w-full group bg-gradient-to-r ${sc.btn} text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-base transform hover:-translate-y-0.5`}
              >
                <span>Start Customizing</span>
                <span className="hidden sm:inline"> with {selectedTmpl?.name || 'Classic Professional'}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelect;

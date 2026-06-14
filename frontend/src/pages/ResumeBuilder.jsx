import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { resumeService } from '../services/api';
import toast from 'react-hot-toast';
import {
  User, BookOpen, Briefcase, Code, Plus, Trash, Save,
  ArrowRight, ArrowLeft, FileText, Sparkles, CheckCircle,
  AlertTriangle, GripVertical, ArrowUp, ArrowDown, Lock,
  ChevronRight, Award, Globe, Layers
} from 'lucide-react';
import { calculateAtsScore, DEVELOPER_SUGGESTIONS } from '../utils/atsScorer';
import { getTemplateComponent } from '../templates/ResumeTemplates';

/* ─── Shared input class helper ─── */
const inputCls = "mt-1 block w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all duration-200";
const labelCls = "block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1";

/* ─── Animated section wrapper ─── */
const StepPanel = ({ children, direction }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t); }, []);
  return (
    <div className={`transition-all duration-400 ease-out ${visible ? 'opacity-100 translate-x-0' : direction === 'next' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8'}`}>
      {children}
    </div>
  );
};

/* ─── Steps definition ─── */
const STEPS = [
  { id: 'personal',    label: 'Contact',    icon: User,      shortLabel: '1' },
  { id: 'summary',     label: 'Summary',    icon: FileText,  shortLabel: '2' },
  { id: 'skills',      label: 'Skills',     icon: Code,      shortLabel: '3' },
  { id: 'education',   label: 'Education',  icon: BookOpen,  shortLabel: '4' },
  { id: 'experience',  label: 'Experience', icon: Briefcase, shortLabel: '5' },
  { id: 'projects',    label: 'Projects',   icon: Layers,    shortLabel: '6' },
  { id: 'additional',  label: 'Extras',     icon: Award,     shortLabel: '7' },
];

/* ─── Template name display map ─── */
const TEMPLATE_NAMES = {
  'classic':          'Classic Professional',
  'software-engineer':'Software Engineer ATS',
  'fresh-graduate':   'Fresh Graduate ATS',
  'modern-minimal':   'Modern Minimal ATS',
  'it-professional':  'IT Professional ATS',
};

const defaultSectionOrder = ['summary','skills','education','experience','projects','certifications','achievements','languages','declaration'];

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = id && id !== 'new';

  // Get template, color, and font choices from URL query params (for new resumes)
  const templateFromUrl = searchParams.get('template') || 'classic';
  const colorFromUrl = searchParams.get('color') || '#1e293b';
  const fontFromUrl = searchParams.get('font') || 'sans';

  // If this is a new resume and no template is in URL, redirect to select
  useEffect(() => {
    if (!isEdit && !searchParams.get('template')) {
      navigate('/select-template', { replace: true });
    }
  }, [isEdit, searchParams, navigate]);

  const [editorTab, setEditorTab] = useState('edit');
  const [previewScale, setPreviewScale] = useState(0.5);
  const previewWrapRef = useRef(null);

  const A4_W = 794;
  const A4_H = 1123;

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const calc = () => {
      const containerW = el.offsetWidth;
      const targetW = 794;
      const padX = 32;
      const scale = (containerW - padX) / targetW;
      setPreviewScale(Math.min(1, scale));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editorTab]);

  const [activeStep, setActiveStep] = useState(0);
  const [navDirection, setNavDirection] = useState('next');
  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [selectedRolePreset, setSelectedRolePreset] = useState('');
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const sectionLabels = {
    summary:'Professional Summary', skills:'Technical Skills', education:'Education',
    experience:'Experience', projects:'Projects', certifications:'Certifications',
    achievements:'Achievements', languages:'Languages', declaration:'Self Declaration'
  };

  // Form setup
  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: 'My Resume',
      templateId: isEdit ? 'classic' : templateFromUrl,
      fontSize: '11',
      fontFamily: isEdit ? 'sans' : fontFromUrl,
      themeColor: isEdit ? '#1e293b' : colorFromUrl,
      personalInfo: { fullName:'', email:'', phoneNumber:'', location:'', linkedinUrl:'', githubUrl:'', portfolioUrl:'' },
      summary: '',
      education: [],
      skills: { programmingLanguages:[], frontend:[], backend:[], database:[], tools:[], custom:[] },
      projects: [],
      internships: [],
      experience: [],
      certifications: [],
      achievements: [],
      languages: [],
      declaration: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief. I bear full responsibility for the accuracy of the details mentioned herein.',
    }
  });

  const formValues = watch();
  const lockedTemplate = formValues.templateId || templateFromUrl;
  const { score: atsScore, suggestions: atsSuggestions } = calculateAtsScore(formValues);

  // Field arrays
  const { fields: eduFields,    append: appendEdu,     remove: removeEdu    } = useFieldArray({ control, name: 'education' });
  const { fields: expFields,    append: appendExp,     remove: removeExp    } = useFieldArray({ control, name: 'experience' });
  const { fields: internFields, append: appendIntern,  remove: removeIntern } = useFieldArray({ control, name: 'internships' });
  const { fields: projectFields,append: appendProject, remove: removeProject} = useFieldArray({ control, name: 'projects' });
  const { fields: certFields,   append: appendCert,    remove: removeCert   } = useFieldArray({ control, name: 'certifications' });
  const { fields: achFields,    append: appendAch,     remove: removeAch    } = useFieldArray({ control, name: 'achievements' });
  const { fields: langFields,   append: appendLang,    remove: removeLang   } = useFieldArray({ control, name: 'languages' });

  // Fetch on edit
  useEffect(() => {
    if (isEdit) {
      resumeService.getById(id).then(res => {
        if (res.data.success) {
          reset(res.data.data);
          if (res.data.data.sectionOrder?.length > 0) setSectionOrder(res.data.data.sectionOrder);
        }
      }).catch(() => { toast.error('Failed to load resume'); navigate('/dashboard'); })
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit, reset, navigate]);

  // Mark step complete
  const markComplete = (idx) => setCompletedSteps(prev => new Set([...prev, idx]));

  const goNext = () => {
    markComplete(activeStep);
    setNavDirection('next');
    setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPrev = () => {
    setNavDirection('prev');
    setActiveStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToStep = (idx) => {
    setNavDirection(idx > activeStep ? 'next' : 'prev');
    setActiveStep(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Role presets
  const handleApplyPreset = (role) => {
    setSelectedRolePreset(role);
    const preset = DEVELOPER_SUGGESTIONS[role];
    if (preset) {
      setValue('summary', preset.summary);
      setValue('skills.programmingLanguages', preset.skills.slice(0, 3));
      setValue('skills.frontend',  preset.skills.filter(s => ['React.js','HTML5','CSS3','Tailwind CSS'].includes(s)));
      setValue('skills.backend',   preset.skills.filter(s => ['Node.js','Express.js','Spring Boot','Django','Flask'].includes(s)));
      setValue('skills.database',  preset.skills.filter(s => ['MongoDB','MySQL','PostgreSQL'].includes(s)));
      setValue('skills.tools',     preset.skills.filter(s => ['Git','GitHub','REST APIs','Maven'].includes(s)));
    }
  };

  // Drag reorder
  const handleDragStart = (i) => { dragItem.current = i; };
  const handleDragEnter = (i) => { setDragOverIndex(i); };
  const handleDragEnd   = () => {
    if (dragItem.current !== null && dragOverIndex !== null && dragItem.current !== dragOverIndex) {
      const newOrder = [...sectionOrder];
      const dragged = newOrder.splice(dragItem.current, 1)[0];
      newOrder.splice(dragOverIndex, 0, dragged);
      setSectionOrder(newOrder);
    }
    dragItem.current = null; setDragOverIndex(null);
  };
  const moveSection = (i, dir) => {
    const newOrder = [...sectionOrder];
    const t = i + dir;
    if (t < 0 || t >= newOrder.length) return;
    [newOrder[i], newOrder[t]] = [newOrder[t], newOrder[i]];
    setSectionOrder(newOrder);
  };

  // Submit
  const onSubmit = async (data) => {
    setSaveLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await resumeService.update(id, { ...data, sectionOrder });
      } else {
        res = await resumeService.create({ ...data, templateId: lockedTemplate, sectionOrder });
      }
      if (res.data.success) {
        const savedId = isEdit ? id : res.data.data._id;
        toast.success('Resume saved!');
        navigate(`/preview/${savedId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving resume');
    } finally {
      setSaveLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[activeStep];
  const isLastStep = activeStep === STEPS.length - 1;
  const progressPct = Math.round(((activeStep + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 resume-builder-dark-theme">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Top header bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div>
              <input
                {...register('title')}
                className="text-xl font-black text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 focus:outline-none px-1 py-0.5 transition-colors"
              />
              <p className="text-slate-500 text-xs mt-0.5 pl-1">Click to rename your resume</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Locked template badge */}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2">
              <Lock className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-300">
                {TEMPLATE_NAMES[lockedTemplate] || lockedTemplate}
              </span>
              <span className="text-[9px] text-blue-400 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded-lg font-bold uppercase">Locked</span>
            </div>

            {/* Font family */}
            <select {...register('fontFamily')} className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
              <option value="sans">System Sans</option>
              <option value="serif">System Serif</option>
              <option value="times">Times New Roman</option>
              <option value="arial">Arial</option>
              <option value="georgia">Georgia</option>
              <option value="calibri">Calibri</option>
              <option value="helvetica">Helvetica</option>
            </select>

            {/* Font size */}
            <select {...register('fontSize')} className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
              {['9','10','11','12','13','14'].map(s => (
                <option key={s} value={s}>{s}pt{s === '11' ? ' (Default)' : ''}</option>
              ))}
            </select>

            {/* Theme color */}
            <select {...register('themeColor')} className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
              <option value="#1e293b">Slate Blue</option>
              <option value="#1d4ed8">Royal Blue</option>
              <option value="#0f766e">Deep Teal</option>
              <option value="#111827">Midnight Black</option>
              <option value="#701a75">Deep Purple</option>
            </select>

            {/* Save button */}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saveLoading}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saveLoading ? 'Saving...' : 'Save & Preview'}
            </button>
          </div>
        </div>

        {/* ── Progress Stepper ── */}
        <div className="mb-8 no-print">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400">Step {activeStep + 1} of {STEPS.length}</span>
            <span className="text-xs font-bold text-blue-400">{progressPct}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
            <div
              className="h-1.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              const isDone = completedSteps.has(idx) && !isActive;
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                      : isDone
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-950'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Mobile Tab Toggle */}
        <div className="xl:hidden flex justify-center mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center">
            <button
              type="button"
              onClick={() => setEditorTab('edit')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                editorTab === 'edit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Form Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('preview')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                editorTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>

        {/* ── Main 2-column grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left: Form Panel */}
          <div className={`xl:col-span-7 ${editorTab === 'edit' ? 'block' : 'hidden xl:block'}`}>

            {/* ATS Score card (above form) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-5 flex items-center gap-5 no-print">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">ATS Score</span>
                  <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                    atsScore >= 80 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' :
                    atsScore >= 60 ? 'bg-amber-950/60 text-amber-400 border border-amber-800' :
                    'bg-rose-950/60 text-rose-400 border border-rose-800'
                  }`}>{atsScore}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
              </div>
              {atsSuggestions.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 whitespace-nowrap">
                  <CheckCircle className="h-4 w-4" /> Fully Optimized!
                </div>
              ) : (
                <div className="text-xs text-amber-400 flex items-center gap-1.5 whitespace-nowrap">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {atsSuggestions.length} suggestion{atsSuggestions.length > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* ── ATS suggestions list ── */}
            {atsSuggestions.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4 mb-5 space-y-2 no-print">
                {atsSuggestions.slice(0, 3).map((sug, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    {sug}
                  </div>
                ))}
              </div>
            )}

            {/* ── Step Form Card ── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
                {React.createElement(currentStep.icon, { className: "h-5 w-5 text-blue-400" })}
                <h2 className="text-lg font-black text-white">{currentStep.label}</h2>
                <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg font-medium">
                  {activeStep + 1} / {STEPS.length}
                </span>
              </div>

              <StepPanel key={activeStep} direction={navDirection}>

                {/* ═══════ PERSONAL INFO ═══════ */}
                {currentStep.id === 'personal' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Full Name', field: 'personalInfo.fullName', placeholder: 'Rahul Kumar', required: true },
                        { label: 'Email Address', field: 'personalInfo.email', placeholder: 'rahul@example.com', required: true, type: 'email' },
                        { label: 'Phone Number', field: 'personalInfo.phoneNumber', placeholder: '+91 98765 43210', required: true },
                        { label: 'Location', field: 'personalInfo.location', placeholder: 'New Delhi, India', required: true },
                        { label: 'LinkedIn URL', field: 'personalInfo.linkedinUrl', placeholder: 'https://linkedin.com/in/username' },
                        { label: 'GitHub URL', field: 'personalInfo.githubUrl', placeholder: 'https://github.com/username' },
                        { label: 'Portfolio Website', field: 'personalInfo.portfolioUrl', placeholder: 'https://yourportfolio.com' },
                      ].map(f => (
                        <div key={f.field} className={f.field === 'personalInfo.portfolioUrl' ? 'md:col-span-2' : ''}>
                          <label className={labelCls}>{f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}</label>
                          <input {...register(f.field, f.required ? { required: true } : {})} type={f.type || 'text'} className={inputCls} placeholder={f.placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══════ SUMMARY ═══════ */}
                {currentStep.id === 'summary' && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className={labelCls}>Professional Summary <span className="text-rose-400">*</span></label>
                        <span className="text-xs text-slate-500 font-medium">{formValues.summary?.length || 0}/400</span>
                      </div>
                      <textarea
                        {...register('summary')}
                        rows={6}
                        maxLength={400}
                        className={inputCls + ' resize-none'}
                        placeholder="Write a brief professional summary focusing on your technologies and engineering background..."
                      />
                    </div>

                    {/* Presets */}
                    <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🚀 Smart Role Presets</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(DEVELOPER_SUGGESTIONS).map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleApplyPreset(role)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              selectedRolePreset === role
                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                            }`}
                          >
                            {role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════ SKILLS ═══════ */}
                {currentStep.id === 'skills' && (
                  <div className="space-y-5">
                    <p className="text-xs text-slate-500">Enter comma-separated values (e.g. React.js, Node.js, MongoDB)</p>
                    {[
                      { label: 'Programming Languages', field: 'skills.programmingLanguages', placeholder: 'JavaScript, Python, C++, Java' },
                      { label: 'Frontend Technologies', field: 'skills.frontend', placeholder: 'React.js, Tailwind CSS, HTML5, CSS3' },
                      { label: 'Backend Technologies', field: 'skills.backend', placeholder: 'Node.js, Express.js, Spring Boot' },
                      { label: 'Databases', field: 'skills.database', placeholder: 'MongoDB, MySQL, PostgreSQL' },
                      { label: 'Developer Tools', field: 'skills.tools', placeholder: 'Git, GitHub, Docker, Postman, Linux' },
                      { label: 'Other / Libraries', field: 'skills.custom', placeholder: 'Redux, GraphQL, REST APIs, Agile' },
                    ].map(s => (
                      <div key={s.field}>
                        <label className={labelCls}>{s.label}</label>
                        <input
                          type="text"
                          defaultValue={formValues.skills?.[s.field.split('.')[1]]?.join(', ')}
                          onChange={e => setValue(s.field, e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                          className={inputCls}
                          placeholder={s.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ═══════ EDUCATION ═══════ */}
                {currentStep.id === 'education' && (
                  <div className="space-y-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => appendEdu({ degree:'', college:'', university:'', startDate:'', endDate:'', score:'', isPursuing: false })}
                        className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                      >
                        <Plus className="h-4 w-4" /> Add Education
                      </button>
                    </div>

                    {eduFields.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
                        Click "Add Education" to add your academic records
                      </div>
                    )}

                    {eduFields.map((field, idx) => (
                      <div key={field.id} className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-5 relative space-y-4">
                        <button type="button" onClick={() => removeEdu(idx)} className="absolute top-4 right-4 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 p-1.5 rounded-lg transition">
                          <Trash className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {[
                            { label:'Degree / Qualification', field:`education.${idx}.degree`, placeholder:'B.Tech Computer Science', req:true },
                            { label:'College / Institute', field:`education.${idx}.college`, placeholder:'ABC Institute of Technology', req:true },
                            { label:'University / Board', field:`education.${idx}.university`, placeholder:'State Technical University' },
                          ].map(f => (
                            <div key={f.field}>
                              <label className={labelCls}>{f.label}{f.req && <span className="text-rose-400 ml-1">*</span>}</label>
                              <input {...register(f.field, f.req ? {required:true}:{})} className={inputCls} placeholder={f.placeholder} />
                            </div>
                          ))}

                          <div className="md:col-span-2 flex items-center gap-2">
                            <input type="checkbox" id={`edu-pursuing-${idx}`} {...register(`education.${idx}.isPursuing`)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor={`edu-pursuing-${idx}`} className="text-xs font-semibold text-slate-400 select-none">Currently Pursuing</label>
                          </div>

                          {!formValues.education?.[idx]?.isPursuing && (
                            <div>
                              <label className={labelCls}>CGPA / Percentage</label>
                              <input {...register(`education.${idx}.score`)} className={inputCls} placeholder="8.9 CGPA or 85%" />
                            </div>
                          )}
                          <div>
                            <label className={labelCls}>Start Date</label>
                            <input {...register(`education.${idx}.startDate`)} className={inputCls} placeholder="July 2022" />
                          </div>
                          {!formValues.education?.[idx]?.isPursuing && (
                            <div>
                              <label className={labelCls}>End Date</label>
                              <input {...register(`education.${idx}.endDate`)} className={inputCls} placeholder="June 2026" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ═══════ EXPERIENCE ═══════ */}
                {currentStep.id === 'experience' && (
                  <div className="space-y-8">
                    {/* Internships */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Internships</h3>
                        <button type="button" onClick={() => appendIntern({ company:'', role:'', duration:'', responsibilities:[''] })} className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                          <Plus className="h-4 w-4" /> Add Internship
                        </button>
                      </div>
                      {internFields.length === 0 && <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-700 rounded-xl">Add your internship experience</div>}
                      {internFields.map((field, idx) => (
                        <div key={field.id} className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-5 relative">
                          <button type="button" onClick={() => removeIntern(idx)} className="absolute top-4 right-4 text-rose-400 hover:bg-rose-950/30 p-1.5 rounded-lg transition"><Trash className="h-4 w-4" /></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {[
                              { label:'Company Name', field:`internships.${idx}.company`, placeholder:'Google, Infosys, Startup', req:true },
                              { label:'Role / Designation', field:`internships.${idx}.role`, placeholder:'MERN Stack Intern', req:true },
                            ].map(f => (
                              <div key={f.field}>
                                <label className={labelCls}>{f.label}{f.req && <span className="text-rose-400 ml-1">*</span>}</label>
                                <input {...register(f.field, {required:true})} className={inputCls} placeholder={f.placeholder} />
                              </div>
                            ))}
                            <div className="md:col-span-2">
                              <label className={labelCls}>Duration</label>
                              <input {...register(`internships.${idx}.duration`)} className={inputCls} placeholder="June 2025 – August 2025" />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelCls}>Key Responsibilities (One per line)</label>
                              <textarea
                                defaultValue={formValues.internships?.[idx]?.responsibilities?.join('\n')}
                                onChange={e => setValue(`internships.${idx}.responsibilities`, e.target.value.split('\n').filter(Boolean))}
                                rows={3} className={inputCls + ' resize-none'}
                                placeholder={"Developed core billing engines\nHandled API integrations\nFixed 20+ bugs"}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Work Experience</h3>
                        <button type="button" onClick={() => appendExp({ company:'', position:'', duration:'', description:[''] })} className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                          <Plus className="h-4 w-4" /> Add Experience
                        </button>
                      </div>
                      {expFields.length === 0 && <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-700 rounded-xl">Add full-time work experience</div>}
                      {expFields.map((field, idx) => (
                        <div key={field.id} className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-5 relative">
                          <button type="button" onClick={() => removeExp(idx)} className="absolute top-4 right-4 text-rose-400 hover:bg-rose-950/30 p-1.5 rounded-lg transition"><Trash className="h-4 w-4" /></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {[
                              { label:'Company', field:`experience.${idx}.company`, placeholder:'Microsoft, TCS...', req:true },
                              { label:'Job Title', field:`experience.${idx}.position`, placeholder:'Backend Engineer', req:true },
                            ].map(f => (
                              <div key={f.field}>
                                <label className={labelCls}>{f.label}{f.req && <span className="text-rose-400 ml-1">*</span>}</label>
                                <input {...register(f.field, {required:true})} className={inputCls} placeholder={f.placeholder} />
                              </div>
                            ))}
                            <div className="md:col-span-2">
                              <label className={labelCls}>Duration</label>
                              <input {...register(`experience.${idx}.duration`)} className={inputCls} placeholder="Jan 2024 – Present" />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelCls}>Role Description (One per line)</label>
                              <textarea
                                defaultValue={formValues.experience?.[idx]?.description?.join('\n')}
                                onChange={e => setValue(`experience.${idx}.description`, e.target.value.split('\n').filter(Boolean))}
                                rows={3} className={inputCls + ' resize-none'}
                                placeholder={"Led a team of 5 engineers\nBuilt scalable REST APIs\nImproved performance by 40%"}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══════ PROJECTS ═══════ */}
                {currentStep.id === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button type="button" onClick={() => appendProject({ title:'', description:[''], technologies:[], githubLink:'', liveDemoLink:'' })} className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                        <Plus className="h-4 w-4" /> Add Project
                      </button>
                    </div>

                    {projectFields.length === 0 && <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">Add your best technical projects</div>}

                    {projectFields.map((field, idx) => (
                      <div key={field.id} className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-5 relative">
                        <button type="button" onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-rose-400 hover:bg-rose-950/30 p-1.5 rounded-lg transition"><Trash className="h-4 w-4" /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="md:col-span-2">
                            <label className={labelCls}>Project Title <span className="text-rose-400">*</span></label>
                            <input {...register(`projects.${idx}.title`, {required:true})} className={inputCls} placeholder="E-Commerce Dashboard" />
                          </div>
                          <div>
                            <label className={labelCls}>GitHub Link</label>
                            <input {...register(`projects.${idx}.githubLink`)} className={inputCls} placeholder="https://github.com/user/project" />
                          </div>
                          <div>
                            <label className={labelCls}>Live Demo</label>
                            <input {...register(`projects.${idx}.liveDemoLink`)} className={inputCls} placeholder="https://yourproject.com" />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelCls}>Technologies (Comma separated)</label>
                            <input
                              type="text"
                              defaultValue={formValues.projects?.[idx]?.technologies?.join(', ')}
                              onChange={e => setValue(`projects.${idx}.technologies`, e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                              className={inputCls} placeholder="React.js, Node.js, MongoDB, Express" />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelCls}>Project Bullets (One per line)</label>
                            <textarea
                              defaultValue={formValues.projects?.[idx]?.description?.join('\n')}
                              onChange={e => setValue(`projects.${idx}.description`, e.target.value.split('\n').filter(Boolean))}
                              rows={3} className={inputCls + ' resize-none'}
                              placeholder={"Built responsive UI with React.js\nReduced query time by 35%\nDeployed on AWS EC2"}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ═══════ ADDITIONAL ═══════ */}
                {currentStep.id === 'additional' && (
                  <div className="space-y-8">

                    {/* Certifications */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Certifications</h3>
                        <button type="button" onClick={() => appendCert({ name:'', organization:'', date:'' })} className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                          <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                      {certFields.map((field, idx) => (
                        <div key={field.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center bg-slate-900/30 sm:bg-transparent p-3.5 sm:p-0 rounded-xl border border-slate-800/60 sm:border-transparent relative">
                          <input {...register(`certifications.${idx}.name`, {required:true})} placeholder="AWS Cloud Practitioner" className={inputCls + ' col-span-4'} />
                          <input {...register(`certifications.${idx}.organization`, {required:true})} placeholder="Amazon Web Services" className={inputCls + ' col-span-4'} />
                          <input {...register(`certifications.${idx}.date`)} placeholder="Oct 2025" className={inputCls + ' col-span-3'} />
                          <button type="button" onClick={() => removeCert(idx)} className="col-span-1 text-rose-400 bg-rose-950/20 sm:bg-transparent hover:bg-rose-950/35 p-2 rounded-lg flex items-center justify-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                            <Trash className="h-4 w-4" />
                            <span className="sm:hidden text-xs font-semibold">Delete Credential</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Achievements */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Achievements</h3>
                        <button type="button" onClick={() => appendAch({ title:'', description:'' })} className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                          <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                      {achFields.map((field, idx) => (
                        <div key={field.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center bg-slate-900/30 sm:bg-transparent p-3.5 sm:p-0 rounded-xl border border-slate-800/60 sm:border-transparent relative">
                          <input {...register(`achievements.${idx}.title`, {required:true})} placeholder="Hackathon Winner" className={inputCls + ' col-span-4'} />
                          <input {...register(`achievements.${idx}.description`, {required:true})} placeholder="Won 1st prize out of 100 teams" className={inputCls + ' col-span-7'} />
                          <button type="button" onClick={() => removeAch(idx)} className="col-span-1 text-rose-400 bg-rose-950/20 sm:bg-transparent hover:bg-rose-950/35 p-2 rounded-lg flex items-center justify-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                            <Trash className="h-4 w-4" />
                            <span className="sm:hidden text-xs font-semibold">Delete Achievement</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Languages</h3>
                        <button type="button" onClick={() => appendLang({ language:'', proficiency:'' })} className="text-xs font-bold bg-blue-950/60 hover:bg-blue-950 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                          <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                      {langFields.map((field, idx) => (
                        <div key={field.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center bg-slate-900/30 sm:bg-transparent p-3.5 sm:p-0 rounded-xl border border-slate-800/60 sm:border-transparent relative">
                          <input {...register(`languages.${idx}.language`, {required:true})} placeholder="English" className={inputCls + ' col-span-5'} />
                          <input {...register(`languages.${idx}.proficiency`)} placeholder="Fluent / Native" className={inputCls + ' col-span-6'} />
                          <button type="button" onClick={() => removeLang(idx)} className="col-span-1 text-rose-400 bg-rose-950/20 sm:bg-transparent hover:bg-rose-950/35 p-2 rounded-lg flex items-center justify-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                            <Trash className="h-4 w-4" />
                            <span className="sm:hidden text-xs font-semibold">Delete Language</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Section Order */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white">Section Order</h3>
                      <p className="text-xs text-slate-500">Drag or use arrows to reorder how sections appear in your resume</p>
                      <div className="space-y-2">
                        {sectionOrder.map((sec, idx) => (
                          <div
                            key={sec}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragEnter={() => handleDragEnter(idx)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center justify-between bg-slate-950/60 border rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                              dragOverIndex === idx ? 'border-blue-500/60 bg-blue-950/20' : 'border-slate-700/60 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-slate-600" />
                              <span className="text-xs font-semibold text-slate-300">{sectionLabels[sec] || sec}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveSection(idx, -1)} className="text-slate-500 hover:text-slate-300 p-1 rounded transition"><ArrowUp className="h-3.5 w-3.5" /></button>
                              <button type="button" onClick={() => moveSection(idx,  1)} className="text-slate-500 hover:text-slate-300 p-1 rounded transition"><ArrowDown className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Self Declaration */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white">Self Declaration</h3>
                      <textarea {...register('declaration')} rows={3} className={inputCls + ' resize-none'}
                        placeholder="I hereby declare that all the details mentioned above are true to the best of my knowledge..."
                      />
                    </div>
                  </div>
                )}

              </StepPanel>

              {/* ── Navigation Buttons ── */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-4 justify-between items-center no-print">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={activeStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saveLoading ? 'Saving...' : 'Save & Preview'}</span>
                    <span className="hidden sm:inline"> Resume</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <span>Next</span>
                    <span className="hidden sm:inline">: {STEPS[activeStep + 1]?.label}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Preview Panel */}
          <div className={`xl:col-span-5 no-print ${editorTab === 'preview' ? 'block' : 'hidden xl:block'}`}>
            <div className="sticky top-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Preview header */}
                <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">live-preview.pdf</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      {TEMPLATE_NAMES[lockedTemplate]}
                    </span>
                  </div>
                </div>

                {/* Preview body */}
                <div 
                  ref={previewWrapRef}
                  className="bg-slate-950 p-4 overflow-auto max-h-[75vh] flex justify-center items-start"
                >
                  <div
                    style={{
                      width: `${A4_W * previewScale}px`,
                      height: `${A4_H * previewScale}px`,
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <div
                      className="resume-preview-card resume-container"
                      style={{
                        width: `${A4_W}px`,
                        height: `${A4_H}px`,
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 0,
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        padding: '56px 64px',
                      }}
                    >
                      {React.createElement(getTemplateComponent(lockedTemplate), { data: { ...formValues, templateId: lockedTemplate } })}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-600 mt-3">Live preview updates as you type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

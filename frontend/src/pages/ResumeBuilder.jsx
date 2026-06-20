import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { resumeService, atsService } from '../services/api';
import toast from 'react-hot-toast';
import {
  User, BookOpen, Briefcase, Code, Plus, Trash, Save,
  ArrowRight, ArrowLeft, FileText, Sparkles, CheckCircle,
  AlertTriangle, GripVertical, ArrowUp, ArrowDown, Lock,
  ChevronRight, Award, Globe, Layers, RefreshCw, Pencil, Eye
} from 'lucide-react';
import { getTemplateComponent } from '../templates/ResumeTemplates';

/* ─── Shared input class helper ─── */
const inputCls = "mt-1.5 block w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/70 focus:outline-none transition-all duration-300 hover:border-slate-600";
const labelCls = "block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1";

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
  const [sheetHeight, setSheetHeight] = useState(1123);
  const previewWrapRef = useRef(null);
  const sheetRef = useRef(null);

  const A4_W = 794;
  const A4_H = 1123;



  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const calc = () => {
      const parentEl = el.parentElement;
      const containerW = parentEl ? parentEl.offsetWidth : el.offsetWidth;
      const targetW = 794;
      const padX = 36; // Account for inner container padding and borders
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
  const { register, control, handleSubmit, reset, watch, setValue, getValues } = useForm({
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

  // Measure dynamic sheet height to prevent clipping
  useEffect(() => {
    if (!fetchLoading && sheetRef.current) {
      const ro = new ResizeObserver(() => {
        if (sheetRef.current) {
          const newHeight = sheetRef.current.offsetHeight || 1123;
          setSheetHeight(prev => Math.abs(prev - newHeight) > 2 ? newHeight : prev);
        }
      });
      ro.observe(sheetRef.current);
      return () => ro.disconnect();
    }
  }, [fetchLoading, formValues]);

  // AI Scoring & Suggestions States
  const [atsScore, setAtsScore] = useState(0);
  const [atsSuggestions, setAtsSuggestions] = useState({});
  const [atsCategories, setAtsCategories] = useState({ impact: 0, brevity: 0, style: 0, sections: 0 });
  const [atsMissingKeywords, setAtsMissingKeywords] = useState([]);
  const [aiScoringLoading, setAiScoringLoading] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customDetailsInput, setCustomDetailsInput] = useState('');
  const [skillsContextInput, setSkillsContextInput] = useState('');
  const [skillsAiLoading, setSkillsAiLoading] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const [presetVersion, setPresetVersion] = useState(0);
  const [experienceAiLoading, setExperienceAiLoading] = useState({ type: '', index: null });

  const getSuggestionsCount = () => {
    if (!atsSuggestions) return 0;
    if (Array.isArray(atsSuggestions)) return atsSuggestions.length;
    if (typeof atsSuggestions === 'object') {
      return Object.values(atsSuggestions).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
    }
    return 0;
  };

  const getActiveSuggestions = () => {
    if (!atsSuggestions) return [];
    
    // If it's a structured object (our primary target)
    if (typeof atsSuggestions === 'object' && !Array.isArray(atsSuggestions)) {
      return atsSuggestions[currentStep.id] || [];
    }
    
    // Fallback if it's a flat array (filter by keywords matching active step)
    if (Array.isArray(atsSuggestions)) {
      const stepKeywords = {
        personal: ['contact', 'email', 'phone', 'location', 'linkedin', 'github', 'link', 'portfolio', 'fullName', 'address'],
        summary: ['summary', 'profile', 'objective', 'overview'],
        skills: ['skill', 'technology', 'technologies', 'programming', 'languages', 'frontend', 'backend', 'database', 'tools'],
        education: ['education', 'degree', 'college', 'university', 'academic', 'cgpa', 'course', 'score'],
        experience: ['experience', 'work', 'job', 'position', 'internship', 'company', 'metric', 'action verb', 'bullet'],
        projects: ['project', 'repo', 'demo', 'live', 'code link', 'github link'],
        additional: ['certif', 'award', 'achieve', 'language', 'declaration']
      };
      
      const keywords = stepKeywords[currentStep.id] || [];
      return atsSuggestions.filter(sug => {
        const lowerSug = sug.toLowerCase();
        return keywords.some(kw => lowerSug.includes(kw));
      });
    }
    
    return [];
  };

  // Live AI scoring triggered once per section transition (activeStep change)
  useEffect(() => {
    if (fetchLoading) return;
    
    const currentValues = getValues();
    // Only trigger if there is actual content in the form (like fullName or summary)
    if (!currentValues.personalInfo?.fullName && !currentValues.summary) return;

    const runScoring = async () => {
      setAiScoringLoading(true);
      try {
        const res = await atsService.scoreBuilderResume(currentValues);
        if (res.data.success) {
          const data = res.data.data;
          setAtsScore(data.score || 0);
          setAtsSuggestions(data.feedback || []);
          setAtsCategories(data.categories || { impact: 0, brevity: 0, style: 0, sections: 0 });
          setAtsMissingKeywords(data.missingKeywords || []);
        }
      } catch (err) {
        console.error('Error fetching live AI ATS score:', err);
      } finally {
        setAiScoringLoading(false);
      }
    };

    runScoring();
  }, [activeStep, fetchLoading]);

  const handleManualAudit = async () => {
    setAiScoringLoading(true);
    const toastId = toast.loading('Running AI ATS audit...');
    try {
      const res = await atsService.scoreBuilderResume(getValues());
      if (res.data.success) {
        const data = res.data.data;
        setAtsScore(data.score || 0);
        setAtsSuggestions(data.feedback || []);
        setAtsCategories(data.categories || { impact: 0, brevity: 0, style: 0, sections: 0 });
        setAtsMissingKeywords(data.missingKeywords || []);
        toast.success('AI Audit completed!', { id: toastId });
      }
    } catch (err) {
      console.error('Error in manual AI ATS audit:', err);
      toast.error('AI Audit failed. Please try again.', { id: toastId });
    } finally {
      setAiScoringLoading(false);
    }
  };

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

  // AI Dynamic Preset Generator
  const handleGeneratePreset = async (roleName) => {
    const targetRole = roleName || customRoleInput;
    if (!targetRole || !targetRole.trim()) {
      toast.error('Please enter or select a job role first!');
      return;
    }
    
    setCustomRoleInput(targetRole);
    setPresetLoading(true);
    const toastId = toast.loading(`Generating AI preset content for "${targetRole}"...`);
    
    try {
      const res = await atsService.generateRolePreset(targetRole, customDetailsInput);
      if (res.data.success) {
        const { summary, skills } = res.data.data;
        
        if (summary) setValue('summary', summary);
        if (skills) {
          setValue('skills.programmingLanguages', skills.programmingLanguages || []);
          setValue('skills.frontend', skills.frontend || []);
          setValue('skills.backend', skills.backend || []);
          setValue('skills.database', skills.database || []);
          setValue('skills.tools', skills.tools || []);
          setValue('skills.custom', skills.custom || []);
        }
        
        // Force remount of skills input elements to read new defaultValues
        setPresetVersion(v => v + 1);
        
        toast.success(`AI content generated and applied for ${targetRole}!`, { id: toastId });

        // Immediately run an audit to show the updated score
        try {
          const scoreRes = await atsService.scoreBuilderResume(getValues());
          if (scoreRes.data.success) {
            const data = scoreRes.data.data;
            setAtsScore(data.score || 0);
            setAtsSuggestions(data.feedback || []);
            setAtsCategories(data.categories || { impact: 0, brevity: 0, style: 0, sections: 0 });
            setAtsMissingKeywords(data.missingKeywords || []);
          }
        } catch (scoreErr) {
          console.error('Error running audit after preset generation:', scoreErr);
        }
      }
    } catch (err) {
      console.error('Preset generation error:', err);
      toast.error('Failed to generate AI preset. Please try again.', { id: toastId });
    } finally {
      setPresetLoading(false);
    }
  };

  // AI Dynamic Skills Generator
  const handleGenerateSkills = async () => {
    if (!skillsContextInput || !skillsContextInput.trim()) {
      toast.error('Please enter some context or technology focus first!');
      return;
    }
    
    setSkillsAiLoading(true);
    const toastId = toast.loading('Generating targeted skills matrix...');
    
    try {
      const currentSkills = getValues('skills');
      const res = await atsService.generateSkills(skillsContextInput, currentSkills);
      if (res.data.success) {
        const skills = res.data.data;
        if (skills) {
          setValue('skills.programmingLanguages', skills.programmingLanguages || []);
          setValue('skills.frontend', skills.frontend || []);
          setValue('skills.backend', skills.backend || []);
          setValue('skills.database', skills.database || []);
          setValue('skills.tools', skills.tools || []);
          setValue('skills.custom', skills.custom || []);
        }
        
        // Force remount of skills input elements to read new defaultValues
        setPresetVersion(v => v + 1);
        
        toast.success('AI technical skills matrix generated and applied!', { id: toastId });
        
        // Immediately run an audit to update score
        try {
          const scoreRes = await atsService.scoreBuilderResume(getValues());
          if (scoreRes.data.success) {
            const data = scoreRes.data.data;
            setAtsScore(data.score || 0);
            setAtsSuggestions(data.feedback || []);
            setAtsCategories(data.categories || { impact: 0, brevity: 0, style: 0, sections: 0 });
            setAtsMissingKeywords(data.missingKeywords || []);
          }
        } catch (scoreErr) {
          console.error('Error running audit after skills generation:', scoreErr);
        }
      }
    } catch (err) {
      console.error('Skills generation error:', err);
      toast.error('Failed to generate technical skills. Please try again.', { id: toastId });
    } finally {
      setSkillsAiLoading(false);
    }
  };

  // AI Experience Bullets Generator
  const handleGenerateBullets = async (type, index) => {
    let role = '';
    let company = '';
    let extra = {};
    
    if (type === 'projects') {
      const title = getValues(`projects.${index}.title`);
      const technologies = getValues(`projects.${index}.technologies`);
      role = title;
      company = Array.isArray(technologies) ? technologies.join(', ') : (technologies || '');
      extra = { type: 'project', title, technologies: company };
    } else {
      const roleField = type === 'internships' ? `internships.${index}.role` : `experience.${index}.position`;
      const companyField = type === 'internships' ? `internships.${index}.company` : `experience.${index}.company`;
      role = getValues(roleField);
      company = getValues(companyField);
      extra = { type: 'experience' };
    }
    
    const promptElement = document.getElementById(`ai-${type}-prompt-${index}`);
    const context = promptElement?.value;

    if (!context || !context.trim()) {
      toast.error('Please enter a quick description of what you did first!');
      return;
    }

    setExperienceAiLoading({ type, index });
    const toastId = toast.loading('Generating professional bullets with AI...');

    try {
      const res = await atsService.generateExperienceBullets(role, company, context, extra.type, extra);
      if (res.data.success) {
        const { bullets } = res.data.data;
        if (bullets && Array.isArray(bullets)) {
          let textareaField = '';
          if (type === 'projects') {
            textareaField = `projects.${index}.description`;
          } else {
            textareaField = type === 'internships' ? `internships.${index}.responsibilities` : `experience.${index}.description`;
          }
          
          setValue(textareaField, bullets);
          
          if (promptElement) promptElement.value = '';
          setPresetVersion(v => v + 1);
          toast.success('Professional bullets applied successfully!', { id: toastId });
          
          // Immediately trigger scoring audit
          try {
            const scoreRes = await atsService.scoreBuilderResume(getValues());
            if (scoreRes.data.success) {
              const data = scoreRes.data.data;
              setAtsScore(data.score || 0);
              setAtsSuggestions(data.feedback || []);
              setAtsCategories(data.categories || { impact: 0, brevity: 0, style: 0, sections: 0 });
              setAtsMissingKeywords(data.missingKeywords || []);
            }
          } catch (scoreErr) {
            console.error('Error running audit after bullets generation:', scoreErr);
          }
        }
      }
    } catch (err) {
      console.error('Bullets generation error:', err);
      toast.error('Failed to generate professional bullets. Please try again.', { id: toastId });
    } finally {
      setExperienceAiLoading({ type: '', index: null });
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
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6">
          {/* Row 1: Title + Save */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-grow min-w-0">
              <input
                {...register('title')}
                className="text-lg sm:text-xl font-black text-white bg-transparent border-b-2 border-transparent hover:border-slate-600 focus:border-blue-500 focus:outline-none px-1 py-0.5 transition-colors w-full truncate"
              />
              <p className="text-slate-500 text-[10px] mt-1 pl-1 font-medium">Tap to rename</p>
            </div>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saveLoading}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 shrink-0"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{saveLoading ? 'Saving...' : 'Save & Preview'}</span>
              <span className="sm:hidden">{saveLoading ? '...' : 'Save'}</span>
            </button>
          </div>

          {/* Row 2: Settings chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Locked template badge */}
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <Lock className="h-3 w-3 text-blue-400 flex-shrink-0" />
              <span className="text-[10px] font-bold text-slate-300 hidden sm:inline">
                {TEMPLATE_NAMES[lockedTemplate] || lockedTemplate}
              </span>
              <span className="text-[10px] font-bold text-slate-300 sm:hidden">Template</span>
              <span className="text-[8px] text-blue-400 bg-blue-950/80 border border-blue-800/50 px-1.5 py-0.5 rounded font-bold uppercase">Locked</span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-slate-700/60" />

            {/* Font family */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase hidden sm:inline">Font</span>
              <select {...register('fontFamily')} className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer pr-4">
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="times">Times</option>
                <option value="arial">Arial</option>
                <option value="georgia">Georgia</option>
                <option value="calibri">Calibri</option>
                <option value="helvetica">Helvetica</option>
              </select>
            </div>

            {/* Font size */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase hidden sm:inline">Size</span>
              <select {...register('fontSize')} className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer pr-4">
                {['9','10','11','12','13','14'].map(s => (
                  <option key={s} value={s}>{s}pt{s === '11' ? ' ✓' : ''}</option>
                ))}
              </select>
            </div>

            {/* Theme color */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase hidden sm:inline">Color</span>
              <select {...register('themeColor')} className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer pr-4">
                <option value="#1e293b">Slate</option>
                <option value="#1d4ed8">Royal Blue</option>
                <option value="#0f766e">Teal</option>
                <option value="#111827">Midnight</option>
                <option value="#701a75">Purple</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Progress Stepper ── */}
        <div className="mb-6 no-print">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400">Step {activeStep + 1} of {STEPS.length}</span>
            <span className="text-[11px] font-bold text-blue-400">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-5">
            <div
              className="h-1.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2 scroll-x-mobile">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              const isDone = completedSteps.has(idx) && !isActive;
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30'
                      : isDone
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300 hover:border-slate-600'
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
        <div className="xl:hidden flex justify-center mb-5">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-1 flex items-center w-full max-w-xs">
            <button
              type="button"
              onClick={() => setEditorTab('edit')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                editorTab === 'edit'
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pencil className="h-3.5 w-3.5" /> Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('preview')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                editorTab === 'preview'
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>
        </div>

        {/* ── Main 2-column grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left: Form Panel */}
          <div className={`xl:col-span-7 ${editorTab === 'edit' ? 'block' : 'hidden xl:block'}`}>

            {/* ATS Score card (above form) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-5 no-print">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      {aiScoringLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                          Auditing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                          AI ATS Score
                        </>
                      )}
                    </span>
                    <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                      atsScore >= 80 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' :
                      atsScore >= 60 ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' :
                      'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    }`}>{atsScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${
                        atsScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : atsScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                      }`}
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                  {aiScoringLoading ? (
                    <span className="text-[10px] text-slate-500 font-medium">Scanning...</span>
                  ) : getSuggestionsCount() === 0 ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 whitespace-nowrap font-bold">
                      <CheckCircle className="h-3.5 w-3.5" /> Optimized
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-400 flex items-center gap-1.5 whitespace-nowrap font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                      {getSuggestionsCount()} tip{getSuggestionsCount() > 1 ? 's' : ''}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleManualAudit}
                    disabled={aiScoringLoading}
                    className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 hover:bg-slate-750"
                  >
                    <RefreshCw className={`h-3 w-3 ${aiScoringLoading ? 'animate-spin' : ''}`} />
                    Rescan
                  </button>
                </div>
              </div>
            </div>

            {/* ── ATS suggestions list (Section-Wise) ── */}
            {getActiveSuggestions().length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 mb-5 space-y-3 no-print">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Optimization Feedback for {currentStep.label}
                </span>
                <div className="space-y-2">
                  {getActiveSuggestions().map((sug, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ATS missing keywords ── */}
            {atsMissingKeywords.length > 0 && (
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-2xl p-5 mb-5 no-print">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  Keywords to Add (Recommended)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atsMissingKeywords.map((kw, i) => (
                    <span key={i} className="bg-blue-950 border border-blue-800/50 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step Form Card ── */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-5 sm:p-7">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-800/30 flex items-center justify-center">
                  {React.createElement(currentStep.icon, { className: "h-4.5 w-4.5 text-blue-400" })}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight">{currentStep.label}</h2>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Step {activeStep + 1} of {STEPS.length}</p>
                </div>
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

                    {/* AI Custom Preset Generator */}
                    <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-5">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        AI Role Preset Generator
                      </p>
                      <p className="text-[11px] text-slate-400 mb-4">
                        Type any target job role to dynamically generate an optimized Professional Summary and Skills matrix using AI.
                      </p>
                      
                      <div className="space-y-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Job Role</label>
                          <input
                            type="text"
                            value={customRoleInput}
                            onChange={e => setCustomRoleInput(e.target.value)}
                            placeholder="e.g. Cloud Architect, React Developer, DevOps Specialist..."
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={presetLoading}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleGeneratePreset();
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Custom Context / Details (Optional)</label>
                          <textarea
                            value={customDetailsInput}
                            onChange={e => setCustomDetailsInput(e.target.value)}
                            placeholder="e.g., 2+ years React experience, built a Hospital Management System, passionate about optimization..."
                            rows={2}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            disabled={presetLoading}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGeneratePreset()}
                          disabled={presetLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-blue-500/10 transition-all duration-200"
                        >
                          {presetLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {presetLoading ? 'Generating Custom Preset...' : 'Generate Preset with AI'}
                        </button>
                      </div>

                      {/* Quick suggestions list */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Or Choose a Standard Role</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'MERN Stack Developer',
                            'Java Developer',
                            'Python Developer',
                            'Frontend Engineer',
                            'Backend Engineer',
                            'DevOps Engineer',
                            'Data Scientist',
                            'Full Stack Developer'
                          ].map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleGeneratePreset(role)}
                              disabled={presetLoading}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-semibold rounded-lg transition"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════ SKILLS ═══════ */}
                {currentStep.id === 'skills' && (
                  <div className="space-y-6">
                    {/* AI Custom Skills Optimizer */}
                    <div className="bg-slate-955/40 border border-slate-800 rounded-xl p-5 mb-4 backdrop-blur-sm">
                      <p className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                        AI Skills Optimizer & Improver
                      </p>
                      <p className="text-[11px] text-slate-450 mb-4 leading-relaxed">
                        Provide a custom prompt (e.g. your targeted stack, role, or specific requirements) to automatically generate, structure, and refine your technical skills. Any existing skills will be merged and optimized.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <textarea
                            value={skillsContextInput}
                            onChange={e => setSkillsContextInput(e.target.value)}
                            placeholder="e.g., I want to focus on microservices, add Docker/Kubernetes, and align with a senior backend profile..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                            disabled={skillsAiLoading}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateSkills}
                          disabled={skillsAiLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-blue-500/10 transition-all duration-200"
                        >
                          {skillsAiLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {skillsAiLoading ? 'Optimizing Skills...' : 'Generate & Optimize Skills with AI'}
                        </button>
                      </div>

                      {/* Quick suggestions */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Try these quick prompt templates:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Optimize for a Senior React Engineer role',
                            'Add modern Data Science and Machine Learning libraries',
                            'Include cloud architecture, AWS services, and DevOps tools',
                            'Focus on backend microservices with Go and gRPC'
                          ].map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setSkillsContextInput(suggestion)}
                              disabled={skillsAiLoading}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-slate-200 text-[10px] font-semibold rounded-lg transition text-left"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 border-t border-slate-800/80 pt-4">Enter comma-separated values (e.g. React.js, Node.js, MongoDB)</p>
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
                          key={`${s.field}-${presetVersion}`}
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
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">Add your academic qualifications</p>
                      <button
                        type="button"
                        onClick={() => appendEdu({ degree:'', college:'', university:'', startDate:'', endDate:'', expectedGraduation:'', score:'', isPursuing: false })}
                        className="text-xs font-bold bg-blue-950/60 hover:bg-blue-900/40 border border-blue-800/60 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                      >
                        <Plus className="h-4 w-4" /> Add Education
                      </button>
                    </div>

                    {eduFields.length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                        <BookOpen className="h-8 w-8 mx-auto mb-3 text-slate-700" />
                        <p className="font-semibold text-slate-400">No education added yet</p>
                        <p className="text-xs text-slate-600 mt-1">Click "Add Education" to begin</p>
                      </div>
                    )}

                    {eduFields.map((field, idx) => (
                      <div key={field.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center justify-between px-5 py-3 bg-slate-900/50 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-xs font-bold text-slate-300">Education #{idx + 1}</span>
                          </div>
                          <button type="button" onClick={() => removeEdu(idx)} className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 p-1.5 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1">
                            <Trash className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                        {/* Card body */}
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {formValues.education?.[idx]?.isPursuing ? (
                            <div>
                              <label className={labelCls}>Expected Graduation Date</label>
                              <input {...register(`education.${idx}.expectedGraduation`)} className={inputCls} placeholder="June 2026" />
                            </div>
                          ) : (
                            <div>
                              <label className={labelCls}>End Date</label>
                              <input {...register(`education.${idx}.endDate`)} className={inputCls} placeholder="June 2026" />
                            </div>
                          )}
                          </div>
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
                                key={`intern-resp-${idx}-${presetVersion}`}
                                defaultValue={formValues.internships?.[idx]?.responsibilities?.join('\n')}
                                onChange={e => setValue(`internships.${idx}.responsibilities`, e.target.value.split('\n').filter(Boolean))}
                                rows={3} className={inputCls + ' resize-none'}
                                placeholder={"Developed core billing engines\nHandled API integrations\nFixed 20+ bugs"}
                              />

                              {/* AI Experience Bullets Generator */}
                              <div className="mt-3 bg-slate-950/40 border border-slate-800 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                                  <span className="text-[10px] font-bold text-slate-355 uppercase tracking-wider">AI Experience Bullet Generator</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input 
                                    type="text" 
                                    id={`ai-internships-prompt-${idx}`}
                                    placeholder="Describe what you did (e.g. built a React Native reseller app, fixed interface bugs)..."
                                    className="flex-grow px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-505 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={experienceAiLoading.type === 'internships' && experienceAiLoading.index === idx}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleGenerateBullets('internships', idx);
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateBullets('internships', idx)}
                                    disabled={experienceAiLoading.type === 'internships' && experienceAiLoading.index === idx}
                                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-550 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shrink-0 w-full sm:w-auto"
                                  >
                                    {experienceAiLoading.type === 'internships' && experienceAiLoading.index === idx ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-3 w-3" />
                                    )}
                                    Generate
                                  </button>
                                </div>
                              </div>
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
                                key={`exp-desc-${idx}-${presetVersion}`}
                                defaultValue={formValues.experience?.[idx]?.description?.join('\n')}
                                onChange={e => setValue(`experience.${idx}.description`, e.target.value.split('\n').filter(Boolean))}
                                rows={3} className={inputCls + ' resize-none'}
                                placeholder={"Led a team of 5 engineers\nBuilt scalable REST APIs\nImproved performance by 40%"}
                              />

                              {/* AI Experience Bullets Generator */}
                              <div className="mt-3 bg-slate-955/40 border border-slate-800 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                                  <span className="text-[10px] font-bold text-slate-355 uppercase tracking-wider">AI Experience Bullet Generator</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input 
                                    type="text" 
                                    id={`ai-experience-prompt-${idx}`}
                                    placeholder="Describe what you did (e.g. designed scalable billing microservices, led 3 developers)..."
                                    className="flex-grow px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-505 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={experienceAiLoading.type === 'experience' && experienceAiLoading.index === idx}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleGenerateBullets('experience', idx);
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateBullets('experience', idx)}
                                    disabled={experienceAiLoading.type === 'experience' && experienceAiLoading.index === idx}
                                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-555 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shrink-0 w-full sm:w-auto"
                                  >
                                    {experienceAiLoading.type === 'experience' && experienceAiLoading.index === idx ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-3 w-3" />
                                    )}
                                    Generate
                                  </button>
                                </div>
                              </div>
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
                              key={`proj-desc-${idx}-${presetVersion}`}
                              defaultValue={formValues.projects?.[idx]?.description?.join('\n')}
                              onChange={e => setValue(`projects.${idx}.description`, e.target.value.split('\n').filter(Boolean))}
                              rows={3} className={inputCls + ' resize-none'}
                              placeholder={"Built responsive UI with React.js\nReduced query time by 35%\nDeployed on AWS EC2"}
                            />

                            {/* AI Experience Bullets Generator */}
                            <div className="mt-3 bg-slate-950/40 border border-slate-800 rounded-xl p-3 backdrop-blur-sm">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-355 uppercase tracking-wider">AI Project Bullet Generator</span>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                  type="text" 
                                  id={`ai-projects-prompt-${idx}`}
                                  placeholder="Describe your project (e.g. built a live bidding chat system with WebRTC and Socket.io)..."
                                  className="flex-grow px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-505 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  disabled={experienceAiLoading.type === 'projects' && experienceAiLoading.index === idx}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleGenerateBullets('projects', idx);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleGenerateBullets('projects', idx)}
                                  disabled={experienceAiLoading.type === 'projects' && experienceAiLoading.index === idx}
                                  className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-550 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shrink-0 w-full sm:w-auto"
                                >
                                  {experienceAiLoading.type === 'projects' && experienceAiLoading.index === idx ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3 w-3" />
                                  )}
                                  Generate
                                </button>
                              </div>
                            </div>
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
                  className="bg-slate-950 p-4 pb-32 overflow-auto max-h-[75vh] flex justify-center items-start w-full"
                >
                  <div
                    style={{
                      width: `${A4_W * previewScale}px`,
                      height: `${sheetHeight * previewScale}px`,
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <div
                      ref={sheetRef}
                      className="resume-preview-sheet"
                      style={{
                        width: `${A4_W}px`,
                        minHeight: `${A4_H}px`,
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { resumeService } from '../services/api';
import toast from 'react-hot-toast';
import {
  User, BookOpen, Briefcase, Code, Plus, Trash, Save,
  ArrowRight, FileText, Sparkles, ChevronRight, CheckCircle, AlertTriangle,
  GripVertical, ArrowUp, ArrowDown
} from 'lucide-react';
import { calculateAtsScore, DEVELOPER_SUGGESTIONS } from '../utils/atsScorer';
import { getTemplateComponent } from '../templates/ResumeTemplates';


const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [activeTab, setActiveTab] = useState('personal');
  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [selectedRolePreset, setSelectedRolePreset] = useState('');

  // Section ordering
  const defaultSectionOrder = ['summary', 'skills', 'education', 'experience', 'projects', 'certifications', 'achievements', 'languages', 'declaration'];
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = React.useRef(null);

  const sectionLabels = {
    summary: 'Professional Summary', skills: 'Technical Skills', education: 'Education',
    experience: 'Experience', projects: 'Projects', certifications: 'Certifications',
    achievements: 'Achievements', languages: 'Languages', declaration: 'Self Declaration'
  };

  const moveSection = (index, dir) => {
    const newOrder = [...sectionOrder];
    const target = index + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const handleDragStart = (index) => { dragItem.current = index; };
  const handleDragEnter = (index) => { setDragOverIndex(index); };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverIndex !== null && dragItem.current !== dragOverIndex) {
      const newOrder = [...sectionOrder];
      const dragged = newOrder.splice(dragItem.current, 1)[0];
      newOrder.splice(dragOverIndex, 0, dragged);
      setSectionOrder(newOrder);
    }
    dragItem.current = null;
    setDragOverIndex(null);
  };

  // Setup form
  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: 'My Software Resume',
      templateId: 'classic',
      fontSize: 'medium',
      fontFamily: 'sans',
      themeColor: '#1e293b',
      personalInfo: { fullName: '', email: '', phoneNumber: '', location: '', linkedinUrl: '', githubUrl: '', portfolioUrl: '' },
      summary: '',
      education: [],
      skills: { programmingLanguages: [], frontend: [], backend: [], database: [], tools: [], custom: [] },
      projects: [],
      internships: [],
      experience: [],
      certifications: [],
      achievements: [],
      languages: [],
      declaration: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief. I bear full responsibility for the accuracy of the details mentioned herein.',
    }
  });


  // Watch form values to calculate live ATS score & suggestions
  const formValues = watch();
  const { score: atsScore, suggestions: atsSuggestions } = calculateAtsScore(formValues);

  // Field arrays for education, experience, internships, projects, certifications, achievements, languages
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: internFields, append: appendIntern, remove: removeIntern } = useFieldArray({ control, name: 'internships' });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: 'projects' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' });
  const { fields: achFields, append: appendAch, remove: removeAch } = useFieldArray({ control, name: 'achievements' });
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control, name: 'languages' });

  // Fetch resume if editing
  useEffect(() => {
    if (isEdit) {
      const fetchResume = async () => {
        try {
          const res = await resumeService.getById(id);
          if (res.data.success) {
            reset(res.data.data);
          }
        } catch (err) {
          toast.error('Failed to load resume data');
          navigate('/dashboard');
        } finally {
          setFetchLoading(false);
        }
      };
      fetchResume();
    }
  }, [id, isEdit, reset, navigate]);

  // Sync sectionOrder when editing existing resume
  useEffect(() => {
    if (isEdit) {
      resumeService.getById(id).then(res => {
        if (res.data.success && res.data.data.sectionOrder?.length > 0) {
          setSectionOrder(res.data.data.sectionOrder);
        }
      }).catch(() => {});
    }
  }, [id, isEdit]);

  // Apply profile suggestions (MERN, Java, Python)
  const handleApplyPreset = (role) => {
    setSelectedRolePreset(role);
    const preset = DEVELOPER_SUGGESTIONS[role];
    if (preset) {
      setValue('summary', preset.summary);
      setValue('skills.programmingLanguages', preset.skills.slice(0, 3));
      setValue('skills.frontend', preset.skills.filter(s => ['React.js', 'HTML5', 'CSS3', 'Tailwind CSS'].includes(s)));
      setValue('skills.backend', preset.skills.filter(s => ['Node.js', 'Express.js', 'Spring Boot', 'Django', 'Flask'].includes(s)));
      setValue('skills.database', preset.skills.filter(s => ['MongoDB', 'MySQL', 'PostgreSQL'].includes(s)));
      setValue('skills.tools', preset.skills.filter(s => ['Git', 'GitHub', 'REST APIs', 'Maven'].includes(s)));
    }
  };

  // Submit Handler
  const onSubmit = async (data) => {
    setSaveLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await resumeService.update(id, { ...data, sectionOrder });
      } else {
        res = await resumeService.create({ ...data, sectionOrder });
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading resume details...
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Contact', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'additional', label: 'Others', icon: Sparkles }
  ];

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <input
              {...register('title')}
              className="text-xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5"
            />
          </div>
          <p className="text-slate-500 text-xs mt-1">Click the name above to rename this resume</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template */}
          <select
            {...register('templateId')}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Choose Template Layout"
          >
            <option value="classic">Classic Professional</option>
            <option value="software-engineer">Software Engineer ATS</option>
            <option value="fresh-graduate">Fresh Graduate ATS</option>
            <option value="modern-minimal">Modern Minimal ATS</option>
            <option value="it-professional">IT Professional ATS</option>
          </select>

          {/* Font Family */}
          <select
            {...register('fontFamily')}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Font Family"
          >
            <option value="sans">System Sans-Serif</option>
            <option value="serif">System Serif</option>
            <option value="mono">System Monospace</option>
            <option value="times">Times New Roman</option>
            <option value="arial">Arial</option>
            <option value="georgia">Georgia</option>
            <option value="garamond">Garamond</option>
            <option value="courier">Courier New</option>
            <option value="helvetica">Helvetica</option>
            <option value="calibri">Calibri</option>
          </select>

          {/* Font Size */}
          <select
            {...register('fontSize')}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Font Size"
          >
            <option value="9">9pt</option>
            <option value="10">10pt</option>
            <option value="11">11pt (Default)</option>
            <option value="12">12pt</option>
            <option value="13">13pt</option>
            <option value="14">14pt</option>
            <option value="15">15pt</option>
            <option value="16">16pt</option>
          </select>

          {/* Theme Color */}
          <select
            {...register('themeColor')}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Theme Accent Color"
          >
            <option value="#1e293b">Slate Blue (Dark)</option>
            <option value="#1d4ed8">Royal Blue (Developer)</option>
            <option value="#0f766e">Deep Teal (Creative)</option>
            <option value="#111827">Midnight Black (ATS Standard)</option>
            <option value="#701a75">Deep Purple (Modern)</option>
          </select>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saveLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-55"
          >
            <Save className="h-4 w-4" />
            {saveLoading ? 'Saving...' : 'Save Resume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar tabs */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-2 no-print">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Resume Sections</h3>
            </div>
            <nav className="divide-y divide-slate-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold transition text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Live Score Checker */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-bold text-slate-900 text-sm">ATS Score</span>
              <span className={`text-base font-black px-2 py-0.5 rounded ${
                atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                atsScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {atsScore}/100
              </span>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    atsScore >= 80 ? 'bg-emerald-500' :
                    atsScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>

              {atsSuggestions.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded border border-emerald-100">
                  <CheckCircle className="h-4 w-4" />
                  <span>Resume fully ATS optimized!</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
                  {atsSuggestions.map((sug, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab contents forms */}
        <div className="lg:col-span-9 xl:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Personal & Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Full Name</label>
                  <input
                    {...register('personalInfo.fullName', { required: true })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Rahul Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
                  <input
                    {...register('personalInfo.email', { required: true })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="rahul@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Phone Number</label>
                  <input
                    {...register('personalInfo.phoneNumber', { required: true })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Location</label>
                  <input
                    {...register('personalInfo.location', { required: true })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="New Delhi, India"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">LinkedIn URL</label>
                  <input
                    {...register('personalInfo.linkedinUrl')}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">GitHub URL</label>
                  <input
                    {...register('personalInfo.githubUrl')}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Portfolio Website URL</label>
                  <input
                    {...register('personalInfo.portfolioUrl')}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="https://portfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Professional Summary</h3>
                <span className="text-xs text-slate-500">Character count: {formValues.summary?.length || 0}/400</span>
              </div>

              {/* Developer Presets */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Smart Preset Tools:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('mern')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'mern'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    MERN Stack Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('java')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'java'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Java Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('python')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'python'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Python / Django Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('software_developer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'software_developer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Software Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('frontend_engineer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'frontend_engineer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Frontend Engineer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('backend_engineer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'backend_engineer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Backend Engineer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('devops_engineer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'devops_engineer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    DevOps Engineer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('data_scientist')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'data_scientist'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Data Scientist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('web_developer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'web_developer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Web Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('fullstack_developer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedRolePreset === 'fullstack_developer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Full Stack Developer
                  </button>
                </div>
              </div>

              <div>
                <textarea
                  {...register('summary')}
                  rows={6}
                  maxLength={400}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Write a brief professional summary focusing on your technologies and engineering background..."
                />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Technical Skills Matrix</h3>
              <p className="text-xs text-slate-500 -mt-3">Comma separated list (e.g. JavaScript, Python, C++)</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Programming Languages</label>
                  <input
                    type="text"
                    defaultValue={formValues.skills?.programmingLanguages?.join(', ')}
                    onChange={(e) => setValue('skills.programmingLanguages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="JavaScript, Python, C++, Java"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Frontend Technologies</label>
                  <input
                    type="text"
                    defaultValue={formValues.skills?.frontend?.join(', ')}
                    onChange={(e) => setValue('skills.frontend', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="React, Tailwind CSS, HTML5, CSS3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Backend Tech</label>
                  <input
                    type="text"
                    defaultValue={formValues.skills?.backend?.join(', ')}
                    onChange={(e) => setValue('skills.backend', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Node.js, Express.js, Spring Boot"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Databases</label>
                  <input
                    type="text"
                    defaultValue={formValues.skills?.database?.join(', ')}
                    onChange={(e) => setValue('skills.database', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MongoDB, MySQL, PostgreSQL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Developer Tools</label>
                  <input
                    type="text"
                    defaultValue={formValues.skills?.tools?.join(', ')}
                    onChange={(e) => setValue('skills.tools', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Git, GitHub, Docker, Postman"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Education Background</h3>
                <button
                  type="button"
                  onClick={() => appendEdu({ degree: '', college: '', university: '', startDate: '', endDate: '', score: '' })}
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="h-4 w-4" /> Add Education
                </button>
              </div>

              {eduFields.map((field, idx) => (
                <div key={field.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                  <button
                    type="button"
                    onClick={() => removeEdu(idx)}
                    className="absolute top-4 right-4 text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition"
                    title="Remove"
                  >
                    <Trash className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Degree / Qualification</label>
                      <input
                        {...register(`education.${idx}.degree`, { required: true })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        placeholder="B.Tech Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">College / Institute</label>
                      <input
                        {...register(`education.${idx}.college`, { required: true })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        placeholder="ABC Institute of Technology"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">University / Board</label>
                      <input
                        {...register(`education.${idx}.university`)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        placeholder="State Technical University"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id={`education-${idx}-pursuing`}
                        {...register(`education.${idx}.isPursuing`)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`education-${idx}-pursuing`} className="text-xs font-semibold text-slate-700 select-none">
                        Currently Pursuing this Degree
                      </label>
                    </div>
                    {!formValues.education?.[idx]?.isPursuing && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">CGPA / Percentage</label>
                        <input
                          {...register(`education.${idx}.score`)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                          placeholder="8.9 CGPA or 85%"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Start Date</label>
                      <input
                        {...register(`education.${idx}.startDate`)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        placeholder="July 2022"
                      />
                    </div>
                    {!formValues.education?.[idx]?.isPursuing && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">End Date</label>
                        <input
                          {...register(`education.${idx}.endDate`)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                          placeholder="June 2026 (or Expected)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-8">
              {/* Internships */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Internship Roles</h3>
                  <button
                    type="button"
                    onClick={() => appendIntern({ company: '', role: '', duration: '', responsibilities: [''] })}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="h-4 w-4" /> Add Internship
                  </button>
                </div>

                {internFields.map((field, idx) => (
                  <div key={field.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      type="button"
                      onClick={() => removeIntern(idx)}
                      className="absolute top-4 right-4 text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition"
                    >
                      <Trash className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">Company Name</label>
                        <input
                          {...register(`internships.${idx}.company`, { required: true })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                          placeholder="Google, Infosys, Startup"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">Role / Designation</label>
                        <input
                          {...register(`internships.${idx}.role`, { required: true })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                          placeholder="MERN Stack Intern"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500">Duration (e.g. June 2025 - August 2025)</label>
                        <input
                          {...register(`internships.${idx}.duration`)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                          placeholder="3 Months (Summer 2025)"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500">Key Responsibilities (Comma separated bullets)</label>
                        <textarea
                          defaultValue={formValues.internships?.[idx]?.responsibilities?.join('\n')}
                          onChange={(e) => setValue(`internships.${idx}.responsibilities`, e.target.value.split('\n').filter(Boolean))}
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                          placeholder="Developed core billing engines&#10;Handled API integrations&#10;Fixed 20+ interface bugs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Work Experience */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Other Work History</h3>
                  <button
                    type="button"
                    onClick={() => appendExp({ company: '', position: '', duration: '', description: [''] })}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="h-4 w-4" /> Add Experience
                  </button>
                </div>

                {expFields.map((field, idx) => (
                  <div key={field.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                    <button
                      type="button"
                      onClick={() => removeExp(idx)}
                      className="absolute top-4 right-4 text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition"
                    >
                      <Trash className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">Company / Organization</label>
                        <input
                          {...register(`experience.${idx}.company`, { required: true })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">Job Title</label>
                        <input
                          {...register(`experience.${idx}.position`, { required: true })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500">Duration</label>
                        <input
                          {...register(`experience.${idx}.duration`)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500">Role description (Line separated bullet points)</label>
                        <textarea
                          defaultValue={formValues.experience?.[idx]?.description?.join('\n')}
                          onChange={(e) => setValue(`experience.${idx}.description`, e.target.value.split('\n').filter(Boolean))}
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Project Contributions</h3>
                <button
                  type="button"
                  onClick={() => appendProject({ title: '', description: [''], technologies: [], githubLink: '', liveDemoLink: '' })}
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>

              {projectFields.map((field, idx) => (
                <div key={field.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="absolute top-4 right-4 text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition"
                  >
                    <Trash className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-slate-500">Project Title</label>
                      <input
                        {...register(`projects.${idx}.title`, { required: true })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                        placeholder="E-Commerce Billing Dashboard"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">GitHub Code Link</label>
                      <input
                        {...register(`projects.${idx}.githubLink`)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 text-sm rounded-lg focus:outline-none"
                        placeholder="https://github.com/user/project"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Live Demo Link</label>
                      <input
                        {...register(`projects.${idx}.liveDemoLink`)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 text-sm rounded-lg focus:outline-none"
                        placeholder="https://project-demo.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-slate-500">Technologies Used (Comma separated)</label>
                      <input
                        type="text"
                        defaultValue={formValues.projects?.[idx]?.technologies?.join(', ')}
                        onChange={(e) => setValue(`projects.${idx}.technologies`, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 text-sm rounded-lg focus:outline-none"
                        placeholder="React, Node.js, Express, MongoDB"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-slate-500">Project Bullets (One sentence per line)</label>
                      <textarea
                        defaultValue={formValues.projects?.[idx]?.description?.join('\n')}
                        onChange={(e) => setValue(`projects.${idx}.description`, e.target.value.split('\n').filter(Boolean))}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 text-sm rounded-lg focus:outline-none"
                        placeholder="• Designed responsive React analytics screens.&#10;• Decreased manual query delays by 30% via index keys."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="space-y-8">
              {/* Certifications */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Certificates & Badges</h3>
                  <button
                    type="button"
                    onClick={() => appendCert({ name: '', organization: '', date: '' })}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Certificate
                  </button>
                </div>

                {certFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      {...register(`certifications.${idx}.name`, { required: true })}
                      placeholder="AWS Cloud Practitioner"
                      className="w-1/3 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <input
                      {...register(`certifications.${idx}.organization`, { required: true })}
                      placeholder="Amazon Web Services"
                      className="w-1/3 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <input
                      {...register(`certifications.${idx}.date`)}
                      placeholder="Oct 2025"
                      className="w-1/4 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <button type="button" onClick={() => removeCert(idx)} className="text-rose-500">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Academic Achievements</h3>
                  <button
                    type="button"
                    onClick={() => appendAch({ title: '', description: '' })}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Achievement
                  </button>
                </div>

                {achFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      {...register(`achievements.${idx}.title`, { required: true })}
                      placeholder="Hackathon Winner"
                      className="w-1/3 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <input
                      {...register(`achievements.${idx}.description`, { required: true })}
                      placeholder="Won 1st prize out of 100 teams"
                      className="w-1/2 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <button type="button" onClick={() => removeAch(idx)} className="text-rose-500">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Languages</h3>
                  <button
                    type="button"
                    onClick={() => appendLang({ language: '', proficiency: '' })}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Language
                  </button>
                </div>

                {langFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                      {...register(`languages.${idx}.language`, { required: true })}
                      placeholder="English"
                      className="w-1/2 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <input
                      {...register(`languages.${idx}.proficiency`)}
                      placeholder="Professional Working"
                      className="w-2/5 px-2 py-1.5 text-xs border rounded-lg"
                    />
                    <button type="button" onClick={() => removeLang(idx)} className="text-rose-500">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Self Declaration */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center pb-2">
                  <h3 className="text-base font-bold text-slate-900">Self Declaration</h3>
                </div>
                <div>
                  <textarea
                    {...register('declaration')}
                    rows={3}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="I hereby declare that all the details mentioned above are true to the best of my knowledge and belief."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center no-print">
            <button
              type="button"
              onClick={handlePrevTab}
              disabled={activeTab === 'personal'}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous Section
            </button>

            {activeTab === 'additional' ? (
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={saveLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-55"
              >
                <Save className="h-4 w-4" />
                {saveLoading ? 'Saving...' : 'Save & Preview Resume'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextTab}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1"
              >
                Next Section
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live preview section on the right side */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sticky top-24 max-h-[80vh] overflow-y-auto shadow-inner">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Live ATS Preview</h3>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {formValues.templateId?.replace('-', ' ')}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm scale-95 origin-top min-w-[320px] overflow-x-auto">
              {React.createElement(getTemplateComponent(formValues.templateId || 'classic'), { data: formValues })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;


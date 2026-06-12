import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShieldAlert, Award, FileText, Check, ChevronRight, HelpCircle, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTemplateComponent } from '../templates/ResumeTemplates';

const MOCK_RESUME_DATA = {
  personalInfo: {
    fullName: "Rahul Kumar",
    email: "rahul.kumar@gmail.com",
    phoneNumber: "+91 98765 43210",
    location: "New Delhi, India",
    linkedinUrl: "https://linkedin.com/in/rahulkumar",
    githubUrl: "https://github.com/rahulkumar"
  },
  summary: "Motivated MERN Stack Developer with hands-on experience in building full-stack web applications using React.js, Node.js, Express.js, and MongoDB. Strong knowledge of web standards, API integrations, and database performance tuning.",
  education: [
    { degree: "B.Tech Computer Science", college: "ABC University", score: "9.1 CGPA", startDate: "2022", endDate: "2026" }
  ],
  skills: {
    programmingLanguages: ["JavaScript", "C++", "Python"],
    frontend: ["HTML5", "CSS3", "React.js", "Tailwind CSS"],
    backend: ["Node.js", "Express.js"],
    database: ["MongoDB", "MySQL"],
    tools: ["Git", "GitHub", "VS Code", "Postman"]
  },
  projects: [
    { title: "E-Commerce Billing Dashboard", description: ["Developed a full-stack billing software using MERN Stack", "Integrated JWT authentication and role-based access", "Reduced manual billing effort by 70%"], technologies: ["React.js", "Node.js", "MongoDB"], githubLink: "https://github.com/rahul/dashboard" }
  ],
  internships: [
    { role: "Software Developer Intern", company: "DevSolutions Ltd", duration: "June 2025 - August 2025", responsibilities: ["Assisted in developing client-side dashboards", "Participated in daily standups and agile sprints"] }
  ],
  certifications: [
    { name: "AWS Cloud Practitioner", organization: "Amazon Web Services", date: "Oct 2025" }
  ],
  languages: [
    { language: "English", proficiency: "Fluent" }
  ]
};

const LandingPage = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const templatesList = [
    { id: "classic", name: "Classic Professional", desc: "Traditional standard look, ideal for BCA/MCA general roles." },
    { id: "software-engineer", name: "Software Engineer ATS", desc: "Top skills block format, optimized for junior developers." },
    { id: "fresh-graduate", name: "Fresh Graduate ATS", desc: "Highlight academic records and training, ideal for students." },
    { id: "modern-minimal", name: "Modern Minimal ATS", desc: "Serif heading, clean and compact for crowded experiences." },
    { id: "it-professional", name: "IT Professional ATS", desc: "Structured for network, databases, and platform certs." }
  ];

  const faqs = [
    {
      q: "What makes a resume 'ATS-Friendly'?",
      a: "Applicant Tracking Systems parse resumes as plain text. Fancy tables, graphics, profile photos, icons, and progress bars confuse the parsers, leading to rejected applications. An ATS-friendly resume has a clean, single-column format, standard section headings, and selectable text."
    },
    {
      q: "Can B.Tech CSE / MCA freshers use this platform?",
      a: "Yes! The platform is custom-built for freshers. The templates place emphasis on academic records, technical project contributions, and core programming skill matrices to help you land interview shortlists."
    },
    {
      q: "Is there a limit on how many resumes I can build?",
      a: "No. You can create, edit, customize, and save multiple versions of your resume tailored to different jobs (e.g., Frontend Developer vs. Backend Developer)."
    },
    {
      q: "How does the ATS Resume Scoring System work?",
      a: "Our algorithm scans your resume for critical sections, link placements (like GitHub and LinkedIn), skill variety, and item counts to evaluate readiness and match recruiter expectations."
    }
  ];

  const PreviewComponent = getTemplateComponent(selectedTemplate);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs font-semibold text-blue-800 mb-6">
            <span>✨ Zero bloat, 100% Recruiter Compliance</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-none">
            Build Resumes That Pass the <span className="text-blue-600">Recruiter Filter</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Standard graphic resumes get rejected by automated applicant systems. Use Resumix to generate optimized, single-column text resumes designed for IT & CSE students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition flex items-center gap-2 text-base w-full sm:w-auto justify-center"
            >
              Build Your ATS-Friendly Resume
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#templates"
              className="text-slate-700 hover:text-slate-950 font-semibold px-6 py-4 rounded-xl border border-slate-300 bg-white transition hover:bg-slate-50 w-full sm:w-auto text-center"
            >
              Preview Templates
            </a>
          </div>
        </div>
      </section>

      {/* Benefits / Warning Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-4 text-rose-800">
            <ShieldAlert className="h-6 w-6" />
            <h2 className="text-lg font-bold">Why Fancy Resumes Fail</h2>
          </div>
          <ul className="space-y-3.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Visual Timelines & Charts:</strong> ATS systems cannot read charts and score them as zero.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Skills Percentage Bars:</strong> Declaring you have "80% Java" tells recruiters nothing and fails keywords.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Multi-column Grid Layouts:</strong> Reader algorithms parse side-by-side grids out of order.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Profile Photos & Icons:</strong> Graphics pollute parsing results, causing instant disqualification.</span>
            </li>
          </ul>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-4 text-emerald-800">
            <CheckCircle className="h-6 w-6" />
            <h2 className="text-lg font-bold">The Resumix Advantage</h2>
          </div>
          <ul className="space-y-3.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Pure Text Selectable PDFs:</strong> Built for quick indexing and exact keyword match parsing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Single Column Hierarchy:</strong> Natural standard reading flow matching parsing configurations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Standard Headings:</strong> Standardized titles like "Work Experience" instead of custom slogans.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Smart Presets:</strong> Predefined CSE/IT sections, project bullets, and preset suggestions.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="bg-white border-t border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-950">5 Pre-Validated ATS Formats</h2>
            <p className="text-slate-600 mt-2">Zero decorative clutter. Select a template card below to see it live with example data.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {templatesList.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`text-left border rounded-xl p-5 hover:shadow-md transition flex flex-col justify-between ${
                  selectedTemplate === tmpl.id
                    ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded inline-block mb-3 ${
                    selectedTemplate === tmpl.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tmpl.id.toUpperCase().replace('-', ' ')}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{tmpl.name}</h3>
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed">{tmpl.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 font-semibold flex items-center justify-between w-full">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Previewing
                  </span>
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
              </button>
            ))}
          </div>

          {/* Interactive example preview */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto shadow-inner overflow-x-auto">
            <div className="text-center mb-6">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Example Data Preview: {templatesList.find(t => t.id === selectedTemplate)?.name}
              </span>
            </div>
            <div className="bg-white shadow-lg border border-slate-200 p-8 rounded-lg max-w-2xl mx-auto">
              <PreviewComponent data={MOCK_RESUME_DATA} />
            </div>
          </div>
        </div>
      </section>


      {/* FAQs */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-950 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-950 flex items-start gap-2 text-base">
                <HelpCircle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                {faq.q}
              </h3>
              <p className="text-slate-600 text-sm mt-3.5 leading-relaxed pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

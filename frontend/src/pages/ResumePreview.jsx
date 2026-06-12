import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resumeService } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, ShieldCheck, FileText } from 'lucide-react';
import { getTemplateComponent } from '../templates/ResumeTemplates';
import html2pdf from 'html2pdf.js';


const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await resumeService.getById(id);
        if (res.data.success) {
          const data = res.data.data;
          setResume(data);
          setDownloads(data.downloadsCount || 0);
        }
      } catch (err) {
        setError('Failed to fetch resume');
        toast.error('Failed to load resume');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  const handleExportPDF = async () => {
    const element = document.getElementById('resume-to-pdf');
    if (!element) {
      toast.error('Resume element not found');
      return;
    }

    const toastId = toast.loading('Generating & exporting PDF...');
    element.classList.add('generating-pdf');

    try {
      const res = await resumeService.recordDownload(id);
      if (res.data.success) setDownloads(res.data.downloadsCount);
    } catch (err) {
      console.error('Error logging download count', err);
    }

    const opt = {
      margin:       0,
      filename:     `${resume?.title || 'Resume'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };


    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        element.classList.remove('generating-pdf');
        toast.success('PDF exported and downloaded!', { id: toastId });
      })
      .catch((err) => {
        element.classList.remove('generating-pdf');
        console.error('PDF export error:', err);
        toast.error('Failed to export PDF', { id: toastId });
      });
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Preparing your resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center text-rose-500 space-y-2">
          <FileText className="h-10 w-10 mx-auto opacity-40" />
          <p className="font-semibold">{error || 'Resume not found'}</p>
          <Link to="/dashboard" className="text-blue-600 text-sm underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(resume.templateId);

  return (
    <div className="bg-slate-100 min-h-screen pb-20">

      {/* ── Top Control Bar ── */}
      <div className="bg-white border-b border-slate-200 py-3 sticky top-16 z-40 no-print shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between items-center gap-3">

          {/* Left: Back + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/builder/${id}`)}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-sm font-semibold transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </button>
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-800">{resume.title}</span>
            </div>
          </div>

          {/* Right: Stats + Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>ATS: <span className={`font-bold ${resume.atsScore >= 80 ? 'text-emerald-600' : resume.atsScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{resume.atsScore}/100</span></span>
              <span className="mx-1 text-slate-300">|</span>
              <span>Downloads: {downloads}</span>
            </div>

            <button
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition no-print"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── A4 Resume Sheet ── */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="resume-full-preview-wrapper">
          <div className="resume-preview-card resume-container" id="resume-to-pdf">
            <TemplateComponent data={resume} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResumePreview;

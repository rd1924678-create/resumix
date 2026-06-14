import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeService } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, FileText, RefreshCw } from 'lucide-react';
import { getTemplateComponent } from '../templates/ResumeTemplates';
import html2pdf from 'html2pdf.js';

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const [previewScale, setPreviewScale] = useState(1);
  const containerRef = useRef(null);

  // A4 dimensions (standard 96dpi)
  const A4_W = 794;
  const A4_H = 1123;

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await resumeService.getById(id);
        if (res.data.success) {
          setResume(res.data.data);
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

  // Handle auto-scaling on tablet and mobile viewports
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const containerW = el.offsetWidth;
      // Add slight spacing padding for smaller viewports
      if (containerW < 840) {
        setPreviewScale((containerW - 32) / A4_W);
      } else {
        setPreviewScale(1);
      }
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  const handleExportPDF = async () => {
    const element = document.getElementById('resume-to-pdf');
    if (!element) {
      toast.error('Resume element not found');
      return;
    }

    const toastId = toast.loading('Generating & exporting PDF...');
    setIsDownloading(true);
    element.classList.add('generating-pdf');

    try {
      await resumeService.recordDownload(id);
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
        setIsDownloading(false);
        toast.success('PDF exported and downloaded!', { id: toastId });
      })
      .catch((err) => {
        element.classList.remove('generating-pdf');
        setIsDownloading(false);
        console.error('PDF export error:', err);
        toast.error('Failed to export PDF', { id: toastId });
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Preparing your document preview...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-rose-500 space-y-3">
          <FileText className="h-12 w-12 mx-auto opacity-30" />
          <p className="font-semibold text-lg">{error || 'Resume not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-400 hover:text-blue-300 text-sm underline font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(resume.templateId);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans relative">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.02]" />

      {/* ── Top Bar ── */}
      <div className="bg-slate-950/85 border-b border-slate-800/80 h-16 flex items-center justify-between px-6 sticky top-0 z-50 no-print backdrop-blur-md shadow-lg shadow-slate-950/20">
        {/* Back to edit */}
        <button
          onClick={() => navigate(`/builder/${id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Edit
        </button>

        {/* Middle Document title */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-850 rounded-lg px-3 py-1.5">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-bold text-slate-200 tracking-tight">{resume.title}</span>
        </div>

        {/* Download PDF button */}
        <button
          onClick={handleExportPDF}
          disabled={isDownloading}
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
        >
          {isDownloading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* ── A4 Resume Sheet Viewport ── */}
      <div className="flex-grow flex justify-center items-start overflow-y-auto py-10 px-4">
        <div
          ref={containerRef}
          className="w-full flex justify-center items-start"
        >
          {/* Scale Container to wrap the scaled template perfectly without overlaps */}
          <div
            style={{
              width: `${A4_W * previewScale}px`,
              height: `${A4_H * previewScale}px`,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              id="resume-to-pdf"
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
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <TemplateComponent data={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;

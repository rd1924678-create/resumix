import React, { useState, useCallback, useRef, useEffect } from 'react';
import { atsService } from '../services/api';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, BarChart, ChevronRight, MessageSquare, Send, Bot, User, X } from 'lucide-react';

const ATSScorer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState('');

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file.');
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file.');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await atsService.scoreResume(formData);

      if (response.data.success) {
        setResult(response.data.data);
        // Store resume text for chat context if backend returns it
        if (response.data.resumeText) setResumeText(response.data.resumeText);
        // Open chat with a greeting
        setMessages([{
          role: 'assistant',
          content: `I've analyzed your resume and given it a score of **${response.data.data.score}/100**. Feel free to ask me anything — like "How can I improve my score?", "Is this resume good for a finance role?", or "What keywords am I missing?"`
        }]);
      } else {
        setError(response.data.message || 'Failed to analyze resume');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await atsService.chatResume(resumeText, newMessages);

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const getColorClass = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBgClass = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Corporate ATS Scorer
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Analyze your resume exactly how modern Applicant Tracking Systems do. Uncover missing keywords and optimize your format for human recruiters.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-12">

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center space-y-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-6 sm:p-12 transition-all duration-300 flex flex-col items-center justify-center ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'}`}
              >
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-lg sm:text-2xl font-semibold mb-2">Drag & drop your resume here</h3>
                <p className="text-slate-400 mb-8 text-center max-w-sm">
                  Upload your CV as a PDF file. We process it securely in-memory.
                </p>
                <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <label
                  htmlFor="file-upload"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                >
                  Browse Files
                </label>
              </div>

              {file && (
                <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 flex items-center justify-between border border-slate-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{file.name}</p>
                      <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-medium transition-all duration-300 shadow-lg flex items-center space-x-2"
                  >
                    <span>Analyze Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && (
                <div className="w-full max-w-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-4 flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-200">Scanning Resume</h3>
                <p className="text-slate-400 animate-pulse">Running advanced ATS matching algorithms...</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Overall Score */}
              <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 bg-slate-800/80 rounded-3xl p-8 border border-slate-700/50">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={`${getColorClass(result.score)} transition-all duration-1000 ease-out`} strokeDasharray={`${result.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-black ${getColorClass(result.score)}`}>{result.score}</span>
                    <span className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold">Match</span>
                  </div>
                </div>

                <div className="max-w-md text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-4">
                    {result.score >= 80 ? 'Exceptional Match!' : result.score >= 60 ? 'Good, but needs work.' : 'Needs Significant Revision.'}
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Based on corporate Applicant Tracking Systems, your resume scored {result.score} out of 100. Review the detailed breakdown below to optimize your profile for recruiters.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => { setResult(null); setFile(null); setMessages([]); setResumeText(''); }}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full font-medium transition-colors"
                    >
                      Scan Another Resume
                    </button>
                    <button
                      onClick={() => { setChatOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                      className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-full font-medium transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask AI About My Resume
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(result.categories || {}).map(([key, score]) => (
                  <div key={key} className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-center relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold capitalize">{key}</h4>
                      <span className={`font-bold ${getColorClass(score)}`}>{score}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getBgClass(score)} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback & Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-8 border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="text-amber-400 w-6 h-6" />
                    <h3 className="text-xl font-bold">Actionable Feedback</h3>
                  </div>
                  <ul className="space-y-4">
                    {result.feedback && (Array.isArray(result.feedback) ? result.feedback : Object.values(result.feedback).flat()).map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-slate-400">{idx + 1}</div>
                        <p className="text-slate-300">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <CheckCircle className="text-blue-400 w-6 h-6" />
                    <h3 className="text-xl font-bold">Missing Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords && result.missingKeywords.length > 0 ? (
                      result.missingKeywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium">{keyword}</span>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">Great job! You seem to have the core keywords covered.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Panel ────────────────────────────────────────── */}
      {result && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col transition-all duration-500 ${chatOpen ? 'w-[calc(100%-2rem)] sm:w-[380px] h-[70vh] sm:h-[560px]' : 'w-auto h-auto'}`}>
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-2xl font-medium shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              Ask AI About My Resume
            </button>
          ) : (
            <div className="flex flex-col h-full bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">Resume AI Advisor</p>
                    <p className="text-xs text-slate-400">Ask anything about your resume</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-violet-500 to-purple-600'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}>
                      <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested questions (shown before first user message) */}
              {messages.filter(m => m.role === 'user').length === 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {['How can I improve my score?', 'Is this good for a finance role?', 'What keywords am I missing?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:border-violet-500 hover:text-violet-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-700/50 flex gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your resume..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 self-end"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATSScorer;

import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setPastedText,
  setUploadedFile,
  removeUploadedFile,
  analyzeDeviationThunk,
  sendChatMessageThunk,
  setToast,
} from '../store/deviationSlice';
import {
  Sparkles,
  UploadCloud,
  FileText,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  User,
  Clock,
  Layers,
  Info,
  Check,
  Zap,
  CornerDownLeft,
  ShieldAlert
} from 'lucide-react';

const SAMPLE_DEVIATION_TEXT = `During manufacturing of Batch ABC-001 on 24-Sep-2026, the temperature of Reactor R-101 exceeded the approved range of 75–80°C and reached 86°C for approximately 15 minutes. The event was identified by the production operator during routine monitoring.`;

export default function AIAssistant() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  const {
    pastedText,
    uploadedFile,
    analyzing,
    analysisStep,
    analysisComplete,
    aiRecommendation,
    formData,
    is_demo_mode,
    model_used,
    chatMessages,
    chatLoading,
  } = useSelector((state) => state.deviation);

  const [chatInput, setChatInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Unsupported format. Please upload PDF, DOCX, or TXT file.',
        })
      );
      return;
    }

    dispatch(setUploadedFile(file));
  };

  const handleApplySample = () => {
    dispatch(setPastedText(SAMPLE_DEVIATION_TEXT));
    dispatch(
      setToast({
        type: 'info',
        message: 'Sample deviation text loaded! Click "Analyze Deviation" to test.',
      })
    );
  };

  const handleAnalyze = () => {
    if (!uploadedFile && (!pastedText || !pastedText.trim())) {
      dispatch(
        setToast({
          type: 'warning',
          message: 'Please upload a document or paste deviation notes first.',
        })
      );
      return;
    }

    dispatch(
      analyzeDeviationThunk({
        file: uploadedFile,
        text: pastedText,
      })
    );
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    dispatch(sendChatMessageThunk(msg));
  };

  const quickPrompts = [
    'Why was Major severity recommended?',
    'What immediate actions should be taken?',
    'Summarize product quality risk',
  ];

  const graphSteps = [
    'Input Handler',
    'Document / Text Extraction',
    'Deviation Info Extraction',
    'Impact Analysis',
    'Severity Recommendation',
    'GMP Validation',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">AI Deviation Assistant</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  BETA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                LangGraph Pipeline • {model_used || 'Groq Llama 3.3'}
              </p>
            </div>
          </div>

          {is_demo_mode && (
            <span className="text-[11px] bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-full font-medium">
              Demo Fallback Engine
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Upload Zone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Upload Deviation Document
            </label>
            <span className="text-[11px] text-slate-400">PDF, DOCX, TXT</span>
          </div>

          {uploadedFile ? (
            /* Uploaded File Pill / Card */
            <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(removeUploadedFile())}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-white"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Drag and Drop Box */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2 stroke-[1.75]" />
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop supporting document here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                or <span className="text-blue-600 font-semibold hover:underline">click to browse</span> from computer
              </p>
            </div>
          )}
        </div>

        {/* Textarea for Pasting Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Deviation Details / Notes
            </label>
            <button
              type="button"
              onClick={handleApplySample}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/80 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              Try Sample Deviation
            </button>
          </div>
          <textarea
            rows={4}
            placeholder="Paste raw batch record notes, operator logs, or email notifications here..."
            value={pastedText}
            onChange={(e) => dispatch(setPastedText(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Primary CTA: Analyze Deviation */}
        <div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing document and extracting key details...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Analyze Deviation</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </>
            )}
          </button>
        </div>

        {/* Processing State with LangGraph Workflow visualization */}
        {analyzing && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                LangGraph Execution Pipeline
              </span>
              <span className="text-slate-400">Step {analysisStep} of 6</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(analysisStep / 6) * 100}%` }}
              ></div>
            </div>

            {/* Steps list */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              {graphSteps.map((stepName, idx) => {
                const stepNum = idx + 1;
                const isPassed = analysisStep > stepNum;
                const isCurrent = analysisStep === stepNum;
                return (
                  <div
                    key={stepName}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                      isPassed
                        ? 'text-emerald-700 bg-emerald-50/80 font-medium'
                        : isCurrent
                        ? 'text-blue-700 bg-blue-50 font-bold border border-blue-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    ) : (
                      <span className="w-3 text-center text-[10px]">{stepNum}</span>
                    )}
                    <span className="truncate">{stepName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Extraction Complete & Recommendations Card */}
        {analysisComplete && !analyzing && (
          <div className="space-y-4 animate-fadeIn">
            {/* Success Banner */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>AI Extraction Complete</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                Confidence: {Math.round((aiRecommendation.confidence || 0.95) * 100)}%
              </span>
            </div>

            {/* Recommendation Highlight Card */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  AI Impact & Severity Recommendation
                </span>
                <span className="text-[10px] font-medium text-slate-400">Subject to Human QA</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recommended Impact
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {formData.initial_impact || 'Product Quality'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recommended Severity
                  </span>
                  <span
                    className={`text-xs font-extrabold mt-0.5 inline-block px-2 py-0.5 rounded ${
                      formData.initial_severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : formData.initial_severity === 'Major'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {formData.initial_severity || 'Major'}
                  </span>
                </div>
              </div>

              {aiRecommendation.severity_reason && (
                <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-0.5">Reason:</span>
                  "{aiRecommendation.severity_reason}"
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-tight">
                * The impact and severity are AI recommendations automatically populated into the form. You retain full control to edit or override before saving.
              </p>
            </div>
          </div>
        )}

        {/* Chat / Q&A Box */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              Ask me anything about this deviation...
            </span>
          </div>

          {/* Quick Question Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => dispatch(sendChatMessageThunk(prompt))}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 border border-slate-200/60 rounded-full transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="h-44 overflow-y-auto space-y-2.5 p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl text-xs mb-3">
            {chatMessages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex gap-2 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      isAssistant
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                        : 'bg-blue-600 text-white font-medium'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs italic">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                AI assistant is formulating response...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Field */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question about root causes, batch impact, or CAPA..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateFormField,
  resetForm,
  saveDeviationThunk,
  setToast,
} from '../store/deviationSlice';
import {
  FileText,
  RotateCcw,
  Save,
  Sparkles,
  UserCheck,
  Calendar,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function DeviationForm() {
  const dispatch = useDispatch();
  const {
    formData,
    fieldMeta,
    saving,
    saveSuccess,
    savedRecord,
    aiRecommendation,
    analysisComplete,
  } = useSelector((state) => state.deviation);

  const [validationErrors, setValidationErrors] = useState({});

  const handleFieldChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = () => {
    const errors = {};
    if (!formData.site || !formData.site.trim()) {
      errors.site = 'Site / Plant is required';
    }
    if (!formData.date_of_occurrence || !formData.date_of_occurrence.trim()) {
      errors.date_of_occurrence = 'Date of Occurrence is required';
    }
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Title / Short Description is required';
    }
    if (!formData.source || !formData.source.trim()) {
      errors.source = 'Source is required';
    }
    if (!formData.detailed_description || !formData.detailed_description.trim()) {
      errors.detailed_description = 'Detailed Description is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      dispatch(
        setToast({
          type: 'error',
          message: 'Please complete all required fields marked with * before saving.',
        })
      );
      return;
    }

    dispatch(saveDeviationThunk());
  };

  // Helper badge to distinguish AI vs User edited
  const renderSourceTag = (field) => {
    const meta = fieldMeta[field];
    if (meta === 'ai') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-1.5 py-0.5 rounded shadow-2xs">
          <Sparkles className="w-2.5 h-2.5 text-purple-600" />
          AI Extracted
        </span>
      );
    }
    if (meta === 'user') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded shadow-2xs">
          <UserCheck className="w-2.5 h-2.5 text-amber-600" />
          User Edited
        </span>
      );
    }
    return null;
  };

  const sourceSuggestions = [
    'Routine monitoring',
    'In-Process Control (IPC)',
    'Quality Control (QC)',
    'QA Audit / Inspection',
    'Operator Observation',
    'Equipment Alarm'
  ];

  const impactOptions = [
    'Product Quality',
    'Facility / Equipment',
    'Regulatory / Compliance',
    'Safety / Health',
    'Documentation',
    'Other'
  ];

  const severityOptions = [
    { value: 'Minor', color: 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-500' },
    { value: 'Major', color: 'border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-500' },
    { value: 'Critical', color: 'border-rose-300 bg-rose-50 text-rose-800 focus:ring-rose-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Deviation</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Draft
            </span>
          </div>
          {saveSuccess && savedRecord && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved as #{savedRecord.id}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          Record any unexpected event, out-of-specification result or non-conformance.
        </p>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* SECTION 1: DEVIATION INFORMATION */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Section 1: Deviation Information
            </h2>
            <span className="text-[11px] text-slate-400">* Required for submission</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Site / Plant * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Site / Plant <span className="text-rose-500">*</span>
                </label>
                {renderSourceTag('site')}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. API Manufacturing Unit"
                  value={formData.site}
                  onChange={(e) => handleFieldChange('site', e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all ${
                    validationErrors.site
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : fieldMeta.site === 'ai'
                      ? 'border-purple-200 focus:ring-blue-400'
                      : 'border-slate-200 focus:ring-blue-400'
                  }`}
                />
              </div>
              {validationErrors.site && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.site}
                </p>
              )}
            </div>

            {/* 2. Date of Occurrence * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Date of Occurrence <span className="text-rose-500">*</span>
                </label>
                {renderSourceTag('date_of_occurrence')}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="YYYY-MM-DD (e.g. 2026-09-24)"
                  value={formData.date_of_occurrence}
                  onChange={(e) => handleFieldChange('date_of_occurrence', e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all ${
                    validationErrors.date_of_occurrence
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : fieldMeta.date_of_occurrence === 'ai'
                      ? 'border-purple-200 focus:ring-blue-400'
                      : 'border-slate-200 focus:ring-blue-400'
                  }`}
                />
              </div>
              {validationErrors.date_of_occurrence && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.date_of_occurrence}
                </p>
              )}
            </div>

            {/* 3. Title / Short Description * */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Title / Short Description <span className="text-rose-500">*</span>
                </label>
                {renderSourceTag('title')}
              </div>
              <input
                type="text"
                placeholder="e.g. Reactor temperature exceeded approved range"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all ${
                  validationErrors.title
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : fieldMeta.title === 'ai'
                    ? 'border-purple-200 focus:ring-blue-400'
                    : 'border-slate-200 focus:ring-blue-400'
                }`}
              />
              {validationErrors.title && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.title}
                </p>
              )}
            </div>

            {/* 4. Source * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Source <span className="text-rose-500">*</span>
                </label>
                {renderSourceTag('source')}
              </div>
              <input
                type="text"
                list="source-suggestions"
                placeholder="e.g. Routine monitoring"
                value={formData.source}
                onChange={(e) => handleFieldChange('source', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all ${
                  validationErrors.source
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : fieldMeta.source === 'ai'
                    ? 'border-purple-200 focus:ring-blue-400'
                    : 'border-slate-200 focus:ring-blue-400'
                }`}
              />
              <datalist id="source-suggestions">
                {sourceSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {validationErrors.source && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.source}
                </p>
              )}
            </div>

            {/* 5. Related Product / Material */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Related Product / Material
                </label>
                {renderSourceTag('related_product')}
              </div>
              <input
                type="text"
                placeholder="e.g. API Intermediate / Active Material"
                value={formData.related_product}
                onChange={(e) => handleFieldChange('related_product', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all ${
                  fieldMeta.related_product === 'ai'
                    ? 'border-purple-200 focus:ring-blue-400'
                    : 'border-slate-200 focus:ring-blue-400'
                }`}
              />
            </div>

            {/* 6. Batch / Lot Number */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Batch / Lot Number
                </label>
                {renderSourceTag('batch_lot_number')}
              </div>
              <input
                type="text"
                placeholder="e.g. ABC-001"
                value={formData.batch_lot_number}
                onChange={(e) => handleFieldChange('batch_lot_number', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all font-mono ${
                  fieldMeta.batch_lot_number === 'ai'
                    ? 'border-purple-200 focus:ring-blue-400'
                    : 'border-slate-200 focus:ring-blue-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DEVIATION DETAILS */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Section 2: Deviation Details
            </h2>
            <span className="text-[11px] text-slate-400">GMP Impact & Classification</span>
          </div>

          <div className="space-y-4">
            {/* 7. Detailed Description * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                {renderSourceTag('detailed_description')}
              </div>
              <textarea
                rows={4}
                placeholder="Factual summary of the deviation, parameters observed, limits, duration, and observations..."
                value={formData.detailed_description}
                onChange={(e) => handleFieldChange('detailed_description', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50/60 border rounded-lg focus:outline-hidden focus:ring-2 focus:bg-white transition-all leading-relaxed ${
                  validationErrors.detailed_description
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : fieldMeta.detailed_description === 'ai'
                    ? 'border-purple-200 focus:ring-blue-400'
                    : 'border-slate-200 focus:ring-blue-400'
                }`}
              />
              {validationErrors.detailed_description && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.detailed_description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 8. Initial Impact */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Initial Impact
                  </label>
                  {renderSourceTag('initial_impact')}
                </div>
                <select
                  value={formData.initial_impact || 'Product Quality'}
                  onChange={(e) => handleFieldChange('initial_impact', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                >
                  {impactOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Select primary quality subsystem affected
                </p>
              </div>

              {/* 9. Initial Severity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Initial Severity
                  </label>
                  {renderSourceTag('initial_severity')}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Minor', 'Major', 'Critical'].map((level) => {
                    const isSelected = formData.initial_severity === level;
                    const colors = {
                      Minor: isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
                      Major: isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-amber-50/60 text-amber-800 border-amber-200 hover:bg-amber-100',
                      Critical: isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-rose-50/60 text-rose-800 border-rose-200 hover:bg-rose-100',
                    };
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleFieldChange('initial_severity', level)}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${colors[level]}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Editable human review recommendation
                </p>
              </div>
            </div>

            {/* AI Recommendation Reason Display if available */}
            {aiRecommendation?.severity_reason && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                <span className="font-semibold text-blue-900 block mb-0.5">
                  AI Severity Rationale:
                </span>
                <p className="text-blue-800 leading-relaxed">
                  "{aiRecommendation.severity_reason}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch(resetForm())}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-blue-500/20 transition-all"
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving to QMS...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Deviation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShieldCheck,
  AlertOctagon,
  FileCheck2,
  FolderGit2,
  ClipboardList,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  Plus,
  ExternalLink
} from 'lucide-react';
import { setActiveTab, setSavedModalOpen } from '../store/deviationSlice';
import { getReportSummaryApi } from '../services/api';

export default function DashboardView() {
  const dispatch = useDispatch();
  const { savedList } = useSelector((state) => state.deviation);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getReportSummaryApi()
      .then((data) => setSummary(data))
      .catch((err) => console.log('Summary err:', err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Executive Banner */}
      <div className="bg-gradient-to-r from-[#0b1b33] via-[#102a52] to-[#0f3460] text-white rounded-2xl p-6 shadow-md border border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>AIVOA Quality Management System • Enterprise Edition</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            API Pharmaceutical Quality Command Center
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time compliance monitoring, AI-assisted deviation intake, automated ICH Q10 CAPA lifecycle tracking, and validated 21 CFR Part 11 electronic records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => dispatch(setActiveTab('Deviations'))}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log / AI Intake Deviation</span>
          </button>
          <button
            onClick={() => dispatch(setActiveTab('Reports'))}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Executive Reports</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Deviations */}
        <div
          onClick={() => dispatch(setActiveTab('Deviations'))}
          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Deviations</span>
            <AlertOctagon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.total_deviations : savedList.length}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
            <span>Open Intake & Triage</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* CAPAs */}
        <div
          onClick={() => dispatch(setActiveTab('CAPAs'))}
          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Active CAPAs</span>
            <FileCheck2 className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.total_capas : 4}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
            <span>Manage Lifecycle</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Change Control */}
        <div
          onClick={() => dispatch(setActiveTab('Change Control'))}
          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Change Controls</span>
            <FolderGit2 className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.total_change_controls : 4}
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
            <span>Review & Authorize</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Audits */}
        <div
          onClick={() => dispatch(setActiveTab('Audits'))}
          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs hover:shadow-md hover:border-sky-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Audits / Inspections</span>
            <ClipboardList className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.total_audits : 4}
          </div>
          <div className="text-[11px] text-sky-600 font-semibold mt-1 flex items-center gap-1">
            <span>Schedule & Inspect</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Documents */}
        <div
          onClick={() => dispatch(setActiveTab('Documents'))}
          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Controlled Docs</span>
            <BookOpen className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.total_documents : 6}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>SOP Repository</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Quality Events & Module Quick Launches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Access Workflows */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">GMP Operations & Quality Workflows</h2>
              <p className="text-xs text-slate-500">Direct shortcuts to validated manufacturing modules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              onClick={() => dispatch(setActiveTab('Deviations'))}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <AlertOctagon className="w-4 h-4 text-blue-600" />
                <span>AI Deviation Intake</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Drop incident notes or batch logs. Groq LLM extracts parameters and populates intake form.
              </p>
            </div>

            <div
              onClick={() => dispatch(setActiveTab('CAPAs'))}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>CAPA Investigation</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Track root cause analysis (5 Whys), corrective containment, and effectiveness verification.
              </p>
            </div>

            <div
              onClick={() => dispatch(setActiveTab('Change Control'))}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <FolderGit2 className="w-4 h-4 text-teal-600" />
                <span>Change Management</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Manage equipment modifications, process tweaks, regulatory impacts, and engineering changes.
              </p>
            </div>

            <div
              onClick={() => dispatch(setActiveTab('Audits'))}
              className="p-4 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <ClipboardList className="w-4 h-4 text-sky-600" />
                <span>Audits & Self-Inspection</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Annual self-inspections, vendor qualification, and health authority readiness audits.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quality Health Indicator */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Plant Quality Status</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Audit Ready
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Site 01: API Synthesis Unit 02</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Operating under cGMP 21 CFR Part 211</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600">Optimal</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Part 11 Electronic Signatures</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Audit trails and biometric logging active</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-600">Active</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Upcoming Inspection</div>
                <div className="text-[11px] text-slate-500 mt-0.5">US FDA Pre-Approval Inspection (PAI)</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-600">Oct 24</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

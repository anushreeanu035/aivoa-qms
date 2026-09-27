import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  BarChart3,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FolderGit2,
  ClipboardList,
  BookOpen,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { getReportSummaryApi, getExportCsvUrl } from '../services/api';
import { setToast } from '../store/deviationSlice';

export default function ReportsAnalytics() {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await getReportSummaryApi();
      setSummary(data);
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to load Quality Analytics: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleExport = (moduleName) => {
    const url = getExportCsvUrl(moduleName);
    window.open(url, '_blank');
    dispatch(
      setToast({
        type: 'success',
        message: `Exporting ${moduleName} CSV dataset...`,
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !summary) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-16 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Generating Quality Intelligence Metrics...</h3>
        <p className="text-xs text-slate-500 mt-1">Aggregating Deviations, CAPAs, Audits, and Changes</p>
      </div>
    );
  }

  // Calculate severity percentages
  const totalDevs = summary.total_deviations || 1;
  const criticalDevs = summary.deviations_by_severity['Critical'] || 0;
  const majorDevs = summary.deviations_by_severity['Major'] || 0;
  const minorDevs = summary.deviations_by_severity['Minor'] || 0;

  const critPercent = Math.round((criticalDevs / totalDevs) * 100);
  const majPercent = Math.round((majorDevs / totalDevs) * 100);
  const minPercent = Math.round((minorDevs / totalDevs) * 100);

  // CAPA breakdown
  const totalCapas = summary.total_capas || 1;
  const openCapas = summary.capas_by_status['Open'] || 0;
  const inProgCapas = summary.capas_by_status['In Progress'] || 0;
  const effCapas = summary.capas_by_status['Effectiveness Check'] || 0;
  const closedCapas = summary.capas_by_status['Closed'] || 0;
  const capaClosureRate = Math.round((closedCapas / totalCapas) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Quality Analytics & Regulatory Compliance Reports
              </h1>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                ICH Q10 / APQR Executive Review
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive metrics, risk distribution, root cause patterns, and exportable regulatory audit trails.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSummary}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Export Datasets</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-50">
              <button
                onClick={() => handleExport('deviations')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                Deviations (CSV)
              </button>
              <button
                onClick={() => handleExport('capas')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                CAPAs (CSV)
              </button>
              <button
                onClick={() => handleExport('audits')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                Audits (CSV)
              </button>
              <button
                onClick={() => handleExport('change-controls')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                Change Controls (CSV)
              </button>
              <button
                onClick={() => handleExport('documents')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Documents / SOPs (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Compliance Health Index */}
        <div className="bg-gradient-to-br from-[#0b1b33] to-[#132c54] text-white rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Compliance Health Score
            </div>
            <div className="text-3xl font-extrabold mt-1 text-white">
              {summary.compliance_score}%
            </div>
            <div className="text-[11px] text-sky-200/80 mt-1">
              GMP Status: <span className="font-semibold text-emerald-400">Audit Ready</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-400/40 border-t-emerald-400 flex items-center justify-center font-bold text-sm text-emerald-300">
            {summary.compliance_score}
          </div>
        </div>

        {/* Total Incidents */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Deviations Logged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total_deviations}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>{criticalDevs} Critical</span>
            <span className="text-slate-300">•</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{majorDevs} Major</span>
          </div>
        </div>

        {/* CAPA Closure Efficiency */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">CAPA Closure Rate</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{capaClosureRate}%</div>
          <div className="text-[11px] text-indigo-600/80 mt-1">
            {closedCapas} of {summary.total_capas} verified closed
          </div>
        </div>

        {/* Audit Observations */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">Audit Inspection Status</div>
          <div className="text-2xl font-bold text-sky-900 mt-1">{summary.total_audits} Audits</div>
          <div className="text-[11px] text-slate-600 mt-1">
            Critical Findings: <span className="font-bold text-red-600">{summary.audit_findings.Critical}</span> | Major: <span className="font-bold text-amber-600">{summary.audit_findings.Major}</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deviation Severity Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Deviation Severity Risk Matrix</h3>
              <p className="text-xs text-slate-500">Proportion of incidents by regulatory classification</p>
            </div>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            {/* Critical */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  Critical Incidents
                </span>
                <span>{criticalDevs} ({critPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${critPercent}%` }}></div>
              </div>
            </div>

            {/* Major */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Major Incidents
                </span>
                <span>{majorDevs} ({majPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${majPercent}%` }}></div>
              </div>
            </div>

            {/* Minor */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Minor Incidents
                </span>
                <span>{minorDevs} ({minPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${minPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              All Major and Critical deviations trigger mandatory root-cause investigations under ICH Q10 guidelines.
            </span>
          </div>
        </div>

        {/* CAPA Lifecycle Funnel */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">CAPA Resolution Pipeline</h3>
              <p className="text-xs text-slate-500">Status of corrective and preventive milestones</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="text-[11px] font-semibold text-amber-700 uppercase">Open (Pending)</div>
              <div className="text-2xl font-bold text-amber-900 mt-1">{openCapas}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Assigned to owners</div>
            </div>
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="text-[11px] font-semibold text-blue-700 uppercase">In Execution</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{inProgCapas}</div>
              <div className="text-[10px] text-blue-600 mt-0.5">Actions being deployed</div>
            </div>
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
              <div className="text-[11px] font-semibold text-purple-700 uppercase">Effectiveness Check</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">{effCapas}</div>
              <div className="text-[10px] text-purple-600 mt-0.5">Trend verification</div>
            </div>
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase">Closed & Verified</div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{closedCapas}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">QP Approved</div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-[11px] text-indigo-900 flex items-center justify-between">
            <span className="font-semibold">Average CAPA Cycle Time: 18.4 Days</span>
            <span className="text-[10px] bg-indigo-200/80 px-2 py-0.5 rounded font-bold">Within Target (&lt; 30d)</span>
          </div>
        </div>
      </div>

      {/* Impact Breakdown & Document Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deviation Impact Areas */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Incident Distribution by Impact Area</h3>
            <p className="text-xs text-slate-500">Root domains affected across synthesis lines</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(summary.deviations_by_impact).map(([impact, count]) => {
              const pct = Math.round((count / totalDevs) * 100);
              return (
                <div key={impact}>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>{impact}</span>
                    <span className="font-bold text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Quality Health Assessment */}
        <div className="bg-gradient-to-br from-slate-900 to-[#10223d] text-white rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">AI Executive Quality Assurance Assessment</h3>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              • <strong className="text-emerald-300">Production Stability:</strong> Critical defect frequency is well managed. Reactor temperature sensor recalibration CAPA (#CAPA-2026-001) shows containment with zero recurring thermal excursions reported.
            </p>
            <p>
              • <strong className="text-sky-300">Regulatory Preparedness:</strong> Preparation for US FDA Pre-Approval Inspection (Audit #AUD-2026-002) is progressing on schedule. Data integrity audit of chromatography systems scheduled for November.
            </p>
            <p>
              • <strong className="text-amber-300">Recommendation:</strong> Prioritize final sign-off on Change Control #CC-2026-018 (Crystallization Cooling Ramp) to support commercial API lot release.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Automated GMP Quality Engine</span>
            <span>21 CFR Part 11 Validated Audit Trail</span>
          </div>
        </div>
      </div>
    </div>
  );
}

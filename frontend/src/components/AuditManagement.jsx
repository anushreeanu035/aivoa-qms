import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  ShieldAlert,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  X,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  User,
  Award,
  FileCheck2,
  ClipboardList
} from 'lucide-react';
import {
  getAuditsApi,
  createAuditApi,
  updateAuditApi,
  deleteAuditApi,
} from '../services/api';
import { setToast, setModuleCounts } from '../store/deviationSlice';

export default function AuditManagement() {
  const dispatch = useDispatch();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFindingsModalOpen, setIsFindingsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    audit_type: 'Internal Self-Inspection',
    lead_auditor: '',
    target_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    status: 'Scheduled',
    findings_critical: 0,
    findings_major: 0,
    findings_minor: 0,
    summary: '',
  });

  const [findingsData, setFindingsData] = useState({
    findings_critical: 0,
    findings_major: 0,
    findings_minor: 0,
    summary: '',
  });

  const loadAudits = async () => {
    setLoading(true);
    try {
      const data = await getAuditsApi(statusFilter, typeFilter);
      setAudits(data);
      dispatch(setModuleCounts({ audits: data.length }));
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to load Audits: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [statusFilter, typeFilter]);

  const handleStatusChange = async (auditId, newStatus) => {
    try {
      await updateAuditApi(auditId, { status: newStatus });
      dispatch(
        setToast({
          type: 'success',
          message: `Audit status set to "${newStatus}"`,
        })
      );
      loadAudits();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Error updating status: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleDelete = async (auditId) => {
    if (!window.confirm('Are you sure you want to delete this Audit record?')) return;
    try {
      await deleteAuditApi(auditId);
      dispatch(
        setToast({
          type: 'info',
          message: 'Audit record deleted.',
        })
      );
      loadAudits();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to delete audit: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.lead_auditor) {
      alert('Please fill in Title and Lead Auditor');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAuditApi(formData);
      dispatch(
        setToast({
          type: 'success',
          message: 'New Audit scheduled successfully!',
        })
      );
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        audit_type: 'Internal Self-Inspection',
        lead_auditor: '',
        target_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
        status: 'Scheduled',
        findings_critical: 0,
        findings_major: 0,
        findings_minor: 0,
        summary: '',
      });
      loadAudits();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to create Audit: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindingsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    setIsSubmitting(true);
    try {
      await updateAuditApi(selectedAudit.id, findingsData);
      dispatch(
        setToast({
          type: 'success',
          message: 'Audit findings and summary updated!',
        })
      );
      setIsFindingsModalOpen(false);
      loadAudits();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to update findings: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredAudits = audits.filter((a) => {
    const matchesSearch =
      a.audit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lead_auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.audit_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalCount = audits.length;
  const scheduledCount = audits.filter((a) => a.status === 'Scheduled').length;
  const inProgressCount = audits.filter((a) => a.status === 'In Progress' || a.status === 'Report Issued').length;
  const closedCount = audits.filter((a) => a.status === 'Closed').length;
  const totalFindings = audits.reduce(
    (acc, a) => acc + (a.findings_critical || 0) + (a.findings_major || 0) + (a.findings_minor || 0),
    0
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Report Issued':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Audits & Regulatory Inspections
              </h1>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                21 CFR 211.180 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan, execute, and monitor internal self-inspections, health authority regulatory audits, and supplier quality evaluations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAudits}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh Audits"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Audits</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Audits on annual calendar</div>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Scheduled</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{scheduledCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Pending execution date</div>
        </div>
        <div className="bg-white border border-blue-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Active / Issued</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{inProgressCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Underway or report drafting</div>
        </div>
        <div className="bg-white border border-emerald-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Closed</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{closedCount}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">All responses accepted</div>
        </div>
        <div className="bg-white border border-purple-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Total Findings</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">{totalFindings}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Critical, Major & Minor</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['All', 'Scheduled', 'In Progress', 'Report Issued', 'Closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Audit Types</option>
            <option value="Internal Self-Inspection">Internal Self-Inspection</option>
            <option value="Regulatory">Regulatory Agency</option>
            <option value="Supplier">Supplier / Vendor</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Audit #, title, auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Title & Scope</th>
                <th className="py-3 px-4">Audit Type</th>
                <th className="py-3 px-4">Lead Auditor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Findings Breakdown</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading Audits...
                  </td>
                </tr>
              ) : filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No Audit records found.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {audit.audit_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{audit.title}</div>
                      {audit.summary && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{audit.summary}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {audit.audit_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      <div className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{audit.lead_auditor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{audit.target_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            audit.findings_critical > 0
                              ? 'bg-red-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title="Critical Findings"
                        >
                          C: {audit.findings_critical}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            audit.findings_major > 0
                              ? 'bg-amber-500 text-white font-bold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title="Major Findings"
                        >
                          M: {audit.findings_major}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            audit.findings_minor > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title="Minor Findings"
                        >
                          m: {audit.findings_minor}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={audit.status}
                        onChange={(e) => handleStatusChange(audit.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                          audit.status
                        )}`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Report Issued">Report Issued</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAudit(audit);
                            setFindingsData({
                              findings_critical: audit.findings_critical || 0,
                              findings_major: audit.findings_major || 0,
                              findings_minor: audit.findings_minor || 0,
                              summary: audit.summary || '',
                            });
                            setIsFindingsModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
                          title="Log findings & observations"
                        >
                          Findings
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAudit(audit);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDelete(audit.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Audit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {selectedAudit.audit_number}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedAudit.status)}`}>
                    {selectedAudit.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedAudit.title}</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <div className="text-slate-500 font-medium">Audit Type</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedAudit.audit_type}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Lead Auditor</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedAudit.lead_auditor}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Scheduled Date</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedAudit.target_date}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Findings Summary</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <div className="text-red-700 font-bold text-lg">{selectedAudit.findings_critical}</div>
                    <div className="text-[10px] text-red-600 font-semibold uppercase">Critical Findings</div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <div className="text-amber-700 font-bold text-lg">{selectedAudit.findings_major}</div>
                    <div className="text-[10px] text-amber-600 font-semibold uppercase">Major Findings</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="text-blue-700 font-bold text-lg">{selectedAudit.findings_minor}</div>
                    <div className="text-[10px] text-blue-600 font-semibold uppercase">Minor Findings</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Executive Audit Summary & Observations</h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  {selectedAudit.summary || 'Audit report and observations have not yet been logged.'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FINDINGS MODAL */}
      {isFindingsModalOpen && selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Audit Findings</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedAudit.audit_number}</p>
              </div>
              <button
                onClick={() => setIsFindingsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFindingsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-red-700 mb-1">Critical Findings</label>
                  <input
                    type="number"
                    min="0"
                    value={findingsData.findings_critical}
                    onChange={(e) => setFindingsData({ ...findingsData, findings_critical: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg bg-red-50/50 text-red-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-700 mb-1">Major Findings</label>
                  <input
                    type="number"
                    min="0"
                    value={findingsData.findings_major}
                    onChange={(e) => setFindingsData({ ...findingsData, findings_major: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-amber-50/50 text-amber-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-blue-700 mb-1">Minor Findings</label>
                  <input
                    type="number"
                    min="0"
                    value={findingsData.findings_minor}
                    onChange={(e) => setFindingsData({ ...findingsData, findings_minor: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50/50 text-blue-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executive Summary & Deficiencies</label>
                <textarea
                  rows="4"
                  placeholder="Detail observations, non-conformances, and recommendations..."
                  value={findingsData.summary}
                  onChange={(e) => setFindingsData({ ...findingsData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFindingsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Findings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule New Audit / Inspection</h3>
                <p className="text-xs text-slate-500">GMP Self-Inspection & Vendor Quality Program</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit Title / Scope <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthesis Unit 02 Annual GMP Self-Inspection"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audit Type</label>
                  <select
                    value={formData.audit_type}
                    onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Internal Self-Inspection">Internal Self-Inspection</option>
                    <option value="Regulatory">Regulatory Agency</option>
                    <option value="Supplier">Supplier / Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Report Issued">Report Issued</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Auditor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams (Lead Auditor)"
                    value={formData.lead_auditor}
                    onChange={(e) => setFormData({ ...formData, lead_auditor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Inspection Date</label>
                  <input
                    type="date"
                    required
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Objectives / Pre-Audit Notes</label>
                <textarea
                  rows="3"
                  placeholder="Areas to examine, regulatory standards, documentation checklist..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

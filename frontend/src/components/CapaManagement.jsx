import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Calendar,
  User,
  Trash2,
  Edit3,
  X,
  FileCheck2,
  Layers
} from 'lucide-react';
import {
  getCapasApi,
  createCapaApi,
  updateCapaApi,
  deleteCapaApi,
} from '../services/api';
import { setToast, setModuleCounts } from '../store/deviationSlice';

export default function CapaManagement() {
  const dispatch = useDispatch();
  const [capas, setCapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    source_event: '',
    root_cause: '',
    corrective_action: '',
    preventive_action: '',
    assignee: '',
    target_due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'Open',
    effectiveness_check: '',
  });

  const loadCapas = async () => {
    setLoading(true);
    try {
      const data = await getCapasApi(statusFilter);
      setCapas(data);
      dispatch(setModuleCounts({ capas: data.length }));
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to load CAPA records: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapas();
  }, [statusFilter]);

  const handleStatusChange = async (capaId, newStatus) => {
    try {
      await updateCapaApi(capaId, { status: newStatus });
      dispatch(
        setToast({
          type: 'success',
          message: `CAPA status updated to "${newStatus}"`,
        })
      );
      loadCapas();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Error updating status: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleDelete = async (capaId) => {
    if (!window.confirm('Are you sure you want to delete this CAPA record? This action is logged.')) {
      return;
    }
    try {
      await deleteCapaApi(capaId);
      dispatch(
        setToast({
          type: 'info',
          message: 'CAPA record removed.',
        })
      );
      loadCapas();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to delete CAPA: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.corrective_action || !formData.preventive_action || !formData.assignee) {
      alert('Please fill in all mandatory fields (Title, Actions, Assignee)');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCapaApi(formData);
      dispatch(
        setToast({
          type: 'success',
          message: 'New CAPA initiated successfully!',
        })
      );
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        source_event: '',
        root_cause: '',
        corrective_action: '',
        preventive_action: '',
        assignee: '',
        target_due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'Open',
        effectiveness_check: '',
      });
      loadCapas();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to create CAPA: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredCapas = capas.filter((c) => {
    const matchesSearch =
      c.capa_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.source_event && c.source_event.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Metrics
  const totalCount = capas.length;
  const openCount = capas.filter((c) => c.status === 'Open').length;
  const inProgressCount = capas.filter((c) => c.status === 'In Progress').length;
  const effCount = capas.filter((c) => c.status === 'Effectiveness Check').length;
  const closedCount = capas.filter((c) => c.status === 'Closed').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Effectiveness Check':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Corrective & Preventive Actions (CAPA)
                </h1>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  ICH Q10 Lifecycle
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Investigate root causes, execute risk mitigation, and verify effectiveness of corrective and preventive measures.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCapas}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh CAPA list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate New CAPA</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total CAPAs</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Logged across all units</div>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Open</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{openCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Awaiting initial action</div>
        </div>
        <div className="bg-white border border-blue-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{inProgressCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Actions being executed</div>
        </div>
        <div className="bg-white border border-purple-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Effectiveness</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">{effCount}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Verification phase</div>
        </div>
        <div className="bg-white border border-emerald-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Closed</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{closedCount}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Fully verified & signed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Open', 'In Progress', 'Effectiveness Check', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search CAPA #, title, assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">CAPA ID</th>
                <th className="py-3 px-4">Title & Source</th>
                <th className="py-3 px-4">Root Cause & Action</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status & Progression</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading CAPA records...
                  </td>
                </tr>
              ) : filteredCapas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No CAPA records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredCapas.map((capa) => (
                  <tr key={capa.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="font-mono text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                        {capa.capa_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{capa.title}</div>
                      {capa.source_event && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{capa.source_event}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="text-[11px] text-slate-600 line-clamp-2">
                        <span className="font-semibold text-slate-700">Root:</span> {capa.root_cause || 'Under investigation'}
                      </div>
                      <div className="text-[11px] text-emerald-700 line-clamp-1 mt-0.5">
                        <span className="font-semibold">Action:</span> {capa.corrective_action}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{capa.assignee}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{capa.target_due_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={capa.status}
                          onChange={(e) => handleStatusChange(capa.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                            capa.status
                          )}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Effectiveness Check">Effectiveness Check</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCapa(capa);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDelete(capa.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete CAPA"
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
      {isDetailModalOpen && selectedCapa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedCapa.capa_number}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedCapa.status)}`}>
                    {selectedCapa.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedCapa.title}</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <div className="text-slate-500 font-medium">Assignee</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCapa.assignee}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Target Due Date</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCapa.target_due_date}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500 font-medium">Source Event / Origin</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCapa.source_event || 'General QA Audit/Investigation'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Root Cause Analysis</h4>
                <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-lg text-slate-700 leading-relaxed">
                  {selectedCapa.root_cause || 'Root cause investigation not yet formally recorded.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Corrective Action (Immediate)</h4>
                  <div className="p-3 bg-blue-50/50 border border-blue-200/70 rounded-lg text-slate-700 leading-relaxed">
                    {selectedCapa.corrective_action}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Preventive Action (Long-Term)</h4>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-lg text-slate-700 leading-relaxed">
                    {selectedCapa.preventive_action}
                  </div>
                </div>
              </div>

              {selectedCapa.effectiveness_check && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Effectiveness Verification Criteria</h4>
                  <div className="p-3 bg-purple-50/50 border border-purple-200/70 rounded-lg text-slate-700 leading-relaxed">
                    {selectedCapa.effectiveness_check}
                  </div>
                </div>
              )}
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Initiate New CAPA</h3>
                <p className="text-xs text-slate-500">Complying with 21 CFR 211.192 & ICH Q10 guidelines</p>
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
                  CAPA Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upgrade RTD Sensors on Reactor R-101"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Event / Origin</label>
                <input
                  type="text"
                  placeholder="e.g. Deviation DEV-2026-001 or Annual Self-Inspection"
                  value={formData.source_event}
                  onChange={(e) => setFormData({ ...formData, source_event: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Root Cause Analysis</label>
                <textarea
                  rows="2"
                  placeholder="Detail the fundamental root cause determined via 5 Whys or Fishbone analysis"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Corrective Action <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Immediate action to remedy current condition"
                    value={formData.corrective_action}
                    onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preventive Action <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Systemic action to prevent reoccurrence"
                    value={formData.preventive_action}
                    onChange={(e) => setFormData({ ...formData, preventive_action: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assignee (Responsible Owner) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance (Prod Mgr)"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.target_due_date}
                    onChange={(e) => setFormData({ ...formData, target_due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Effectiveness Check Verification Plan</label>
                <textarea
                  rows="2"
                  placeholder="Define measurable criteria to confirm CAPA succeeded before closing"
                  value={formData.effectiveness_check}
                  onChange={(e) => setFormData({ ...formData, effectiveness_check: e.target.value })}
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Submitting...' : 'Save & Authorize CAPA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  GitCommit,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  X,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  SlidersHorizontal,
  FolderGit2
} from 'lucide-react';
import {
  getChangeControlsApi,
  createChangeControlApi,
  updateChangeControlApi,
  deleteChangeControlApi,
} from '../services/api';
import { setToast, setModuleCounts } from '../store/deviationSlice';

export default function ChangeControlManagement() {
  const dispatch = useDispatch();
  const [changeControls, setChangeControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCC, setSelectedCC] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    change_type: 'Process',
    impact_level: 'Moderate (Level 2)',
    description: '',
    justification: '',
    regulatory_impact: false,
    status: 'Under Review',
    initiator: '',
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const loadChangeControls = async () => {
    setLoading(true);
    try {
      const data = await getChangeControlsApi(statusFilter, typeFilter);
      setChangeControls(data);
      dispatch(setModuleCounts({ changeControls: data.length }));
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to load Change Controls: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChangeControls();
  }, [statusFilter, typeFilter]);

  const handleStatusChange = async (ccId, newStatus) => {
    try {
      await updateChangeControlApi(ccId, { status: newStatus });
      dispatch(
        setToast({
          type: 'success',
          message: `Change Control status set to "${newStatus}"`,
        })
      );
      loadChangeControls();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Error updating status: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleDelete = async (ccId) => {
    if (!window.confirm('Are you sure you want to delete this Change Control record?')) return;
    try {
      await deleteChangeControlApi(ccId);
      dispatch(
        setToast({
          type: 'info',
          message: 'Change Control record deleted.',
        })
      );
      loadChangeControls();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to delete record: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.initiator) {
      alert('Please fill in required fields (Title, Description, Initiator)');
      return;
    }

    setIsSubmitting(true);
    try {
      await createChangeControlApi(formData);
      dispatch(
        setToast({
          type: 'success',
          message: 'New Change Control logged successfully!',
        })
      );
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        change_type: 'Process',
        impact_level: 'Moderate (Level 2)',
        description: '',
        justification: '',
        regulatory_impact: false,
        status: 'Under Review',
        initiator: '',
        target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      loadChangeControls();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to create Change Control: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredCCs = changeControls.filter((c) => {
    const matchesSearch =
      c.cc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.initiator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.change_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalCount = changeControls.length;
  const underReviewCount = changeControls.filter((c) => c.status === 'Under Review').length;
  const approvedCount = changeControls.filter((c) => c.status === 'Approved').length;
  const implementedCount = changeControls.filter((c) => c.status === 'Implemented').length;
  const regCount = changeControls.filter((c) => c.regulatory_impact).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Implemented':
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Change Control Management
              </h1>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                GMP Annex 11 Validated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate, justify, and authorize modifications to manufacturing processes, equipment, documents, and facilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadChangeControls}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh Change Controls"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Change Control</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Changes</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active or archived</div>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Under Review</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{underReviewCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">QA & Tech Evaluation</div>
        </div>
        <div className="bg-white border border-blue-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Approved</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{approvedCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Ready for execution</div>
        </div>
        <div className="bg-white border border-emerald-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Implemented</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{implementedCount}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Modifications live</div>
        </div>
        <div className="bg-white border border-purple-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Regulatory Impact</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">{regCount}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Dossier variation needed</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['All', 'Under Review', 'Approved', 'Implemented'].map((tab) => (
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
            <option value="All">All Categories</option>
            <option value="Equipment">Equipment</option>
            <option value="Process">Process</option>
            <option value="Document">Document</option>
            <option value="Facility">Facility</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search CC #, title, initiator..."
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
                <th className="py-3 px-4">CC ID</th>
                <th className="py-3 px-4">Title & Scope</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Impact Level</th>
                <th className="py-3 px-4">Regulatory</th>
                <th className="py-3 px-4">Initiator & Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading Change Controls...
                  </td>
                </tr>
              ) : filteredCCs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No Change Control records found.
                  </td>
                </tr>
              ) : (
                filteredCCs.map((cc) => (
                  <tr key={cc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {cc.cc_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{cc.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cc.description}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {cc.change_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          cc.impact_level.includes('Major')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {cc.impact_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cc.regulatory_impact ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Yes (Dossier)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          None
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="font-medium text-slate-700">{cc.initiator}</div>
                      <div className="text-[11px] text-slate-400">{cc.target_date}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={cc.status}
                        onChange={(e) => handleStatusChange(cc.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                          cc.status
                        )}`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Implemented">Implemented</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCC(cc);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDelete(cc.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Change Control"
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
      {isDetailModalOpen && selectedCC && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedCC.cc_number}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedCC.status)}`}>
                    {selectedCC.status}
                  </span>
                  {selectedCC.regulatory_impact && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Regulatory Impact
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedCC.title}</h3>
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
                  <div className="text-slate-500 font-medium">Category</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCC.change_type}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Impact Level</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCC.impact_level}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Target Date</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCC.target_date}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-slate-500 font-medium">Initiator / Department</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedCC.initiator}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Scope & Description</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  {selectedCC.description}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Business & Quality Justification</h4>
                <div className="p-3 bg-blue-50/50 border border-blue-200/70 rounded-lg text-slate-700 leading-relaxed">
                  {selectedCC.justification || 'No formal justification provided.'}
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Initiate Change Control (CC)</h3>
                <p className="text-xs text-slate-500">GMP Change Management Protocol</p>
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
                  Change Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upgrade Cooling Ramp in Crystallization Loop"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Change Category</label>
                  <select
                    value={formData.change_type}
                    onChange={(e) => setFormData({ ...formData, change_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Process">Process</option>
                    <option value="Document">Document</option>
                    <option value="Facility">Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impact Level</label>
                  <select
                    value={formData.impact_level}
                    onChange={(e) => setFormData({ ...formData, impact_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Major (Level 1)">Major (Level 1)</option>
                    <option value="Moderate (Level 2)">Moderate (Level 2)</option>
                    <option value="Minor (Level 3)">Minor (Level 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description of Change <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed description of what will be modified..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quality & Scientific Justification</label>
                <textarea
                  rows="2"
                  placeholder="Reason for change, benefits, risk analysis..."
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50/60 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="regulatory_impact"
                  checked={formData.regulatory_impact}
                  onChange={(e) => setFormData({ ...formData, regulatory_impact: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="regulatory_impact" className="text-slate-800 font-medium cursor-pointer">
                  Requires Regulatory Notification / DMF Variation
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initiator <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Chen (Process Eng)"
                    value={formData.initiator}
                    onChange={(e) => setFormData({ ...formData, initiator: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Implementation Date</label>
                  <input
                    type="date"
                    required
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
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
                  {isSubmitting ? 'Submitting...' : 'Submit for QA Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

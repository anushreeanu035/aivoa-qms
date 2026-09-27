import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  FileText,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  X,
  Layers,
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  FileCheck2,
  Building2,
  Download
} from 'lucide-react';
import {
  getDocumentsApi,
  createDocumentApi,
  updateDocumentApi,
  deleteDocumentApi,
} from '../services/api';
import { setToast, setModuleCounts } from '../store/deviationSlice';

export default function DocumentManagement() {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'SOP',
    version: '1.0',
    department: 'Quality Assurance',
    effective_date: new Date().toISOString().split('T')[0],
    review_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: 'Effective',
    author: '',
    summary: '',
    content: '',
  });

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocumentsApi({
        category: categoryFilter,
        department: departmentFilter,
        search: searchTerm,
      });
      setDocuments(data);
      dispatch(setModuleCounts({ documents: data.length }));
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to load documents: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [categoryFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleStatusChange = async (docId, newStatus) => {
    try {
      await updateDocumentApi(docId, { status: newStatus });
      dispatch(
        setToast({
          type: 'success',
          message: `Document status updated to "${newStatus}"`,
        })
      );
      loadDocuments();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Error updating status: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to retire/delete this controlled document?')) return;
    try {
      await deleteDocumentApi(docId);
      dispatch(
        setToast({
          type: 'info',
          message: 'Document record deleted.',
        })
      );
      loadDocuments();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to delete document: ' + (err.response?.data?.detail || err.message),
        })
      );
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert('Please fill in Title and Author');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDocumentApi(formData);
      dispatch(
        setToast({
          type: 'success',
          message: 'Controlled Document registered successfully!',
        })
      );
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        category: 'SOP',
        version: '1.0',
        department: 'Quality Assurance',
        effective_date: new Date().toISOString().split('T')[0],
        review_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        status: 'Effective',
        author: '',
        summary: '',
        content: '',
      });
      loadDocuments();
    } catch (err) {
      dispatch(
        setToast({
          type: 'error',
          message: 'Failed to create document: ' + (err.response?.data?.detail || err.message),
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = documents.length;
  const sopCount = documents.filter((d) => d.category === 'SOP').length;
  const specCount = documents.filter((d) => d.category === 'Specification').length;
  const bmrCount = documents.filter((d) => d.category === 'Batch Record').length;
  const polCount = documents.filter((d) => d.category === 'Policy').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Effective':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Draft':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Superseded':
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Document Management System (DMS)
              </h1>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Controlled SOP & Master Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard Operating Procedures (SOPs), analytical release specifications, batch manufacturing records (BMR), and quality policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh Documents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Document</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Documents</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Controlled QMS repository</div>
        </div>
        <div className="bg-white border border-blue-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">SOPs</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{sopCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Standard Operating Procedures</div>
        </div>
        <div className="bg-white border border-purple-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Specifications</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">{specCount}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Raw material & API limits</div>
        </div>
        <div className="bg-white border border-teal-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">Batch Records</div>
          <div className="text-2xl font-bold text-teal-800 mt-1">{bmrCount}</div>
          <div className="text-[10px] text-teal-600/80 mt-0.5">Master BMRs & protocols</div>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Policies</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{polCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Part 11 & Quality Standards</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {['All', 'SOP', 'Specification', 'Batch Record', 'Policy'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === tab
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Department Dropdown */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Production">Production</option>
            <option value="Engineering">Engineering</option>
          </select>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search doc #, title, keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Doc Number</th>
                <th className="py-3 px-4">Title & Scope</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading Documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No documents found matching search criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {doc.doc_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-800 line-clamp-1">{doc.title}</div>
                      {doc.summary && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.summary}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-700">
                      v{doc.version}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.department}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.effective_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={doc.status}
                        onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                          doc.status
                        )}`}
                      >
                        <option value="Effective">Effective</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Draft">Draft</option>
                        <option value="Superseded">Superseded</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          Read Document
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Document"
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
      {isDetailModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedDoc.doc_number}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Version {selectedDoc.version}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedDoc.status)}`}>
                    {selectedDoc.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <div className="text-slate-500 font-medium">Category</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDoc.category}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Department</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDoc.department}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Author / QP</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDoc.author}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Effective Date</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedDoc.effective_date}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Executive Summary</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  {selectedDoc.summary || 'No summary provided.'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Standard Operating Content / Instructions</h4>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedDoc.content || 'Content registered under document archive vault.'}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Controlled Document valid under 21 CFR Part 11 Electronic Records.</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">Next Review: {selectedDoc.review_date || '2027-01-01'}</span>
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
                <h3 className="text-base font-bold text-slate-900">Register Controlled Document</h3>
                <p className="text-xs text-slate-500">Quality Document Control System</p>
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
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleaning and Passivation of Synthesis Reactor R-101"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="SOP">SOP</option>
                    <option value="Specification">Specification</option>
                    <option value="Batch Record">Batch Record</option>
                    <option value="Policy">Policy</option>
                    <option value="Protocol">Protocol</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Production">Production</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Regulatory Affairs">Regulatory Affairs</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    required
                    placeholder="1.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Author / Qualified Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anushree S. (Lead QA)"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    required
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executive Summary / Scope</label>
                <textarea
                  rows="2"
                  placeholder="Summary of scope, applicability, and critical quality objectives..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Content / Procedures</label>
                <textarea
                  rows="4"
                  placeholder="Mandatory procedures, step-by-step instructions, acceptance criteria..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-[11px]"
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
                  {isSubmitting ? 'Registering...' : 'Authorize & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

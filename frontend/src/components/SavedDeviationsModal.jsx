import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSavedModalOpen, fetchDeviationsThunk, setActiveTab, setToast } from '../store/deviationSlice';
import {
  X,
  Database,
  Calendar,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
  FileCheck2
} from 'lucide-react';
import { createCapaFromDeviationApi } from '../services/api';

export default function SavedDeviationsModal() {
  const dispatch = useDispatch();
  const { savedModalOpen, savedList, savedListLoading } = useSelector(
    (state) => state.deviation
  );

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!savedModalOpen) return null;

  const filteredList = savedList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.batch_lot_number && item.batch_lot_number.toLowerCase().includes(term)) ||
      (item.site && item.site.toLowerCase().includes(term)) ||
      (item.initial_impact && item.initial_impact.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Saved Deviation Records (QMS Database)
              </h3>
              <p className="text-xs text-slate-500">
                Audited records stored in database table `deviations`
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchDeviationsThunk())}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${savedListLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                dispatch(setSavedModalOpen(false));
                setSelectedRecord(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, batch lot, plant, or impact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Modal Body: Split view if a record is selected, or table list */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Records List */}
          <div className={`overflow-y-auto ${selectedRecord ? 'w-1/2 border-r border-slate-100' : 'w-full'} p-4 space-y-2.5`}>
            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Database className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-medium">No deviation records found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Save a reviewed deviation from the intake form to see it listed here.
                </p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRecord?.id === item.id
                      ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-700">DEV-{String(item.id).padStart(4, '0')}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1.5">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    {item.batch_lot_number && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        Lot: {item.batch_lot_number}
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        item.initial_severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : item.initial_severity === 'Major'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.initial_severity || 'Major'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      {item.initial_impact || 'Product Quality'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Selected Record Detail View */}
          {selectedRecord && (
            <div className="w-1/2 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-blue-600">
                    DEV-{String(selectedRecord.id).padStart(4, '0')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedRecord.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close Detail
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Site / Plant</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.site || 'N/A'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Occurrence</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.date_of_occurrence || 'N/A'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Batch / Lot</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecord.batch_lot_number || 'N/A'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Source</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.source || 'N/A'}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200/60 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Detailed Description
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.detailed_description}
                </p>
              </div>

              {selectedRecord.severity_reason && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs">
                  <span className="font-semibold text-amber-900 block mb-0.5">
                    Severity Justification:
                  </span>
                  <p className="text-amber-800 leading-relaxed">
                    {selectedRecord.severity_reason}
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-500 space-y-1">
                <p>Status: <span className="font-semibold text-slate-800">{selectedRecord.status}</span></p>
                <p>AI Origin: <span className="font-semibold text-slate-800">{selectedRecord.ai_generated ? 'AI Intake Assisted' : 'Manual Entry'}</span></p>
                <p>Timestamp: <span className="font-mono">{selectedRecord.created_at}</span></p>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    try {
                      const newCapa = await createCapaFromDeviationApi(selectedRecord.id);
                      dispatch(
                        setToast({
                          type: 'success',
                          message: `CAPA ${newCapa.capa_number} initiated from Deviation DEV-${String(selectedRecord.id).padStart(4, '0')}!`,
                        })
                      );
                      dispatch(setSavedModalOpen(false));
                      dispatch(setActiveTab('CAPAs'));
                    } catch (err) {
                      dispatch(
                        setToast({
                          type: 'error',
                          message: 'Failed to initiate CAPA: ' + (err.response?.data?.detail || err.message),
                        })
                      );
                    }
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Initiate CAPA from this Deviation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

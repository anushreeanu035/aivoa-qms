import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSavedModalOpen, fetchDeviationsThunk, setActiveTab, setModuleCounts } from '../store/deviationSlice';
import {
  ShieldCheck,
  Bell,
  Database,
  ChevronDown,
  Sparkles,
  Layers,
  FileCheck2,
  AlertOctagon,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import {
  getHealthApi,
  getCapasApi,
  getChangeControlsApi,
  getAuditsApi,
  getDocumentsApi,
} from '../services/api';

export default function Navbar() {
  const dispatch = useDispatch();
  const { savedList, is_demo_mode, model_used, activeTab, moduleCounts } = useSelector((state) => state.deviation);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    dispatch(fetchDeviationsThunk());
    getHealthApi()
      .then((data) => setHealth(data))
      .catch((err) => console.log('Health check:', err));

    // Fetch initial counts for all modules
    Promise.all([
      getCapasApi('All').catch(() => []),
      getChangeControlsApi('All', 'All').catch(() => []),
      getAuditsApi('All', 'All').catch(() => []),
      getDocumentsApi({}).catch(() => []),
    ]).then(([capas, ccs, audits, docs]) => {
      dispatch(
        setModuleCounts({
          capas: capas.length,
          changeControls: ccs.length,
          audits: audits.length,
          documents: docs.length,
        })
      );
    });
  }, [dispatch]);

  const navItems = [
    { name: 'Dashboard', active: activeTab === 'Dashboard' },
    { name: 'Deviations', active: activeTab === 'Deviations', count: savedList.length },
    { name: 'CAPAs', active: activeTab === 'CAPAs', count: moduleCounts.capas },
    { name: 'Change Control', active: activeTab === 'Change Control', count: moduleCounts.changeControls },
    { name: 'Audits', active: activeTab === 'Audits', count: moduleCounts.audits },
    { name: 'Documents', active: activeTab === 'Documents', count: moduleCounts.documents },
    { name: 'Reports', active: activeTab === 'Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Banner / System Bar */}
      <div className="bg-[#0b1b33] text-slate-300 text-xs px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GMP Compliant QMS Environment
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">API Plant 01 • Sector 4 Production</span>
        </div>
        <div className="flex items-center gap-3">
          {health?.groq_configured ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Groq Llama 3.3 Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60" title="Set GROQ_API_KEY in backend/.env for live LLM">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Demo Mode (Mock AI)
            </span>
          )}
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">21 CFR Part 11 Validated</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div
            onClick={() => dispatch(setActiveTab('Dashboard'))}
            className="flex items-center gap-3 cursor-pointer select-none"
            title="Go to QMS Dashboard"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">AIVOA</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800">
                  QMS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">API Pharma Quality Suite</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => dispatch(setActiveTab(item.name))}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                  item.active
                    ? 'text-blue-700 bg-blue-50/80 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.name}
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                      item.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* View Saved Records Button */}
          <button
            onClick={() => {
              dispatch(fetchDeviationsThunk());
              dispatch(setSavedModalOpen(true));
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Database Records</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-slate-700 border border-slate-200 text-[10px] font-bold">
              {savedList.length}
            </span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-90">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold border border-slate-300">
              AS
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">Anushree S.</div>
              <div className="text-[10px] text-slate-500">Lead QA Specialist</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

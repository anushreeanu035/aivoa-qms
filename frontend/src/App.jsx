import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import DeviationForm from './components/DeviationForm';
import AIAssistant from './components/AIAssistant';
import SavedDeviationsModal from './components/SavedDeviationsModal';
import Toast from './components/Toast';
import DashboardView from './components/DashboardView';
import CapaManagement from './components/CapaManagement';
import ChangeControlManagement from './components/ChangeControlManagement';
import AuditManagement from './components/AuditManagement';
import DocumentManagement from './components/DocumentManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import { Sparkles, Info, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const { activeTab } = useSelector((state) => state.deviation);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'CAPAs':
        return <CapaManagement />;
      case 'Change Control':
        return <ChangeControlManagement />;
      case 'Audits':
        return <AuditManagement />;
      case 'Documents':
        return <DocumentManagement />;
      case 'Reports':
        return <ReportsAnalytics />;
      case 'Deviations':
      default:
        return (
          <div className="flex flex-col space-y-5">
            {/* Sub-Header / Workflow Guidance Banner */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Intake & Triage Workflow
                    </h2>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Step 1: Intake Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI extracts incident parameters from documents or notes to auto-populate the form. Review and edit before saving.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <span className="font-semibold text-slate-700">Workflow:</span>
                <span>Upload / Paste</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-blue-600 font-semibold">AI Analyze</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>Auto-Populate Form</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>Human Review</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-emerald-700 font-semibold">Save to QMS</span>
              </div>
            </div>

            {/* Two-Column Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Log Deviation Form (7 cols on desktop) */}
              <section className="lg:col-span-7 h-[calc(100vh-210px)] min-h-[640px]">
                <DeviationForm />
              </section>

              {/* Right Column: AI Deviation Assistant (5 cols on desktop) */}
              <section className="lg:col-span-5 h-[calc(100vh-210px)] min-h-[640px]">
                <AIAssistant />
              </section>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-6">
        {renderActiveView()}
      </main>

      {/* Global Modals & Notifications */}
      <SavedDeviationsModal />
      <Toast />
    </div>
  );
}

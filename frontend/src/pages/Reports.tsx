import React from "react";
import { FileText, Printer, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Reports: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-400" />
            Clinical Consultation Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Export structured telemetry summaries for dermatologists, physicians, and health records.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Report Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              HyperTrack Clinical Telemetry Summary
            </span>
            <h2 className="text-lg font-bold text-white">Patient Record: {user?.displayName || "Anonymous User"}</h2>
            <p className="text-xs text-slate-400 font-mono">UID: {user?.uid}</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p className="text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> HIPAA/Telemetry Compliant
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Diagnostic Focus</span>
            <p className="font-semibold text-white">Primary Focal Hyperhidrosis (Palmar / Plantar / Axillary)</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Telemetry Period</span>
            <p className="font-semibold text-white">Last 30 Days (Continuous Capture)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

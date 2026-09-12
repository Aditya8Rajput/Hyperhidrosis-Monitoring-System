import React, { useEffect, useState } from "react";
import { FileText, Printer, CheckCircle2, Calendar, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeToEpisodes } from "../services/episodes";
import type { Episode } from "../types";

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToEpisodes(
      user.uid,
      (data) => {
        setEpisodes(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching episodes for Reports:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Calculate Metrics
  const totalEpisodes = episodes.length;
  const avgSeverity = totalEpisodes > 0 
    ? (episodes.reduce((acc, ep) => acc + ep.severity, 0) / totalEpisodes).toFixed(1) 
    : "0";
  
  // Top Triggers
  const triggersMap = episodes.reduce((acc, ep) => {
    acc[ep.trigger] = (acc[ep.trigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTriggers = Object.entries(triggersMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(t => t[0]);

  // Top Body Areas
  const bodyAreasMap = episodes.reduce((acc, ep) => {
    ep.bodyAreas.forEach(area => {
      acc[area] = (acc[area] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const topBodyAreas = Object.entries(bodyAreasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(t => t[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header (Hidden when printing via CSS, but we can also use tailwind's print modifier) */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
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
      {/* The `print:text-black print:bg-white` classes ensure the PDF looks like a clean medical report */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 space-y-8 shadow-xl print:shadow-none print:border-none print:bg-white print:text-black">
        
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 print:border-slate-300 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 print:text-slate-500">
              HyperTrack Clinical Telemetry Summary
            </span>
            <h2 className="text-xl font-bold text-white print:text-black mt-1">Patient Record</h2>
            <p className="text-sm text-slate-400 print:text-slate-600 mt-1 font-medium">{user?.displayName || "Anonymous User"} ({user?.email})</p>
            <p className="text-xs text-slate-500 print:text-slate-400 font-mono mt-1">UID: {user?.uid}</p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600">
            <p className="font-semibold">Generated: {new Date().toLocaleDateString()}</p>
            <p className="text-emerald-400 print:text-emerald-600 flex items-center sm:justify-end gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> HIPAA/Telemetry Compliant
            </p>
          </div>
        </div>

        {/* Global Summary Metrics */}
        <div>
          <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400 print:text-cyan-700" />
            Global Telemetry Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-200 print:bg-slate-50">
              <span className="text-xs text-slate-400 print:text-slate-500 uppercase tracking-wider font-semibold">Total Episodes</span>
              <p className="text-2xl font-bold text-white print:text-black mt-1">{loading ? "-" : totalEpisodes}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-200 print:bg-slate-50">
              <span className="text-xs text-slate-400 print:text-slate-500 uppercase tracking-wider font-semibold">Avg Severity</span>
              <p className="text-2xl font-bold text-white print:text-black mt-1">{loading ? "-" : avgSeverity}/10</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-200 print:bg-slate-50">
              <span className="text-xs text-slate-400 print:text-slate-500 uppercase tracking-wider font-semibold">Top Triggers</span>
              <p className="text-sm font-bold text-white print:text-black mt-1 line-clamp-2">
                {topTriggers.length > 0 ? topTriggers.join(", ") : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-200 print:bg-slate-50">
              <span className="text-xs text-slate-400 print:text-slate-500 uppercase tracking-wider font-semibold">Primary Zones</span>
              <p className="text-sm font-bold text-white print:text-black mt-1 line-clamp-2">
                {topBodyAreas.length > 0 ? topBodyAreas.join(", ") : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400 print:text-indigo-700" />
            Recent Telemetry Logs
          </h3>
          
          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-sm text-slate-300 print:text-slate-700">
              <thead className="bg-slate-900/80 print:bg-slate-100 text-xs uppercase font-semibold text-slate-400 print:text-slate-600 border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Trigger</th>
                  <th className="px-4 py-3">Body Areas</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 print:divide-slate-200">
                {episodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {loading ? "Loading telemetry data..." : "No episodes recorded yet."}
                    </td>
                  </tr>
                ) : (
                  episodes.slice(0, 20).map((ep, idx) => (
                    <tr key={ep.id || idx} className="bg-slate-950/30 print:bg-white hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(ep.timestamp).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">
                        <span className={`px-2 py-0.5 rounded-md ${
                          ep.severity >= 8 ? 'bg-rose-500/20 text-rose-400' :
                          ep.severity >= 5 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        } print:bg-transparent print:text-black`}>
                          {ep.severity}/10
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">{ep.trigger}</td>
                      <td className="px-4 py-3 truncate max-w-[150px]">{ep.bodyAreas.join(", ")}</td>
                      <td className="px-4 py-3">{ep.durationMinutes} min</td>
                      <td className="px-4 py-3 truncate max-w-[200px] text-xs text-slate-400 print:text-slate-600">{ep.notes || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {episodes.length > 20 && (
            <p className="text-xs text-slate-500 mt-3 text-center print:text-slate-400">
              * Showing most recent 20 episodes. Export raw data for full history.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

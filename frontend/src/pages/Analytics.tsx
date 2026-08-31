import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import type { Episode } from "../types";
import {
  BarChart3,
  TrendingUp,
  Zap,
  MapPin,
  AlertCircle,
} from "lucide-react";

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const q = query(collection(db, "episodes"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const list: Episode[] = [];
        snapshot.forEach((d) => list.push(d.data() as Episode));
        setEpisodes(list);
      } catch (err) {
        console.warn("Could not fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  // Aggregate stats
  const triggerStats: Record<string, number> = {};
  const areaStats: Record<string, number> = {};
  const severityBuckets = { mild: 0, moderate: 0, severe: 0 };

  episodes.forEach((ep) => {
    if (ep.trigger) triggerStats[ep.trigger] = (triggerStats[ep.trigger] || 0) + 1;
    if (Array.isArray(ep.bodyAreas)) {
      ep.bodyAreas.forEach((a) => (areaStats[a] = (areaStats[a] || 0) + 1));
    }
    if (ep.severity <= 3) severityBuckets.mild += 1;
    else if (ep.severity <= 6) severityBuckets.moderate += 1;
    else severityBuckets.severe += 1;
  });

  const maxTriggerCount = Math.max(...Object.values(triggerStats), 1);
  const maxAreaCount = Math.max(...Object.values(areaStats), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          Biometric & Trigger Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Quantitative telemetry correlation across environmental, psychological, and physiological variables.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : episodes.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <AlertCircle className="w-8 h-8 text-cyan-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Telemetry Recorded</h3>
          <p className="text-xs text-slate-400">
            Log hyperhidrosis episodes to generate full frequency, distribution, and severity analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trigger Frequency Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Trigger Distribution</h3>
                  <p className="text-[11px] text-slate-400">Identified episode catalysts</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(triggerStats)
                .sort((a, b) => b[1] - a[1])
                .map(([trig, count]) => {
                  const percentage = Math.round((count / maxTriggerCount) * 100);
                  return (
                    <div key={trig} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-200">
                        <span>{trig}</span>
                        <span className="font-mono text-purple-400">
                          {count} logs ({Math.round((count / episodes.length) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Affected Body Areas Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Body Area Heatmap</h3>
                  <p className="text-[11px] text-slate-400">Anatomical distribution</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(areaStats)
                .sort((a, b) => b[1] - a[1])
                .map(([area, count]) => {
                  const percentage = Math.round((count / maxAreaCount) * 100);
                  return (
                    <div key={area} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-200">
                        <span>{area}</span>
                        <span className="font-mono text-emerald-400">{count} times</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Severity Categorization</h3>
                <p className="text-[11px] text-slate-400">Total volume grouped by intensity tier</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-center">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Mild (1–3)
                </span>
                <p className="text-2xl font-extrabold text-white">{severityBuckets.mild}</p>
                <p className="text-[10px] text-slate-400">
                  {Math.round((severityBuckets.mild / episodes.length) * 100 || 0)}% of episodes
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-center">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Moderate (4–6)
                </span>
                <p className="text-2xl font-extrabold text-white">{severityBuckets.moderate}</p>
                <p className="text-[10px] text-slate-400">
                  {Math.round((severityBuckets.moderate / episodes.length) * 100 || 0)}% of episodes
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-center">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Severe (7–10)
                </span>
                <p className="text-2xl font-extrabold text-white">{severityBuckets.severe}</p>
                <p className="text-[10px] text-slate-400">
                  {Math.round((severityBuckets.severe / episodes.length) * 100 || 0)}% of episodes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

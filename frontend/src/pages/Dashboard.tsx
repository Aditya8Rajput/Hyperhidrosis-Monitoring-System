import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subscribeToEpisodes } from "../services/episodes";
import type { Episode, AnalyticsSummary } from "../types";
import {
  Activity,
  PlusCircle,
  BarChart3,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalEpisodes: 0,
    avgSeverity: 0,
    avgDuration: 0,
    topTrigger: "None",
    topBodyArea: "None",
  });

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const unsubscribe = subscribeToEpisodes(
      user.uid,
      (list) => {
        setEpisodes(list);

        const triggerCounts: Record<string, number> = {};
        const areaCounts: Record<string, number> = {};
        let totalSev = 0;
        let totalDur = 0;

        list.forEach((data) => {
          totalSev += data.severity || 0;
          totalDur += data.durationMinutes || 0;

          if (data.trigger) {
            triggerCounts[data.trigger] = (triggerCounts[data.trigger] || 0) + 1;
          }
          if (Array.isArray(data.bodyAreas)) {
            data.bodyAreas.forEach((area) => {
              areaCounts[area] = (areaCounts[area] || 0) + 1;
            });
          }
        });

        const count = list.length;
        if (count > 0) {
          const topTrig = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
          const topArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

          setSummary({
            totalEpisodes: count,
            avgSeverity: parseFloat((totalSev / count).toFixed(1)),
            avgDuration: Math.round(totalDur / count),
            topTrigger: topTrig,
            topBodyArea: topArea,
          });
        } else {
          setSummary({
            totalEpisodes: 0,
            avgSeverity: 0,
            avgDuration: 0,
            topTrigger: "None",
            topBodyArea: "None",
          });
        }
        setLoading(false);
      },
      () => setLoading(false),
      20
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-900/90 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Real-Time Telemetry & Sync
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.displayName || "HyperTrack User"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track episodes in seconds, monitor environmental correlations, and gain predictive insights for hyperhidrosis management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/log"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Episode</span>
            </Link>
            <Link
              to="/analytics"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-xs sm:text-sm transition flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>View Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Episodes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Recorded</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : summary.totalEpisodes}
            </span>
            <span className="text-xs text-slate-500">episodes</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Firestore sync
          </p>
        </div>

        {/* Average Severity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Severity</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : summary.avgSeverity > 0 ? `${summary.avgSeverity}` : "—"}
            </span>
            <span className="text-xs text-slate-500">/ 10 scale</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.avgSeverity <= 3
              ? "Mild range overall"
              : summary.avgSeverity <= 6
              ? "Moderate baseline"
              : "High intensity alerts"}
          </p>
        </div>

        {/* Average Duration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Duration</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? "..." : summary.avgDuration > 0 ? `${summary.avgDuration}` : "—"}
            </span>
            <span className="text-xs text-slate-500">minutes</span>
          </div>
          <p className="text-[11px] text-cyan-400/90 font-medium">Session average</p>
        </div>

        {/* Top Trigger */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top Catalyst</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white tracking-tight truncate">
              {loading ? "..." : summary.topTrigger}
            </span>
          </div>
          <p className="text-[11px] text-purple-400/90 font-medium truncate">
            Primary trigger pattern
          </p>
        </div>
      </div>

      {/* Recent Episodes & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Episodes (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Episodes</h2>
              <p className="text-xs text-slate-400">Chronological list of latest recorded events</p>
            </div>
            <Link
              to="/history"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : episodes.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-xl">
              <Activity className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No episodes logged yet.</p>
              <Link
                to="/log"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Log First Episode
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {episodes.slice(0, 5).map((ep) => {
                const isMild = ep.severity <= 3;
                const isMod = ep.severity > 3 && ep.severity <= 6;
                return (
                  <div
                    key={ep.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                          isMild
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : isMod
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {ep.severity}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {ep.trigger || "Unspecified"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {ep.bodyAreas?.join(", ") || "General"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(ep.timestamp).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span>&bull;</span>
                          <span>{ep.durationMinutes} mins</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
                      <span className="text-[11px] font-mono text-slate-400">
                        Stress: {ep.stressLevel}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI & Pro Insights Promo (1 Col) */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Pattern Intelligence</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              HyperTrack machine learning models analyze weather, ambient humidity, stress levels, and historical data to forecast flare-up probabilities.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Model Confidence</span>
                <span className="text-emerald-400 font-mono">94.2%</span>
              </div>
              <p className="text-[10px] text-slate-500">Correlation engine active</p>
            </div>

            <Link
              to="/insights"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore AI Insights</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

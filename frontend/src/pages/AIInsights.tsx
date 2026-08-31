import React from "react";
import { Sparkles, Brain, Cpu } from "lucide-react";

export const AIInsights: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Neural Predictive Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Insights & Forecasts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Machine learning correlations powered by scikit-learn & telemetry models.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Key Correlation Detected</h3>
              <span className="text-xs text-indigo-300 font-mono">High Confidence (91.4%)</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Episodes involving <strong className="text-white">Social Anxiety</strong> and <strong className="text-white">Stress</strong> show a 78% higher severity spike when ambient temperature exceeds 23.5°C.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            💡 Recommended Action: Pre-cooling or autonomic regulation techniques 15 mins prior to scheduled social engagements.
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Circadian Flare-Up Pattern</h3>
              <span className="text-xs text-cyan-300 font-mono">Peak Vulnerability</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Data reveals a cluster of severity 6+ episodes occurring between <strong className="text-white">10:00 AM – 12:30 PM</strong>, corresponding to peak desk/work transitions.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            💡 Recommended Action: Evaluate caffeine timing and hydration levels before mid-morning sprint cycles.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { logEpisode } from "../services/episodes";
import type { BodyAreaOption, TriggerOption, ActivityOption } from "../types";
import {
  Flame,
  Activity,
  Thermometer,
  Droplets,
  Clock,
  Zap,
  CheckCircle2,
  FileText,
  Sparkles,
  MapPin,
} from "lucide-react";

const BODY_AREAS: BodyAreaOption[] = [
  "Palms",
  "Feet",
  "Underarms",
  "Face",
  "Scalp",
  "Back",
  "Chest",
  "Other",
];

const TRIGGERS: TriggerOption[] = [
  "Stress",
  "Heat",
  "Exercise",
  "Caffeine",
  "Spicy Food",
  "Social Anxiety",
  "Unknown",
  "Other",
];

const ACTIVITIES: ActivityOption[] = [
  "Working / Desk",
  "Resting / Relaxing",
  "Exercising / Active",
  "Socializing / Meeting",
  "Commuting / Driving",
  "Sleeping / Waking",
  "Other",
];

const DURATION_PRESETS = [10, 15, 30, 45, 60, 90, 120];

export const LogEpisode: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [severity, setSeverity] = useState<number>(5);
  const [bodyAreas, setBodyAreas] = useState<string[]>(["Palms"]);
  const [trigger, setTrigger] = useState<string>("Stress");
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [activity, setActivity] = useState<string>("Working / Desk");
  const [temperature, setTemperature] = useState<string>("");
  const [humidity, setHumidity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper for dynamic severity color grading
  const getSeverityStyles = (val: number) => {
    if (val <= 3) {
      return {
        bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        pillActive: "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30",
        label: "Mild Episode",
        colorClass: "text-emerald-400",
        barColor: "from-emerald-500 to-teal-400",
      };
    }
    if (val <= 6) {
      return {
        bg: "bg-amber-500/20 text-amber-400 border-amber-500/40",
        pillActive: "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30",
        label: "Moderate Episode",
        colorClass: "text-amber-400",
        barColor: "from-amber-500 to-orange-400",
      };
    }
    return {
      bg: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      pillActive: "bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/30",
      label: "Severe Episode",
      colorClass: "text-rose-400",
      barColor: "from-rose-500 to-red-600",
    };
  };

  const currentSeverityStyle = getSeverityStyles(severity);

  // Toggle multi-select body area
  const toggleBodyArea = (area: string) => {
    if (bodyAreas.includes(area)) {
      if (bodyAreas.length === 1) {
        showToast("info", "Requirement", "At least one body area must be selected.");
        return;
      }
      setBodyAreas(bodyAreas.filter((a) => a !== area));
    } else {
      setBodyAreas([...bodyAreas, area]);
    }
  };

  // Reset form
  const resetForm = () => {
    setSeverity(5);
    setBodyAreas(["Palms"]);
    setTrigger("Stress");
    setStressLevel(5);
    setDurationMinutes(30);
    setActivity("Working / Desk");
    setTemperature("");
    setHumidity("");
    setNotes("");
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      showToast("error", "Unauthorized", "Please sign in to record an episode.");
      return;
    }

    if (bodyAreas.length === 0) {
      showToast("warning", "Missing Data", "Please select at least one affected body area.");
      return;
    }

    setIsSubmitting(true);

    try {
      const episodeData = {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        severity: Number(severity),
        bodyAreas,
        durationMinutes: Number(durationMinutes) || 15,
        trigger,
        stressLevel: Number(stressLevel),
        activity,
        temperature: temperature ? Number(temperature) : undefined,
        humidity: humidity ? Number(humidity) : undefined,
        notes: notes.trim() || "",
      };

      const docRef = await logEpisode(episodeData);
      console.log("Saved episode ID:", docRef.id);

      showToast(
        "success",
        "Episode Logged Successfully",
        `Recorded level ${severity} episode for ${bodyAreas.join(", ")}.`
      );

      resetForm();
    } catch (err: unknown) {
      console.error("Failed to write episode:", err);
      // Fallback message
      const msg = err instanceof Error ? err.message : "Failed to record episode to Firestore.";
      showToast("error", "Logging Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Active Logging Session
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Log Hyperhidrosis Episode
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Capture biometric metrics, triggers, and environmental parameters for analytics and AI forecasting.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. SEVERITY SCALE (1-10) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${currentSeverityStyle.bg}`}>
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Episode Severity Level
                </h2>
                <p className="text-xs text-slate-400">
                  Rate intensity on dynamic 1–10 scale (1 = Light, 10 = Maximum)
                </p>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-2 ${currentSeverityStyle.bg}`}>
              <span className="text-lg">{severity}</span>
              <span className="opacity-80">/ 10</span>
              <span className="hidden sm:inline-block ml-1 text-xs uppercase tracking-wider">
                ({currentSeverityStyle.label})
              </span>
            </div>
          </div>

          {/* Interactive Scale Pill Selector */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
              const isSelected = severity === val;
              const style = getSeverityStyles(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSeverity(val)}
                  className={`h-12 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center border ${
                    isSelected
                      ? style.pillActive
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span>{val}</span>
                  <span className="text-[9px] font-normal opacity-70">
                    {val <= 3 ? "Mild" : val <= 6 ? "Mod" : "Sev"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Continuous Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              aria-label="Severity slider"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-400">1: Minimal dampness</span>
              <span className="text-amber-400">5: Moderate sweating</span>
              <span className="text-rose-400">10: Profuse / Dripping</span>
            </div>
          </div>
        </section>

        {/* 2. BODY AREAS (MULTI-SELECT PILL ARRAY) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 space-y-5 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Affected Body Areas
              </h2>
              <p className="text-xs text-slate-400">
                Multi-select all areas experiencing hyperhidrosis in this episode
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {BODY_AREAS.map((area) => {
              const isSelected = bodyAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleBodyArea(area)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-2 ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{area}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. TRIGGER & STRESS LEVEL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trigger Selector */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Primary Trigger</h2>
                <p className="text-[11px] text-slate-400">Select identified catalyst</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TRIGGERS.map((t) => {
                const isSelected = trigger === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrigger(t)}
                    className={`p-3 rounded-xl text-xs font-semibold transition border text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{t}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Stress Level Slider */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl border bg-rose-500/20 text-rose-400 border-rose-500/30">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Stress Level</h2>
                    <p className="text-[11px] text-slate-400">Perceived cognitive or emotional load</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {stressLevel} / 10
                </span>
              </div>

              <div className="mt-6 space-y-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  aria-label="Stress level slider"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>1 (Completely Relaxed)</span>
                  <span>10 (Severe Acute Stress)</span>
                </div>
              </div>
            </div>

            {/* Stress level readout */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
              {stressLevel <= 3 && "🟢 Low psychological stress reported."}
              {stressLevel > 3 && stressLevel <= 7 && "🟡 Moderate mental/emotional tension noted."}
              {stressLevel > 7 && "🔴 High stress environment - key compounding trigger."}
            </div>
          </section>
        </div>

        {/* 4. DURATION & ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duration */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Estimated Duration</h2>
                <p className="text-[11px] text-slate-400">Total duration in minutes</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    durationMinutes === dur
                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                placeholder="Custom duration in minutes"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                minutes
              </span>
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border bg-teal-500/20 text-teal-400 border-teal-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Current Activity</h2>
                <p className="text-[11px] text-slate-400">Context when episode began</p>
              </div>
            </div>

            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            >
              {ACTIVITIES.map((act) => (
                <option key={act} value={act} className="bg-slate-900 text-white">
                  {act}
                </option>
              ))}
            </select>
          </section>
        </div>

        {/* 5. ENVIRONMENTAL INPUTS (OPTIONAL) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 space-y-5 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl border bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Environmental Metrics
                </h2>
                <p className="text-xs text-slate-400">
                  Optional ambient parameters for correlation analytics
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Ambient Temperature (°C)
              </label>
              <div className="relative">
                <Thermometer className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 24.5"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Relative Humidity (%)
              </label>
              <div className="relative">
                <Droplets className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  placeholder="e.g. 65"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. NOTES (OPTIONAL) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-purple-500/20 text-purple-400 border-purple-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Observational Notes</h2>
              <p className="text-xs text-slate-400">
                Add any subjective feelings, interventions used, or specifics
              </p>
            </div>
          </div>

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Occurred right before high-stakes presentation. Applied antiperspirant 2 hours prior."
            className="w-full p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </section>

        {/* SUBMIT BUTTON BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Episode to Firestore</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

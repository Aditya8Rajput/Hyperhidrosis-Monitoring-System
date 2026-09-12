import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { subscribeToEpisodes, removeEpisode } from "../services/episodes";
import type { Episode } from "../types";
import {
  History as HistoryIcon,
  Filter,
  Trash2,
  Calendar,
  Thermometer,
  Droplets,
  Zap,
  Clock,
  Search,
} from "lucide-react";

export const History: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTrigger, setFilterTrigger] = useState<string>("All");

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const unsubscribe = subscribeToEpisodes(
      user.uid,
      (list) => {
        setEpisodes(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this episode record?")) return;
    try {
      await removeEpisode(id);
      showToast("info", "Deleted", "Episode removed from history.");
    } catch (err) {
      showToast("error", "Delete Failed", "Could not remove episode.");
    }
  };

  const filtered = episodes.filter((ep) => {
    const matchesSearch =
      (ep.trigger && ep.trigger.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ep.activity && ep.activity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ep.bodyAreas && ep.bodyAreas.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (ep.notes && ep.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTrigger = filterTrigger === "All" || ep.trigger === filterTrigger;
    return matchesSearch && matchesTrigger;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-7 h-7 text-emerald-400" />
            Episode History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and inspect all historical hyperhidrosis telemetry logs.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search triggers, areas, notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterTrigger}
            onChange={(e) => setFilterTrigger(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Triggers</option>
            <option value="Stress">Stress</option>
            <option value="Heat">Heat</option>
            <option value="Exercise">Exercise</option>
            <option value="Caffeine">Caffeine</option>
            <option value="Spicy Food">Spicy Food</option>
            <option value="Social Anxiety">Social Anxiety</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      {/* Episodes List */}
      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <p className="text-sm text-slate-400">No episodes match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ep) => {
            const isMild = ep.severity <= 3;
            const isMod = ep.severity > 3 && ep.severity <= 6;
            return (
              <div
                key={ep.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl hover:border-slate-700/80 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${
                        isMild
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : isMod
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                          : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {ep.severity}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          {ep.trigger}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {ep.activity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(ep.timestamp).toLocaleString()}
                        <span>&bull;</span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        {ep.durationMinutes} mins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Stress: {ep.stressLevel}/10
                    </span>
                    {ep.id && (
                      <button
                        onClick={() => handleDelete(ep.id!)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete episode"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body areas & environmental pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-500 font-medium">Areas:</span>
                  {ep.bodyAreas?.map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
                    >
                      {b}
                    </span>
                  ))}

                  {(ep.temperature !== undefined && ep.temperature !== null) && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {ep.temperature}°C
                    </span>
                  )}

                  {(ep.humidity !== undefined && ep.humidity !== null) && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      {ep.humidity}%
                    </span>
                  )}
                </div>

                {ep.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 italic">
                    "{ep.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

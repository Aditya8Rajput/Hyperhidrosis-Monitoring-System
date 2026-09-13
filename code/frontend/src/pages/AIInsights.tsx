import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Brain, Cpu, MessageSquare, Send, Loader2, ShieldAlert, Activity } from "lucide-react";
import { subscribeToEpisodes } from "../services/episodes";
import type { Episode } from "../types";
import { useAuth } from "../context/AuthContext";

export const AIInsights: React.FC = () => {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to episodes
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToEpisodes(
      user.uid,
      (data) => setEpisodes(data),
      (error) => console.error("Error fetching episodes for AI:", error)
    );
    return () => unsubscribe();
  }, [user]);

  // Generate Insights when episodes change
  useEffect(() => {
    if (episodes.length === 0) return;

    const fetchInsights = async () => {
      setInsightsLoading(true);
      setInsightsError("");
      try {
        // Use relative URL — Vite proxy forwards /api → http://localhost:8000
        const response = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(episodes)
        });

        if (!response.ok) {
          // Parse the exact server error detail for display
          const errData = await response.json().catch(() => ({})) as { detail?: string };
          const errMsg = errData.detail || `Server error ${response.status}: ${response.statusText}`;
          console.error("[AIInsights] Insights server error:", response.status, errData);
          throw new Error(errMsg);
        }

        const data = await response.json();
        setInsights(data);
      } catch (err: any) {
        console.error("[AIInsights] fetchInsights exception:", err);
        setInsightsError(err.message || "Error generating insights.");
      } finally {
        setInsightsLoading(false);
      }
    };

    // Debounce to avoid hammering API on rapid episode updates
    const timer = setTimeout(() => {
      fetchInsights();
    }, 1000);

    return () => clearTimeout(timer);
  }, [episodes]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  const handleSendMessage = async (msg: string = chatInput) => {
    if (!msg.trim() || chatLoading) return;

    const newChatHistory = [...chatHistory, { role: 'user' as const, content: msg }];
    setChatHistory(newChatHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      // Use relative URL — Vite proxy forwards /api → http://localhost:8000
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: msg,
          episodeHistory: episodes
        })
      });

      if (!response.ok) {
        // Parse the exact server error detail to surface in the chat UI
        const errData = await response.json().catch(() => ({})) as { detail?: string };
        const errMsg = errData.detail || `Server error ${response.status}: ${response.statusText}`;
        console.error("[AIInsights] Chat server error:", response.status, errData);
        throw new Error(errMsg);
      }

      const data = await response.json();
      setChatHistory([...newChatHistory, { role: 'ai', content: data.answer }]);
    } catch (err: any) {
      console.error("[AIInsights] Chat exception:", err);
      // Show the actual error message in the chat bubble — not a generic fallback
      const displayMsg = err.message || "Error: Could not connect to HyperTrack AI.";
      setChatHistory([...newChatHistory, { role: 'ai', content: `⚠️ ${displayMsg}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 2.5 Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Insights & Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized telemetry analysis and contextual Q&A powered by Google Gemini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Chat Assistant */}
        <div className="flex flex-col h-[600px] rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white">HyperTrack Copilot</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">
                <Brain className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                <p>Ask me about your triggers, patterns, or how to prepare for an upcoming event.</p>
                
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["Why am I sweating more this week?", "Analyze my triggers", "Tips for public speaking"].map((q) => (
                    <button 
                      key={q} 
                      onClick={() => handleSendMessage(q)}
                      className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-cyan-300 hover:bg-slate-700 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-cyan-950/50 text-cyan-50 border border-cyan-800/50 rounded-br-sm' : 'bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your telemetry..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-500"
              />
              <button 
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Telemetry Breakdown */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 backdrop-blur-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">AI Clinical Summary</h3>
            </div>
            
            {insightsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                <div className="h-4 bg-slate-800 rounded w-4/6"></div>
              </div>
            ) : insightsError ? (
              <p className="text-red-400 text-sm">{insightsError}</p>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed">
                {insights?.summary || "Insufficient telemetry data. Log more episodes to generate a personalized clinical summary."}
              </p>
            )}
          </div>

          {/* Key Patterns */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Detected Pattern Badges
            </h3>
            
            {insightsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
                <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
              </div>
            ) : insights?.keyPatterns?.length > 0 ? (
              <div className="space-y-3">
                {insights.keyPatterns.map((pattern: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    {pattern}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No distinct patterns identified yet.</p>
            )}
          </div>

          {/* Preventative Recommendations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Actionable Preventative Tips
            </h3>
            
            {insightsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
                <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
              </div>
            ) : insights?.preventativeTips?.length > 0 ? (
              <div className="space-y-3">
                {insights.preventativeTips.map((tip: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-sm text-emerald-100">
                    💡 {tip}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Recommendations will appear here as you log more data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

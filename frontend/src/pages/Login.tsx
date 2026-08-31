import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Activity, Lock, Mail, User, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, loginDemoUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("warning", "Missing Fields", "Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signup(email, password, displayName || undefined);
        showToast("success", "Account Created", "Welcome to HyperTrack!");
      } else {
        await login(email, password);
        showToast("success", "Signed In", "Welcome back to your HyperTrack dashboard.");
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      let message = "Authentication failed. Please try again.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Invalid email or password. Please verify your credentials.";
      } else if (error.code === "auth/email-already-in-use") {
        message = "An account with this email already exists. Try signing in.";
      } else if (error.code === "auth/weak-password") {
        message = "Password must be at least 6 characters long.";
      } else if (error.message) {
        message = error.message;
      }
      showToast("error", isSignUp ? "Sign Up Error" : "Sign In Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemoUser();
    showToast("info", "Demo Mode Active", "Logged in as Alex Mercer (Demo User).");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/20 mb-2">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            HyperTrack
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Intelligent Hyperhidrosis Tracking & Analytics
          </p>
        </div>

        {/* Glassmorphic Auth Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@hypertrack.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Sign Up" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0e1320] px-3 text-[10px] uppercase font-semibold tracking-wider text-slate-500">
              or instant access
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 hover:border-emerald-500/40 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span>Launch Quick Demo Mode</span>
          </button>
        </div>

        {/* Security / Info Badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by Firebase Authentication & Firestore</span>
        </div>
      </div>
    </div>
  );
};

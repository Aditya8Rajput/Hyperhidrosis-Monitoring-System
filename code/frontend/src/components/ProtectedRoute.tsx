import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity } from "lucide-react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center gap-4 p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 opacity-30 blur-sm animate-ping" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-white tracking-wide">Authenticating HyperTrack</h3>
            <p className="text-xs text-slate-400">Verifying secure credentials & profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

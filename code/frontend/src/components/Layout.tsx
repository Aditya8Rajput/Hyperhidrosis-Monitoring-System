import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Sparkles,
  FileText,
  LogOut,
  Menu,
  X,
  Activity,
  Radio,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Log Episode", path: "/log", icon: PlusCircle, badge: "New" },
  { name: "History", path: "/history", icon: History },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "AI Insights", path: "/insights", icon: Sparkles, badge: "Pro" },
  { name: "Reports", path: "/reports", icon: FileText },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const currentNav = navItems.find((item) => item.path === location.pathname) || {
    name: "Overview",
    path: "/",
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-[#0c101c]/80 backdrop-blur-xl">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand + Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  HyperTrack
                </span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase -mt-0.5">
                  Telemetry Core
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Breadcrumb (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span>HyperTrack</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-medium text-slate-200">{currentNav.name}</span>
          </div>

          {/* Right: Quick Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Realtime Telemetry Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              <span>Live Engine</span>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight max-w-[120px] truncate">
                    {user?.displayName || "User Profile"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight max-w-[120px] truncate font-mono">
                    {user?.email || user?.uid?.substring(0, 10)}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#0f1523] backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user?.displayName || "Logged In User"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                        {user?.email || user?.uid}
                      </p>
                    </div>

                    <div className="p-1 space-y-1">
                      <Link
                        to="/log"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        Log New Episode
                      </Link>
                      <Link
                        to="/analytics"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                      >
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        View Analytics
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-800/80">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* App Body (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col shrink-0 border-r border-slate-800/80 bg-[#090d18]/70 backdrop-blur-xl p-4 justify-between">
          <div className="space-y-6">
            <div className="px-3 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Navigation
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent border border-emerald-500/30 text-white shadow-lg shadow-emerald-950/40"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.badge === "New"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Widget */}
          <div className="p-3.5 rounded-xl border border-slate-800/90 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Telemetry Status</span>
              <span className="text-emerald-400 font-mono">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] text-slate-500">
              HyperTrack v1.0.0 Phase 2 Architecture
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#070a12]/95 backdrop-blur-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">HyperTrack Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-emerald-400" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#070a12] p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full pb-16">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <nav className="lg:hidden sticky bottom-0 z-30 border-t border-slate-800/80 bg-[#0a0e1a]/95 backdrop-blur-xl px-2 py-2 flex justify-around">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition ${
                isActive ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

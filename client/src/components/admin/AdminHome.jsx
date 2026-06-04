import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Vote,
  LogOut,
  Bell,
  X,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Settings,
  Trophy,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import LogoutConfirmModal from "../common/LogoutConfirmModal";

// Import child components (all existing ones)
import DashboardOverview from "./DashboardOverview";
import UserManager from "./UserManager";
import CandidateManager from "./CandidateManager";
import ElectionManager from "./ElectionManager";
import FinanceView from "./FinanceView";
import AuditLogs from "./AuditLogs";
import SystemSettings from "./SystemSettings";
import Leaderboard from "./Leaderboard";

const AdminHome = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Expanded menu with all sections
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "users", label: "Users", icon: Users },
    { id: "candidates", label: "Candidates", icon: UserCheck },
    { id: "elections", label: "Elections", icon: Vote },
    { id: "finance", label: "Finance", icon: BarChart3 },
    { id: "audit", label: "Audit Logs", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "leaderboard":
        return <Leaderboard />;
      case "users":
        return <UserManager />;
      case "candidates":
        return <CandidateManager />;
      case "elections":
        return <ElectionManager />;
      case "finance":
        return <FinanceView />;
      case "audit":
        return <AuditLogs />;
      case "settings":
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  const activeTabLabel =
    menuItems.find((item) => item.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#0B1020] border-r border-white/10 flex flex-col justify-between px-5 py-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Vote size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg">VoteChain</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      activeTab === item.id
                        ? "translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Topbar – functional, no search bar */}
        <header className="h-20 border-b border-white/10 bg-[#0B1020]/70 backdrop-blur-xl px-8 flex items-center justify-between">
          {/* Left side: active page title */}
          <h1 className="text-xl font-semibold text-white">{activeTabLabel}</h1>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-purple-500 rounded-full"></span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h4 className="text-sm font-semibold">Admin</h4>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-auto h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </main>

      {/* Notification Popup (Foreground) */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 fade-in">
            {/* Close button */}
            <button
              onClick={() => setShowNotifications(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={18} className="text-violet-400" />
              Notifications
            </h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-medium text-white">
                  New candidate application
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Mike Kim applied for Sports Captain
                </p>
                <p className="text-xs text-gray-500 mt-2">2 minutes ago</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-medium text-white">Election ended</p>
                <p className="text-xs text-gray-400 mt-1">
                  Student Council 2025 has finished
                </p>
                <p className="text-xs text-gray-500 mt-2">1 hour ago</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-medium text-white">Payment received</p>
                <p className="text-xs text-gray-400 mt-1">
                  NPR 5,000 from Aarav Sharma
                </p>
                <p className="text-xs text-gray-500 mt-2">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default AdminHome;
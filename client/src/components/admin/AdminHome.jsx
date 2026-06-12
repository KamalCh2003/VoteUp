// src/components/admin/AdminHome.jsx
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
  ShieldCheck,
  Settings,
  Trophy,
  CreditCard,
  Eye,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import LogoutConfirmModal from "../common/LogoutConfirmModal";

import DashboardOverview from "./DashboardOverview";
import UserManager from "./UserManager";
import ContestantManagement from "./CandidateManager";
import ElectionManager from "./ElectionManager";
import FinanceView from "./FinanceView";
import AuditLogs from "./AuditLogs";
import SystemSettings from "./SystemSettings";
import Leaderboard from "./Leaderboard";
import VoteVerifier from "./VoteVerifier";

export default function AdminHome() {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "elections", label: "Elections", icon: Vote },
    { id: "candidates", label: "Contestants", icon: UserCheck },
    { id: "users", label: "Users", icon: Users },
    { id: "vote-verifier", label: "Vote Verifier", icon: Eye },
    { id: "finance", label: "Payments", icon: CreditCard },
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
        return <ContestantManagement />;
      case "elections":
        return <ElectionManager />;
      case "vote-verifier":
        return <VoteVerifier />;
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

  const activeTitle = menuItems.find((m) => m.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#0B1020] border-r border-white/10 flex flex-col justify-between px-5 py-6">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Vote size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg">VoteUp</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden">
        <header className="h-20 border-b border-white/10 bg-[#0B1020]/70 backdrop-blur-xl px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{activeTitle}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-purple-500 rounded-full" />
            </button>
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

        <div className="p-8 overflow-auto h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </main>

      {/* NOTIFICATION MODAL */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6">
            <button
              onClick={() => setShowNotifications(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={18} className="text-violet-400" /> Notifications
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-medium text-white">New vote recorded</p>
                <p className="text-xs text-gray-400 mt-1">A user just voted in "Spring 2025 Election"</p>
                <p className="text-xs text-gray-500 mt-2">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
}
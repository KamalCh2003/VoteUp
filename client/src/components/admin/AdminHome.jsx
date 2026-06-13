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
import NotificationCenter from "./NotificationCenter";

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
    { id: "notifications", label: "Notifications", icon: Bell },
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
      case "notifications":
        return <NotificationCenter />;
      default:
        return <DashboardOverview />;
    }
  };

  const activeTitle = menuItems.find((m) => m.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col justify-between px-5 py-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
              <Vote size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-800">VoteUp</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
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
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === item.id ? "text-purple-500" : "text-gray-400"} />
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden">
        <header className="h-20 border-b border-gray-200 bg-white/90 backdrop-blur-md px-8 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">{activeTitle}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative h-11 w-11 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
            >
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-purple-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                A
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Admin</h4>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-auto h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </main>

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
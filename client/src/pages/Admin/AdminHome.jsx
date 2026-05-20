// src/pages/Admin/AdminHome.jsx (or replace Dashboard.jsx)
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Vote,
  LogOut,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Child components (make sure they exist)
import AdminUsers from "./Users";
import AdminCandidates from "./Candidates";
import AdminElections from "./Elections";
import DashboardOverview from "./Dashboard";

const AdminHome = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "candidates", label: "Candidates", icon: UserCheck },
    { id: "elections", label: "Elections", icon: Vote },
  ];

  const renderContent = () => {
    switch (activeTab) {
        case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <AdminUsers />;
      case "candidates":
        return <AdminCandidates />;
      case "elections":
        return <AdminElections />;
      default:
        // Simple dashboard welcome (no stats)
        return (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white">Welcome to Admin Panel</h1>
            <p className="text-gray-400 mt-4">Select a section from the sidebar to manage.</p>
          </div>
        );
    }
  };

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
                      activeTab === item.id ? "translate-x-1" : "group-hover:translate-x-1"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Topbar with Profile & Notification */}
        <header className="h-20 border-b border-white/10 bg-[#0B1020]/70 backdrop-blur-xl px-8 flex items-center justify-between">
          {/* Search (optional) */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 w-[350px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
            />
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-4">
            <button className="relative h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-purple-500 rounded-full"></span>
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

        {/* Content Area */}
        <div className="p-8 overflow-auto h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminHome;
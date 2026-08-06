// src/components/admin/AdminLayout.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Vote,
  LogOut,
  Bell,
  Trophy,
  CreditCard,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  User,
  Key,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoutConfirmModal from "../common/LogoutConfirmModal";
import Badge from "../common/Badge";
import AdminProfilePage from "./AdminProfilePage";
import api from "../../services/api";

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const intervalRef = useRef(null);
  const dropdownRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/admin/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert("Please fill in all password fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match");
    }
    if (newPassword.length < 8) {
      return alert("Password must be at least 8 characters");
    }
    setChangingPassword(true);
    try {
      await api.post("/users/me/change-password", { currentPassword, newPassword });
      alert("Password changed successfully");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/admin/leaderboard" },
    { id: "elections", label: "Elections", icon: Vote, path: "/admin/elections" },
    { id: "candidates", label: "Contestants", icon: UserCheck, path: "/admin/candidates" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "vote-verifier", label: "Vote Verifier", icon: Eye, path: "/admin/vote-verifier" },
    { id: "finance", label: "Payments", icon: CreditCard, path: "/admin/finance" },
    { id: "RequestElection", label: "Request Election", icon: Vote, path: "/admin/election-requests" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/admin/notifications" },
  ];

  const getActiveId = () => {
    const currentPath = location.pathname;
    const match = menuItems.find(item => currentPath.startsWith(item.path));
    return match ? match.id : "dashboard";
  };

  const activeTab = getActiveId();
  const activeTitle = menuItems.find(m => m.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-[280px]" : "w-[120px]"
        } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col py-6 shadow-sm sticky top-0 h-screen`}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <Vote size={22} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-xl text-gray-800">VoteUp</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 transition flex-shrink-0"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>

        <div className="space-y-1 px-3 flex-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path, { replace: true })}
                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${!sidebarOpen ? "justify-center" : ""}`}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="px-3 mt-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition w-full ${
              !sidebarOpen ? "justify-center" : ""
            }`}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-gray-200 bg-white/90 backdrop-blur-md px-8 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">{activeTitle}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/notifications")}
              className="relative h-11 w-11 rounded-2xl flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition overflow-visible"
            >
              <Bell size={18} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 hover:bg-gray-100 transition"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                  A
                </div>
                <div className="hidden sm:block">
                  <h4 className="text-sm font-semibold text-gray-800">Admin</h4>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={16} className="text-gray-500" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Key size={16} className="text-gray-500" /> Change Password
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-2 flex-1 overflow-auto">{children}</div>
      </main>

      <LogoutConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
      />

      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <input
                  className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  type={showNew ? 'text' : 'password'}
                  placeholder="New Password (min. 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {changingPassword ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <AdminProfilePage />
          </div>
        </div>
      )}
    </div>
  );
}
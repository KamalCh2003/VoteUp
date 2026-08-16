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
  ChevronDown,
  User,
  Key,
  X,
  Search,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoutConfirmModal from "../common/LogoutConfirmModal";
import AdminProfilePage from "./AdminProfilePage";
import api from "../../services/api";

const EyeOff = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCandidatesCount, setPendingCandidatesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
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

  const getInitials = () => {
    if (!user) return "A";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "A";
  };

  const getFullName = () => {
    if (!user) return "Admin";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin";
  };

  const getRoleLabel = () => {
    if (!user) return "Administrator";
    switch (user.role) {
      case "ADMIN":
        return "Super Admin";
      case "CONTESTANT":
        return "Contestant";
      case "VOTER":
        return "Voter";
      default:
        return "Administrator";
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/admin/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchPendingCounts = async () => {
    try {
      const [candidatesRes, requestsRes] = await Promise.all([
        api.get("/admin/candidates"),
        api.get("/admin/election-requests", {
          params: { status: "PENDING", limit: 1 },
        }),
      ]);
      const allCandidates = candidatesRes.data.candidates || [];
      const pendingCandidates = allCandidates.filter((c) => c.status === "PENDING");
      setPendingCandidatesCount(pendingCandidates.length);
      setPendingRequestsCount(requestsRes.data.requests?.length || 0);
    } catch (err) {
      console.error("Failed to fetch pending counts:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchPendingCounts();
    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
      fetchPendingCounts();
    }, 30000);
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
      await api.post("/users/me/change-password", {
        currentPassword,
        newPassword,
      });
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

  const menuGroups = [
    {
      label: "Overview",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: Trophy,
          path: "/admin/analytics",
        },
      ],
    },
    {
      label: "Manage",
      items: [
        { id: "users", label: "Users", icon: Users, path: "/admin/users" },
        {
          id: "candidates",
          label: "Contestants",
          icon: UserCheck,
          path: "/admin/candidates",
          badge: pendingCandidatesCount > 0 ? pendingCandidatesCount : null,
        },
        {
          id: "elections",
          label: "Elections",
          icon: Vote,
          path: "/admin/elections",
        },
        {
          id: "create-election",
          label: "Create Election",
          icon: PlusCircle,
          path: "/admin/elections/create",
        },
        {
          id: "finance",
          label: "Payments",
          icon: CreditCard,
          path: "/admin/finance",
        },
        {
          id: "election-requests",
          label: "Requests",
          icon: FileText,
          path: "/admin/election-requests",
          badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
        },
      ],
    },
    {
      label: "Insights",
      items: [
        {
          id: "leaderboard",
          label: "Leaderboard",
          icon: Trophy,
          path: "/admin/leaderboard",
        },
        {
          id: "vote-verifier",
          label: "Vote Verifier",
          icon: Eye,
          path: "/admin/vote-verifier",
        },
        {
          id: "audit",
          label: "Audit Logs",
          icon: Shield,
          path: "/admin/audit-logs",
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          path: "/admin/notifications",
          badge: unreadCount > 0 ? unreadCount : null,
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          path: "/admin/settings",
        },
      ],
    },
  ];

  const getActiveId = () => {
    const currentPath = location.pathname;
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (currentPath.startsWith(item.path.split("?")[0])) {
          return item.id;
        }
      }
    }
    return "dashboard";
  };

  const activeTab = getActiveId();
  const activeTitle = (() => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.id === activeTab) return item.label;
      }
    }
    return "Dashboard";
  })();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] font-['Inter',sans-serif]">
      <aside
        className={`${
          sidebarOpen ? "w-[250px]" : "w-[72px]"
        } transition-all duration-300 ease-in-out bg-white border-r border-[#E2E8F0] flex flex-col py-5 shadow-sm sticky top-0 h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] flex items-center justify-center shadow-sm flex-shrink-0">
              <Vote size={18} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-lg text-[#0F172A]">
                  VoteUp
                </h2>
                <p className="text-xs text-[#64748B]">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-[#F8FAFC] transition flex-shrink-0 text-[#64748B]"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>
        </div>

        <div className="space-y-1 px-3 flex-1 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] px-4 py-2 mt-4 first:mt-0">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path, { replace: true })}
                    className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#EDE9FE] to-[#F5F3FF] text-[#6D28D9] font-semibold"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    } ${!sidebarOpen ? "justify-center" : ""}`}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="truncate text-sm">{item.label}</span>
                    )}
                    {sidebarOpen && item.badge && (
                      <span className="ml-auto bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="px-3 mt-3 border-t border-[#E2E8F0] pt-3">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] transition w-full ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Back to site</span>}
          </button>
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mt-2 ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {getInitials()}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-[#0F172A]">
                  {getFullName()}
                </h4>
                <p className="text-xs text-[#64748B]">{getRoleLabel()}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl px-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[#F8FAFC] text-[#64748B]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeftOpen size={20} />
            </button>
            <h1 className="text-lg font-semibold text-[#0F172A] font-['Plus_Jakarta_Sans',sans-serif]">
              {activeTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm text-[#64748B] w-64">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search users, elections, payments…"
                className="bg-transparent outline-none w-full text-[#0F172A] placeholder:text-[#64748B]"
                onKeyDown={(e) =>
                  e.key === "Enter" && alert("Searching for " + e.target.value)
                }
              />
            </div>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="relative h-9 w-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:border-[#6D28D9] hover:text-[#6D28D9] transition"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 hover:border-[#6D28D9] transition"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
                  {getInitials()}
                </div>
                <div className="hidden sm:block text-left">
                  <h4 className="text-sm font-semibold text-[#0F172A]">
                    {getFullName()}
                  </h4>
                  <p className="text-xs text-[#64748B]">{getRoleLabel()}</p>
                </div>
                <ChevronDown size={16} className="text-[#64748B]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition"
                  >
                    <User size={16} className="text-[#64748B]" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition"
                  >
                    <Key size={16} className="text-[#64748B]" /> Change Password
                  </button>
                  <hr className="my-1 border-[#E2E8F0]" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEE2E2] transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-auto">{children}</div>
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
          <div className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <input
                  className="w-full p-3 pr-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A]"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full p-3 pr-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A]"
                  type={showNew ? "text" : "password"}
                  placeholder="New Password (min. 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full p-3 pr-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A]"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] hover:brightness-105 text-white font-medium flex items-center gap-2 disabled:opacity-70"
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
          <div className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[#F8FAFC] transition text-[#64748B] hover:text-[#0F172A]"
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
// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Bell, ChevronDown, Vote } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // useEffect(() => {
  //   if (!user) return;

  //   const fetchUnreadCount = async () => {
  //     try {
  //       const res = await api.get('/users/me/notifications/unread-count');
  //       setUnreadCount(res.data.count || 0);
  //     } catch (err) {
  //       console.error('Failed to fetch unread count:', err);
  //       setUnreadCount(0);
  //     }
  //   };

  //   fetchUnreadCount();
  //   const interval = setInterval(fetchUnreadCount, 30000);
  //   return () => clearInterval(interval);
  // }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const voterNavLinks = [
    { to: '/voter/dashboard', label: 'Dashboard' },
    { to: '/voter/elections', label: 'Browse Elections' },
    { to: '/voter/history', label: 'My Votes' },
    { to: '/voter/results', label: 'Results' },
  ];

  const accountItems = [
    { to: '/voter-settings', label: 'Settings' },
  ];

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-xl text-sm font-semibold transition ${
      isActive
        ? 'text-purple-600 bg-purple-50'
        : 'text-[#64748B] hover:text-purple-600 hover:bg-purple-50'
    }`;

  if (!user) {
    return (
      <>
        <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-16">
              <NavLink
                to="/"
                className="flex items-center gap-3 font-['Plus_Jakarta_Sans',sans-serif] text-xl font-extrabold text-[#0F172A]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white">
                  <Vote size={18} className="text-white" />
                </div>
                <span>
                  Vote<span className="text-purple-600">Up</span>
                </span>
              </NavLink>

              <nav className="hidden items-center gap-2 text-sm md:flex">
                <NavLink to="/FeaturesSection" className={linkClass}>
                  Features
                </NavLink>
                <NavLink to="/Elections" className={linkClass}>
                  Elections
                </NavLink>
                <NavLink to="/FAQSection" className={linkClass}>
                  FAQ
                </NavLink>
                <NavLink to="/about" className={linkClass}>
                  About
                </NavLink>
              </nav>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <NavLink
                to="/login"
                className="text-sm font-semibold text-[#64748B] transition hover:text-purple-600"
              >
                Log In
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-600/25 transition hover:brightness-105"
              >
                Get Started
              </NavLink>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <NavLink
                to="/register"
                className="rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
              >
                Get Started
              </NavLink>
            </div>
          </div>
        </header>
        <LogoutConfirmModal
          open={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            logout();
            setShowLogoutModal(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <NavLink
            to="/voter/dashboard"
            className="flex items-center gap-3 font-['Plus_Jakarta_Sans',sans-serif] text-xl font-extrabold text-[#0F172A] flex-shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white">
              <Vote size={18} className="text-white" />
            </div>
            <span>
              Vote<span className="text-purple-600">Up</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-6 md:flex">
            {voterNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/voter/dashboard'}
                className={({ isActive }) =>
                  `text-sm font-semibold transition ${
                    isActive
                      ? 'text-purple-600'
                      : 'text-[#64748B] hover:text-purple-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => navigate('/voter-notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:border-purple-600 hover:text-purple-600 transition"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button> */}

            <div className="hidden md:flex relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 hover:border-purple-600 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white font-bold text-sm overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    `${user.firstName?.[0]}${user.lastName?.[0]}`.toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-[#0F172A]">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-[#64748B]">{user.role || 'Voter'}</div>
                </div>
                <ChevronDown size={16} className="text-[#64748B]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg z-50 py-1 max-h-[80vh] overflow-y-auto">
                  {accountItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                          isActive
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                        }`
                      }
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <hr className="my-1 border-[#E2E8F0]" />
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

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden rounded-lg p-2 text-[#64748B] hover:bg-gray-100 transition"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-[#E2E8F0] shadow-2xl">
            <div className="flex justify-end p-4">
              <button
                onClick={closeMobileMenu}
                className="rounded-lg p-2 text-[#64748B] hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E2E8F0]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white font-bold text-sm overflow-hidden flex-shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    `${user.firstName?.[0]}${user.lastName?.[0]}`.toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#0F172A] truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-[#64748B]">{user.role || 'Voter'}</div>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                {voterNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/voter/dashboard'}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-[#64748B] hover:text-purple-600 hover:bg-purple-50'
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <hr className="border-[#E2E8F0] my-4" />

              <nav className="flex flex-col gap-1">
                {accountItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-[#64748B] hover:text-purple-600 hover:bg-purple-50'
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={() => {
                  closeMobileMenu();
                  setShowLogoutModal(true);
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={16} />
                Logout
              </button>
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
          navigate('/login');
        }}
      />
    </>
  );
}
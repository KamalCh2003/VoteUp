// client/src/components/layout/Navbar.jsx

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Vote, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? 'text-violet-600 font-semibold'
        : 'text-gray-600 hover:text-violet-600'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-3 text-2xl font-bold text-gray-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Vote size={22} />
            </div>
            <span>
              Vote<span className="text-violet-600">Up</span>
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-10 text-sm md:flex">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/elections" className={linkClass}>
              Elections
            </NavLink>
            {user && (
              <NavLink to="/results" className={linkClass}>
                Results
              </NavLink>
            )}
            {user && (
              <NavLink to="/history" className={linkClass}>
                History
              </NavLink>
            )}
            {!user && (
              <NavLink to="/about" className={linkClass}>
                About
              </NavLink>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-4 md:flex">
            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className="text-sm font-medium text-gray-600 transition hover:text-violet-600"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-violet-700"
                >
                  Get Started
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Profile Icon Link */}
                <NavLink
                  to="/voter-profile"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-violet-100 hover:text-violet-600 overflow-hidden"
                  title="Your Profile"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </NavLink>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            {!user ? (
              <NavLink
                to="/register"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Get Started
              </NavLink>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-gray-200 shadow-2xl">
            <div className="flex justify-end p-4">
              <button
                onClick={closeMobileMenu}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-5 px-6 py-4">
              <NavLink
                to="/"
                end
                className={linkClass}
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
              <NavLink
                to="/elections"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                Elections
              </NavLink>
              <NavLink
                to="/results"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                Results
              </NavLink>
              <NavLink
                to="/history"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                History
              </NavLink>

              <hr className="border-gray-200" />

              {/* Mobile Profile Link */}
              <NavLink
                to="/voter-profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-gray-700 hover:text-violet-600 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
              </NavLink>

              <button
                onClick={() => {
                  closeMobileMenu();
                  setShowLogoutModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>
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
    </>
  );
}
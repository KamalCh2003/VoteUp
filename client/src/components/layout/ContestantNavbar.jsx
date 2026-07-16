// src/components/layout/ContestantNavbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Vote, LogOut, Menu, X, User } from 'lucide-react'; // added User
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

export default function ContestantNavbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition hover:text-gray-800 ${
      isActive ? 'text-violet-600 font-semibold' : 'text-gray-600'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <NavLink to="/contestant/dashboard" className="flex items-center gap-3 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Vote size={22} />
            </div>
            <span className="text-gray-800">
              Vote<span className="text-violet-600">Up</span>
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-10 text-sm md:flex">
            <NavLink to="/contestant/profile-campaign" className={linkClass}>
              Profile
            </NavLink>
            <NavLink to="/contestant/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/contestant/analytics" className={linkClass}>
              Analytics
            </NavLink>
            <NavLink to="/contestant/history" className={linkClass}>
              History
            </NavLink>
          </nav>

          {/* Desktop User Section */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Profile icon button (replaces Welcome text) */}
            <NavLink
              to="/voter-profile"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-violet-100 hover:text-violet-600 overflow-hidden"
              title="Your Profile"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </NavLink>

            {/* Logout button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 rounded-xl border  border-red-200 bg-red-50  py-2 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white border-l border-gray-200 shadow-xl animate-in slide-in-from-right">
            <div className="flex justify-end p-4">
              <button
                onClick={closeMobileMenu}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4 px-6 py-4">
              <NavLink
                to="/contestant/profile-campaign"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                Profile
              </NavLink>
              <NavLink
                to="/contestant/dashboard"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/contestant/analytics"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                Analytics
              </NavLink>
              <NavLink
                to="/contestant/history"
                className={linkClass}
                onClick={closeMobileMenu}
              >
                History
              </NavLink>
              <hr className="border-gray-200 my-2" />

              {/* Mobile profile link with avatar & name */}
              <NavLink
                to="/voter-profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-gray-700 hover:text-violet-600 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 overflow-hidden">
                  {user?.avatarUrl ? (
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
                  {user?.firstName} {user?.lastName}
                </span>
              </NavLink>

              <button
                onClick={() => {
                  closeMobileMenu();
                  setShowLogoutModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border  border-red-200 bg-red-50  px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
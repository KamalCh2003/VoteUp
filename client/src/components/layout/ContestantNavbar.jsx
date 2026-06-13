// src/components/layout/ContestantNavbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Vote, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ContestantNavbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition hover:text-gray-800 ${
      isActive ? 'text-violet-600 font-semibold' : 'text-gray-600'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
            <NavLink to="/contestant/profile-campaign" className={linkClass}>Profile</NavLink>
            <NavLink to="/contestant/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/contestant/analytics" className={linkClass}>Analytics</NavLink>
            <NavLink to="/contestant/history" className={linkClass}>History</NavLink>
          </nav>

          {/* Desktop User Section */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="text-sm text-gray-600">
              Welcome, {user?.firstName || 'Contestant'}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
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
              <div className="text-sm text-gray-600 px-2">
                Welcome, {user?.firstName || 'Contestant'}
              </div>
              <button
                onClick={() => {
                  closeMobileMenu();
                  logout();
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
// client/src/components/layout/Navbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Vote, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition hover:text-white ${
      isActive ? 'text-violet-400 font-semibold' : 'text-zinc-300'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <Vote size={22} />
            </div>
            <span>
              Vote<span className="text-violet-400">Up</span>
            </span>
          </NavLink>

          {/* Desktop Navigation – hide Results & History before login */}
          <nav className="hidden items-center gap-10 text-sm md:flex">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/elections" className={linkClass}>Elections</NavLink>
            {user && <NavLink to="/results" className={linkClass}>Results</NavLink>}
            {user && <NavLink to="/history" className={linkClass}>History</NavLink>}
            {!user && <NavLink to="/about" className={linkClass}>About</NavLink>}
          </nav>

          {/* Desktop Auth / User */}
          <div className="hidden items-center gap-4 md:flex">
            {!user ? (
              <>
                <NavLink to="/login" className="text-sm text-zinc-300 transition hover:text-white">
                  Sign In
                </NavLink>
                <NavLink to="/register" className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-400">
                  Get Started
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-300">
                  Welcome, {user.firstName || 'User'}
                </span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500/20 hover:text-purple-300"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile area: single button for guests, hamburger for authenticated */}
          <div className="flex items-center gap-3 md:hidden">
            {!user ? (
              <NavLink
                to="/register"
                className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
              >
                Get Started
              </NavLink>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg p-2 text-white transition hover:bg-white/10"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay (only for authenticated users) */}
      {isMobileMenuOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-[#0B1020] border-l border-white/10 shadow-2xl animate-in slide-in-from-right">
            <div className="flex justify-end p-4">
              <button
                onClick={closeMobileMenu}
                className="rounded-lg p-2 text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4 px-6 py-4">
              <NavLink to="/" end className={linkClass} onClick={closeMobileMenu}>
                Home
              </NavLink>
              <NavLink to="/elections" className={linkClass} onClick={closeMobileMenu}>
                Elections
              </NavLink>
              <NavLink to="/results" className={linkClass} onClick={closeMobileMenu}>
                Results
              </NavLink>
              <NavLink to="/history" className={linkClass} onClick={closeMobileMenu}>
                History
              </NavLink>
              <hr className="border-white/10 my-2" />
              <div className="text-sm text-zinc-300 px-2">
                Welcome, {user.firstName || 'User'}
              </div>
              <button
                onClick={() => {
                  closeMobileMenu();
                  setShowLogoutModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500/20 hover:text-purple-300"
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
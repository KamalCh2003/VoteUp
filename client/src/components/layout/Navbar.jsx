// client/src/components/layout/Navbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Vote, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const linkClass = ({ isActive }) =>
    `transition hover:text-white ${
      isActive ? 'text-violet-400 font-semibold' : 'text-zinc-300'
    }`;

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

          {/* Nav Links – updated to public paths */}
          <nav className="hidden items-center gap-10 text-sm md:flex">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/elections" className={linkClass}>Elections</NavLink>
            <NavLink to="/results" className={linkClass}>Results</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
          </nav>

          {/* Auth / User */}
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <NavLink to="/login" className="hidden text-sm text-zinc-300 transition hover:text-white md:block">
                  Sign In
                </NavLink>
                <NavLink to="/register" className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-400">
                  Get Started
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-zinc-300 md:inline-block">
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
        </div>
      </header>

      {/* Logout Confirmation Modal */}
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
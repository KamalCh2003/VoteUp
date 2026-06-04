import { NavLink } from 'react-router-dom';
import { Vote, LogOut, LayoutDashboard, User, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ContestantNavbar() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `transition hover:text-white ${
      isActive ? 'text-violet-400 font-semibold' : 'text-zinc-300'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <NavLink to="/contestant/dashboard" className="flex items-center gap-3 text-2xl font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
            <Vote size={22} />
          </div>
          <span>
            Vote<span className="text-violet-400">Up</span>
          </span>
        </NavLink>

        {/* Contestant Nav Links */}
        <nav className="hidden items-center gap-10 text-sm md:flex">
<NavLink to="/contestant/dashboard" className="flex items-center gap-3">
            Dashboard
          </NavLink>
          <NavLink to="/contestant/profile" className={linkClass}>
            Profile
          </NavLink>
          <NavLink to="/contestant/campaign" className={linkClass}>
            Campaign
          </NavLink>
          <NavLink to="/contestant/analytics" className={linkClass}>
            Analytics
          </NavLink>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          <div className="hidden text-sm text-zinc-300 md:inline-block">
            Welcome, {user?.firstName || 'Contestant'}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500/20 hover:text-purple-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
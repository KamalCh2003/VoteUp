import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

export default function Topbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();

  // Dynamic logo target – keeps each role in their own area
  const getLogoTarget = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'VOTER': return '/voter/home';
      case 'CONTESTANT': return '/contestant/dashboard';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  };

  // Navigation links based on role (updated paths to match current routes)
  const navLinks = user?.role === 'VOTER' ? [
    { to: '/voter/home', label: 'Home' },
    { to: '/voter/elections', label: 'Elections' },
    { to: '/voter/history', label: 'History' },
    { to: '/voter/profile', label: 'Profile' },
  ] : user?.role === 'CONTESTANT' ? [
    { to: '/contestant/dashboard', label: 'Dashboard' },
    { to: '/contestant/apply', label: 'Apply' },
  ] : user?.role === 'ADMIN' ? [
    // Admin already has its own sidebar, so these are optional
    { to: '/admin', label: 'Dashboard' },
  ] : [];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--glass2)] border-b border-[var(--gb)]">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto">
        <Link to={getLogoTarget()} className="flex items-center gap-2 text-[var(--a)] font-medium text-sm">
          🗳️ VoteChain
        </Link>

        <nav className="flex gap-0.5">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={clsx(
              'px-3 py-1.5 rounded-md text-xs transition',
              location.pathname === link.to ? 'bg-[var(--glass2)] text-[var(--t)] font-medium' : 'text-[var(--t2)] hover:bg-[var(--glass)]'
            )}>{link.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-8 h-8 rounded-full border border-[var(--gb)] bg-[var(--glass)] flex items-center justify-center">
            {dark ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--gb)] bg-[var(--abg)] text-[var(--a)]">
                {user.role}
              </span>
              <button onClick={logout} className="text-xs text-[var(--t2)] hover:text-[var(--a3)]">Logout</button>
            </>
          ) : (
            <div className="flex gap-1">
              <Link to="/login" className="px-3 py-1.5 rounded-full text-xs bg-[var(--a)] text-white">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-full text-xs border border-[var(--gb)] text-[var(--t2)]">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
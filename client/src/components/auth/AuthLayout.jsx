// src/components/auth/AuthLayout.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Vote, Users, Calendar, Award } from "lucide-react";
import api from "../../services/api";

export default function AuthLayout({ children, title, subtitle }) {
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalElections: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/public/stats");
        setStats({
          totalVotes: res.data.totalVotes || 0,
          totalElections: res.data.totalElections || 0,
          totalUsers: res.data.totalUsers || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats({
          totalVotes: 1400000,
          totalElections: 312,
          totalUsers: 128412,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left Panel – Enhanced Gradient Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6D28D9] via-[#2563EB] to-[#06B6D4] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
              <Vote size={18} />
            </div>
            <span className="tracking-tight">VoteUp</span>
          </Link>
        </div>

        {/* Main Content – Floating Animation */}
        <div className="relative z-10 max-w-sm animate-float">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-white/60 rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">Empower Your Voice</span>
          </div>

          <h2 className="text-4xl font-bold font-['Plus_Jakarta_Sans',sans-serif] leading-tight tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-lg">
            Make Your Voice Count
          </h2>

          <p className="mt-4 text-base leading-relaxed text-white/90 font-light">
            Your vote has the power to make a difference. Vote securely, easily, and confidently from anywhere.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-xs font-medium uppercase tracking-widest text-white/70">#EveryVoteMatters</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          <p className="mt-4 text-lg font-semibold italic text-white/95">
            “Every Vote Matters. Every Voice Counts.”
          </p>
        </div>

        {/* Stats – with Icons */}
        <div className="relative z-10 grid grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Award size={18} className="text-white" />
            </div>
            <div>
              <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold tracking-tight">
                {loading ? "..." : stats.totalVotes.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wider opacity-80">Votes Cast</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold tracking-tight">
                {loading ? "..." : stats.totalElections.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wider opacity-80">Elections</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold tracking-tight">
                {loading ? "..." : stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wider opacity-80">Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel – No Card, Just Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Small logo on mobile */}
          <div className="lg:hidden flex items-center gap-3 text-xl font-bold text-[#0F172A] mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white">
              <Vote size={18} />
            </div>
            VoteUp
          </div>

          {/* Title & Subtitle */}
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-[#0F172A]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>

          {/* Form Content */}
          <div className="mt-6">{children}</div>

          {/* Always show "Back to site" link, always points to landing page */}
          <div className="mt-4 text-center text-sm text-[#64748B]">
            <Link to="/" className="text-[#6D28D9] hover:underline">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>

      {/* Tailwind custom animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}
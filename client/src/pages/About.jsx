import {
  ShieldCheck,
  BarChart3,
  Users,
  CreditCard,
  Smartphone,
  Zap,
  Lock,
  Globe,
  BadgeCheck,
  Sparkles, 
  Vote
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-[-120px] h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-10 text-center">
        <div className="flex justify-center mb-4 text-violet-400">
          <Sparkles size={30} />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold">
          A Modern Way to{" "}
          <span className="text-violet-400">Vote Digitally</span>
        </h1>

        <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
          VoteUp is a secure, fast, and transparent online voting system
          built for schools, colleges, and organizations.
        </p>
      </div>

      {/* WHAT / WHY */}
      <div className="max-w-6xl mx-auto px-6 mt-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-violet-500/30 transition">
          <h2 className="text-xl font-semibold mb-3">
            🚀 What is VoteUp?
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            VoteUp replaces traditional voting with a fully digital system
            where users can vote securely and view real-time results.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-cyan-500/30 transition">
          <h2 className="text-xl font-semibold mb-3">
            🎯 Why it matters?
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            It eliminates delays, prevents duplication, ensures fairness,
            and improves accessibility for everyone.
          </p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <h2 className="text-2xl font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="relative border-l border-white/10 pl-6 space-y-10">
          {[
            {
              icon: <Users />,
              title: "1. Create Account",
              desc: "Users register as voter, candidate, or admin.",
            },
            {
              icon: <Vote />,
              title: "2. Apply as Contestant",
              desc: "Candidates submit profile and join elections.",
            },
            {
              icon: <CreditCard />,
              title: "3. Contestant Payment",
              desc: "Candidates pay a registration fee to activate participation.",
            },
            {
              icon: <Lock />,
              title: "4. Secure Voting",
              desc: "Votes are encrypted and securely stored.",
            },
            {
              icon: <BarChart3 />,
              title: "5. Live Results",
              desc: "Results update instantly after election ends.",
            },
          ].map((step, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <div className="absolute -left-[34px] top-1.5 h-4 w-4 rounded-full bg-violet-500 shadow-lg shadow-violet-500/30" />

              <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:border-violet-500/30 transition">
                <div className="flex items-center gap-2 text-violet-400 mb-2">
                  {step.icon}
                  <h3 className="font-semibold text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-zinc-400 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
  {/* Heading */}
  <div className="text-center mb-10">
    <h2 className="text-2xl md:text-3xl font-bold">
      Powerful Key Features
    </h2>
    <p className="text-zinc-400 mt-2">
      Everything you need for a secure and modern voting system
    </p>
  </div>

  {/* Grid */}
  <div className="grid md:grid-cols-3 gap-6">
    {[
      {
        icon: <ShieldCheck />,
        title: "Bank-Level Security",
        desc: "Encrypted voting system with anti-tamper protection.",
        color: "from-violet-500 to-indigo-500",
      },
      {
        icon: <BarChart3 />,
        title: "Live Analytics",
        desc: "Real-time vote counting and performance tracking.",
        color: "from-cyan-500 to-blue-500",
      },
      {
        icon: <Users />,
        title: "Role Management",
        desc: "Separate roles for admin, voter, and contestants.",
        color: "from-pink-500 to-rose-500",
      },
      {
        icon: <CreditCard />,
        title: "Contestant Payments",
        desc: "Secure payment system for candidate registration.",
        color: "from-yellow-500 to-orange-500",
      },
      {
        icon: <Smartphone />,
        title: "Mobile Friendly",
        desc: "Fully responsive design for all devices.",
        color: "from-green-500 to-emerald-500",
      },
      {
        icon: <Zap />,
        title: "High Performance",
        desc: "Optimized for fast loading and smooth experience.",
        color: "from-purple-500 to-fuchsia-500",
      },
      {
        icon: <Lock />,
        title: "Secure Authentication",
        desc: "JWT-based login with protected routes.",
        color: "from-blue-500 to-indigo-600",
      },
      {
        icon: <Globe />,
        title: "Global Access",
        desc: "Accessible from anywhere, anytime.",
        color: "from-teal-500 to-cyan-500",
      },
      {
        icon: <BadgeCheck />,
        title: "Verified Elections",
        desc: "Admin-approved elections ensure authenticity.",
        color: "from-emerald-500 to-green-600",
      },
    ].map((item, i) => (
      <div
        key={i}
        className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-violet-500/30"
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-20 blur-2xl transition bg-gradient-to-r ${item.color}`}
        />

        {/* Icon */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-violet-300 mb-4 group-hover:scale-110 transition">
          {item.icon}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-zinc-400">{item.desc}</p>
      </div>
    ))}
  </div>
</div>

      {/* SECURITY */}
      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16 text-center">
        <div className="flex justify-center text-violet-400 mb-3">
          <ShieldCheck size={34} />
        </div>

        <h2 className="text-xl font-semibold mb-2">
          Security & Transparency
        </h2>

        <p className="text-zinc-400">
          Every vote is encrypted, duplicate voting is prevented,
          and all election activity is logged for transparency.
        </p>
      </div>
        <Footer />
    </div>
  );
}
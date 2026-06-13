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
  Vote,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen text-gray-900">

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-16 text-center">
        <div className="flex justify-center mb-4 text-blue-600">
          <Sparkles size={32} />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          A Modern Way to{" "}
          <span className="text-blue-600">Vote Digitally</span>
        </h1>

        <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-base md:text-lg">
          VoteUp is a secure, fast, and transparent online voting system built
          for schools, colleges, and organizations.
        </p>
      </div>

      {/* WHAT / WHY */}
      <div className="max-w-6xl mx-auto px-6 mt-14 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-3">🚀 What is VoteUp?</h2>
          <p className="text-gray-600 leading-relaxed">
            VoteUp replaces traditional voting with a fully digital system
            where users can vote securely and view real-time results.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-3">🎯 Why it matters?</h2>
          <p className="text-gray-600 leading-relaxed">
            It eliminates delays, prevents duplication, ensures fairness, and
            improves accessibility for everyone.
          </p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-2xl font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="relative border-l-2 border-gray-200 pl-6 space-y-8">

          {[
            {
              icon: <Users />,
              title: "Create Account",
              desc: "Users register as voter, candidate, or admin.",
            },
            {
              icon: <Vote />,
              title: "Apply as Contestant",
              desc: "Candidates submit profile and join elections.",
            },
            {
              icon: <CreditCard />,
              title: "Contestant Payment",
              desc: "Candidates pay registration fee to participate.",
            },
            {
              icon: <Lock />,
              title: "Secure Voting",
              desc: "Votes are encrypted and securely stored.",
            },
            {
              icon: <BarChart3 />,
              title: "Live Results",
              desc: "Results update instantly after election ends.",
            },
          ].map((step, i) => (
            <div key={i} className="relative">

              {/* dot */}
              <div className="absolute -left-[34px] top-2 h-4 w-4 rounded-full bg-blue-600 shadow" />

              <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  {step.icon}
                  <h3 className="font-semibold text-gray-900">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            Powerful Key Features
          </h2>
          <p className="text-gray-500 mt-2">
            Everything you need for a secure and modern voting system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {[
            {
              icon: <ShieldCheck />,
              title: "Bank-Level Security",
              desc: "Encrypted voting system with anti-tamper protection.",
            },
            {
              icon: <BarChart3 />,
              title: "Live Analytics",
              desc: "Real-time vote counting and performance tracking.",
            },
            {
              icon: <Users />,
              title: "Role Management",
              desc: "Separate roles for admin, voter, and contestants.",
            },
            {
              icon: <CreditCard />,
              title: "Contestant Payments",
              desc: "Secure payment system for candidate registration.",
            },
            {
              icon: <Smartphone />,
              title: "Mobile Friendly",
              desc: "Fully responsive design for all devices.",
            },
            {
              icon: <Zap />,
              title: "High Performance",
              desc: "Optimized for fast loading and smooth experience.",
            },
            {
              icon: <Lock />,
              title: "Secure Authentication",
              desc: "JWT-based login with protected routes.",
            },
            {
              icon: <Globe />,
              title: "Global Access",
              desc: "Accessible from anywhere, anytime.",
            },
            {
              icon: <BadgeCheck />,
              title: "Verified Elections",
              desc: "Admin-approved elections ensure authenticity.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:scale-110 transition">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}

        </div>
      </div>

      {/* SECURITY */}
      <div className="max-w-3xl mx-auto px-6 mt-20 mb-20 text-center">
        <div className="flex justify-center text-blue-600 mb-3">
          <ShieldCheck size={34} />
        </div>

        <h2 className="text-xl font-semibold mb-2">
          Security & Transparency
        </h2>

        <p className="text-gray-600">
          Every vote is encrypted, duplicate voting is prevented, and all
          election activity is logged for transparency.
        </p>
      </div>

    </div>
  );
}
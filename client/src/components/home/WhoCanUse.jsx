import { GraduationCap, Building2, Mic2, Users } from "lucide-react";

const WhoCanUse = () => {
  const data = [
    {
      icon: GraduationCap,
      title: "Schools & Colleges",
      desc: "Run student elections, CR voting, contests, and academic polls with full transparency.",
      glow: "from-blue-500/10 to-purple-500/5",
    },
    {
      icon: Building2,
      title: "Organizations & Companies",
      desc: "Make internal decisions, leadership voting, and surveys fast, fair, and secure.",
      glow: "from-purple-500/10 to-pink-500/5",
    },
    {
      icon: Mic2,
      title: "Events & Creators",
      desc: "Host live voting for shows, competitions, awards, and audience engagement.",
      glow: "from-pink-500/10 to-orange-500/5",
    },
    {
      icon: Users,
      title: "Communities & NGOs",
      desc: "Enable democratic decision-making for communities, groups, and social projects.",
      glow: "from-green-500/10 to-blue-500/5",
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Who Can Use{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
              VoteUp
            </span>
            ?
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            A powerful, flexible voting platform built for everyone — from
            small groups to large organizations.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Hover Glow */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${item.glow}`}
                />

                {/* Icon */}
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-50 group-hover:bg-violet-100 transition">
                  <Icon
                    className="text-violet-600"
                    size={24}
                  />
                </div>

                {/* Title */}
                <h3 className="relative z-10 text-gray-900 text-lg font-semibold mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhoCanUse;
import { GraduationCap, Building2, Mic2, Users } from "lucide-react";

const WhoCanUse = () => {
  const data = [
    {
      icon: GraduationCap,
      title: "Schools & Colleges",
      desc: "Run student elections, CR voting, contests, and academic polls with full transparency.",
      glow: "from-blue-500/20 to-purple-500/10",
    },
    {
      icon: Building2,
      title: "Organizations & Companies",
      desc: "Make internal decisions, leadership voting, and surveys fast, fair, and secure.",
      glow: "from-purple-500/20 to-pink-500/10",
    },
    {
      icon: Mic2,
      title: "Events & Creators",
      desc: "Host live voting for shows, competitions, awards, and audience engagement.",
      glow: "from-pink-500/20 to-orange-500/10",
    },
    {
      icon: Users,
      title: "Communities & NGOs",
      desc: "Enable democratic decision-making for communities, groups, and social projects.",
      glow: "from-green-500/20 to-blue-500/10",
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* <div className="absolute inset-0">
        <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full top-10 left-10"></div>
        <div className="absolute w-[400px] h-[400px] bg-pink-500/20 blur-[120px] rounded-full bottom-10 right-10"></div>
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Who Can Use{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              VoteUp
            </span>
            ?
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            A powerful, flexible voting platform built for everyone — from small groups to large organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:scale-[1.03] transition-all duration-300`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${item.glow}`} />
                <div className="relative z-10 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition">
                  <Icon className="text-purple-300" size={22} />
                </div>
                <h3 className="relative z-10 text-white text-lg font-semibold mb-2 group-hover:text-purple-300 transition">
                  {item.title}
                </h3>
                <p className="relative z-10 text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-pink-500/0 opacity-0 group-hover:opacity-100 transition" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhoCanUse;
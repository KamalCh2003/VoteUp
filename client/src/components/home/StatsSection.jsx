import { Users, Vote, TrendingUp, ShieldCheck } from "lucide-react";

const stats = [
  {
    title: "Users",
    value: "12.5K",
    icon: Users,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Votes",
    value: "48.9K",
    icon: Vote,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Turnout",
    value: "78%",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Secure",
    value: "100%",
    icon: ShieldCheck,
    color: "from-pink-500 to-rose-600",
  },
];

export default function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-2 py-6">
      {/* Title */}
      {/* <h2 className="mb-4 flex items-center gap-2 text-lg sm:text-xl font-semibold">
        <span className="h-2.5 w-2.5 border border-blue-500"></span>
        Stats
      </h2> */}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl"
            >
              {/* glow */}
              <div
                className={`absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r ${stat.color} opacity-20 blur-xl`}
              ></div>

              {/* content */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-zinc-400">
                    {stat.title}
                  </p>
                  <h3 className="text-sm sm:text-lg font-semibold text-white">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-gradient-to-r ${stat.color}`}
                >
                  <Icon size={14} className="sm:size-[16px]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
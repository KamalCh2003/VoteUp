export default function LiveElectionSection() {
  const elections = [
    {
      title: "Student Council President 2025",
      category: "Academic",
      end: "Ends Jan 28",
      votes: "9,841 / 12,600 votes",
      turnout: "78% turnout",
      progress: "78%",
      color: "from-blue-500 to-violet-500",
    },
    {
      title: "Best Campus Café Award",
      category: "Lifestyle",
      end: "Ends Feb 5",
      votes: "3,102 / 5,000 votes",
      turnout: "62% turnout",
      progress: "62%",
      color: "from-pink-500 to-orange-400",
    },
    {
      title: "Sports Team Captain",
      category: "Sports",
      end: "Ends Feb 10",
      votes: "1,540 / 2,000 votes",
      turnout: "77% turnout",
      progress: "77%",
      color: "from-emerald-400 to-cyan-500",
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full top-10 left-10"></div>
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full bottom-10 right-10"></div>
      </div>

      {/* Title */}
      <div className="relative mb-10 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Elections
        </h2>

        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Real-time updates
        </span>
      </div>

      {/* Cards */}
      <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {elections.map((election, index) => (
          <div
            key={index}
            className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
          >

            {/* Gradient glow border */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-500 rounded-2xl bg-gradient-to-br ${election.color} blur-xl`}></div>

            {/* Content */}
            <div className="relative z-10">

              {/* Header */}
              <div className="flex items-start justify-between">

                <div>
                  <h3 className="text-white font-semibold text-lg leading-snug group-hover:text-white">
                    {election.title}
                  </h3>

                  <p className="text-sm text-zinc-400 mt-1">
                    {election.category} • {election.end}
                  </p>
                </div>

                {/* Live badge */}
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${election.color} shadow-lg`}
                  style={{ width: election.progress }}
                />
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span className="text-white/70">{election.votes}</span>
                <span className="text-white/70">{election.turnout}</span>
              </div>

            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
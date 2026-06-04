import { Shield, BarChart3, Globe, ClipboardList } from "lucide-react";

const features = [
  {
    title: "End-to-end encrypted",
    description: "All votes are encrypted at rest and in transit using 256-bit SSL.",
    icon: Shield,
    color: "text-violet-400",
  },
  {
    title: "Real-time analytics",
    description: "Live vote counts and demographic insights as votes are cast.",
    icon: BarChart3,
    color: "text-cyan-400",
  },
  {
    title: "Vote from anywhere",
    description: "Mobile-first, fully responsive design works on any device.",
    icon: Globe,
    color: "text-pink-400",
  },
  {
    title: "Full audit trail",
    description: "Complete transparency — every vote is logged, nothing is hidden.",
    icon: ClipboardList,
    color: "text-yellow-400",
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <span className="h-3 w-3 border border-blue-500"></span>
        Why VoteUp?
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/20"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 ${feature.color}`}
              >
                <Icon size={20} />
              </div>

              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
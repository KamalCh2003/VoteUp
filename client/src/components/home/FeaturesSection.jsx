import { Shield, BarChart3, Globe, ClipboardList } from "lucide-react";

const features = [
  {
    title: "End-to-end encrypted",
    description: "All votes are encrypted at rest and in transit using 256-bit SSL.",
    icon: Shield,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Real-time analytics",
    description: "Live vote counts and demographic insights as votes are cast.",
    icon: BarChart3,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    title: "Vote from anywhere",
    description: "Mobile-first, fully responsive design works on any device.",
    icon: Globe,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    title: "Full audit trail",
    description: "Complete transparency — every vote is logged, nothing is hidden.",
    icon: ClipboardList,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-gray-900">
        <span className="h-3 w-3 rounded-sm bg-violet-600"></span>
        Why VoteUp?
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={index}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-violet-200"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} ${feature.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
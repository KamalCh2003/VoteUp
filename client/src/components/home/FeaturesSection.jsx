// src/components/home/FeaturesSection.jsx
import { Shield, BarChart3, Globe, ClipboardList, Fingerprint, CreditCard, FileCheck, TrendingUp } from 'lucide-react';

const features = [
    {
        title: 'Secure Voting',
        description: 'Data integrity checks make every vote tamper-evident.',
        icon: Shield,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
    {
        title: 'Real-time Results',
        description: 'Watch results update live with animated, shareable dashboards.',
        icon: BarChart3,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        title: 'Candidate Profiles',
        description: 'Rich manifestos, galleries, and achievements for every contestant.',
        icon: Globe,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
    },
    {
        title: 'Digital Identity',
        description: 'OTP and document verification confirm every voter is real.',
        icon: Fingerprint,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        title: 'Payment Integration',
        description: 'eSewa, Khalti, and Stripe built in for paid voting elections.',
        icon: CreditCard,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
    {
        title: 'Audit Logs',
        description: 'Every action is timestamped and traceable for full transparency.',
        icon: FileCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        title: 'Election Analytics',
        description: 'Deep demographic and engagement analytics for organizers.',
        icon: TrendingUp,
        color: 'text-pink-600',
        bg: 'bg-pink-50',
    },
];

export default function FeaturesSection() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-14">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 mb-3">
                    Features
                </div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
                    Everything an election needs
                </h2>
                <p className="text-[#64748B] mt-3 max-w-2xl mx-auto text-sm">
                    From identity verification to live analytics, VoteUp handles the entire election lifecycle.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={index}
                            className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-200"
                        >
                            <div
                                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} ${feature.color}`}
                            >
                                <Icon size={20} />
                            </div>

                            <h3 className="text-[#0F172A] font-bold text-base">
                                {feature.title}
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                                {feature.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
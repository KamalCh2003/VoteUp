// src/components/home/WhoCanUse.jsx
import { GraduationCap, Building2, Mic2, Users } from 'lucide-react';

const categories = [
    {
        icon: GraduationCap,
        title: 'Student Union',
        desc: 'Run student elections, CR voting, contests, and academic polls with full transparency.',
        glow: 'from-[#6D28D9]/10 to-[#2563EB]/5',
        color: 'from-[#6D28D9] to-[#2563EB]',
    },
    {
        icon: Mic2,
        title: 'Nepal Idol',
        desc: 'Host live voting for shows, competitions, awards, and audience engagement.',
        glow: 'from-[#EF4444]/10 to-[#F59E0B]/5',
        color: 'from-[#EF4444] to-[#F59E0B]',
    },
    {
        icon: Users,
        title: 'Miss Nepal',
        desc: 'Enable democratic decision-making for communities, groups, and social projects.',
        glow: 'from-[#DB2777]/10 to-[#6D28D9]/5',
        color: 'from-[#DB2777] to-[#6D28D9]',
    },
    {
        icon: Building2,
        title: 'Corporate Elections',
        desc: 'Make internal decisions, leadership voting, and surveys fast, fair, and secure.',
        glow: 'from-[#15803D]/10 to-[#22C55E]/5',
        color: 'from-[#15803D] to-[#22C55E]',
    },
];

export default function WhoCanUse() {
    return (
        <section className="relative py-14 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 mb-3">
                        Categories
                    </div>
                    <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
                        Popular election types
                    </h2>
                    <p className="text-[#64748B] mt-3 max-w-2xl mx-auto text-sm">
                        Explore live and upcoming elections across every category.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {categories.map((item, i) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={i}
                                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-purple-200"
                            >
                                <div
                                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${item.glow}`}
                                />

                                <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 group-hover:bg-purple-100 transition">
                                    <Icon className="text-purple-600" size={24} />
                                </div>

                                <h3 className="relative z-10 text-[#0F172A] text-lg font-bold mb-2">
                                    {item.title}
                                </h3>

                                <p className="relative z-10 text-[#64748B] text-sm leading-relaxed">
                                    {item.desc}
                                </p>

                                <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${item.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center`} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
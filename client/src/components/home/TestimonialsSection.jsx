// src/components/home/TestimonialsSection.jsx
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Prakash Adhikari',
        role: 'Election Officer, IAAS',
        quote: 'VoteUp cut our student union election setup time from two weeks to two days, with zero disputes over results.',
        initials: 'PA',
    },
    {
        name: 'Sarita Manandhar',
        role: 'Producer, AP1 Television',
        quote: 'Live vote counts kept our audience engaged for the entire Nepal Idol season.',
        initials: 'SM',
    },
    {
        name: 'Deepak Shrestha',
        role: 'HR Head, Himal Bank',
        quote: 'The audit trail gave our board the confidence to run corporate elections fully online.',
        initials: 'DS',
    },
];

export default function TestimonialsSection() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-14">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 mb-3">
                    Testimonials
                </div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
                    Loved by organizers and voters
                </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                {testimonials.map((t, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="flex gap-0.5 text-amber-400 text-sm mb-2.5">
                            {[...Array(5)].map((_, j) => (
                                <Star key={j} size={16} fill="currentColor" className="text-amber-400" />
                            ))}
                        </div>
                        <p className="text-sm text-[#0F172A] leading-relaxed mb-4">
                            "{t.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white font-bold text-sm">
                                {t.initials}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-[#0F172A]">{t.name}</div>
                                <div className="text-xs text-[#64748B]">{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
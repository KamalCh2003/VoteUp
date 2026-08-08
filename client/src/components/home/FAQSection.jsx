// src/components/home/FAQSection.jsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'Is my vote really secure?',
        a: 'Every vote is encrypted and hashed with a tamper-evident audit trail, so results can always be independently verified.',
    },
    {
        q: 'Can I vote from my phone?',
        a: 'Yes — VoteUp is fully responsive and works on any device, with OTP verification for extra security.',
    },
    {
        q: 'Does VoteUp support paid voting?',
        a: 'Organizers can enable paid votes for elections like talent shows, with eSewa, Khalti, and Stripe built in.',
    },
    {
        q: 'How fast are results published?',
        a: 'Results update in real time as votes are cast, and final results are published the moment voting closes.',
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mx-auto max-w-3xl px-6 py-14">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 mb-3">
                    FAQ
                </div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
                    Frequently asked questions
                </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0] border-t border-[#E2E8F0] rounded-2xl overflow-hidden bg-white shadow-sm">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div
                            key={index}
                            className="cursor-pointer"
                            onClick={() => toggle(index)}
                        >
                            <div className="flex justify-between items-center py-4 px-5 hover:bg-[#F8FAFC] transition">
                                <span className="font-semibold text-sm text-[#0F172A]">
                                    {faq.q}
                                </span>
                                <ChevronDown
                                    size={18}
                                    className={`text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                                    isOpen ? 'max-h-40 pb-4' : 'max-h-0'
                                }`}
                            >
                                <p className="px-5 text-sm text-[#64748B] leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
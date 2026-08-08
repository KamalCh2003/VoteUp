// src/components/home/ElectionRequestCTA.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Rocket } from 'lucide-react';

export default function ElectionRequestCTA() {
    const { user } = useAuth();

    return (
        <div className="mx-auto max-w-7xl px-6 pb-16">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] p-10 md:p-14 text-center">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-white">
                    Ready to run your next election?
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-purple-100 text-sm leading-relaxed">
                    Set up a secure, branded election in under ten minutes.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        to={user ? '/request-election' : '/register'}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-purple-600 shadow-lg transition hover:scale-105"
                    >
                        <Rocket size={18} />
                        Create an Election
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Sign Up Free
                    </Link>
                </div>
            </div>
        </div>
    );
}
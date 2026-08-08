// src/components/home/LiveElectionSection.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Clock } from 'lucide-react';
import api from '../../services/api';

export default function LiveElectionSection({ search = '' }) {
    const [elections, setElections] = useState([]);
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        api
            .get('/elections', { params: { status: 'ACTIVE', limit: 6 } })
            .then(({ data }) => {
                setElections(data.elections || []);

                const initialTimeLeft = {};
                (data.elections || []).forEach((e) => {
                    initialTimeLeft[e.id] = getTimeRemaining(e.endDate);
                });

                setTimeLeft(initialTimeLeft);
            })
            .catch(() => {});
    }, []);

    const getTimeRemaining = (endDate) => {
        const total = Date.parse(endDate) - Date.now();
        if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return { total, days, hours, minutes, seconds };
    };

    useEffect(() => {
        if (!elections.length) return;
        const interval = setInterval(() => {
            const updated = {};
            elections.forEach((e) => {
                updated[e.id] = getTimeRemaining(e.endDate);
            });
            setTimeLeft(updated);
        }, 1000);
        return () => clearInterval(interval);
    }, [elections]);

    const filtered = elections.filter(
        (e) =>
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.category?.toLowerCase().includes(search.toLowerCase())
    );

    const colors = [
        'from-[#6D28D9] to-[#2563EB]',
        'from-[#EF4444] to-[#F59E0B]',
        'from-[#DB2777] to-[#6D28D9]',
        'from-[#F59E0B] to-[#EF4444]',
        'from-[#2563EB] to-[#06B6D4]',
        'from-[#15803D] to-[#22C55E]',
    ];

    const formatCountdown = (time) => {
        if (time.total <= 0) return 'Ended';
        const parts = [];
        if (time.days > 0) parts.push(`${time.days}d`);
        if (time.hours > 0) parts.push(`${time.hours}h`);
        if (time.minutes > 0) parts.push(`${time.minutes}m`);
        parts.push(`${time.seconds}s`);
        return parts.join(' ');
    };

    return (
        <section className="relative mx-auto max-w-7xl py-10 px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-purple-600 mb-1.5">
                        <Activity size={20} />
                        <span className="text-xs font-bold uppercase tracking-wider">Now Live</span>
                    </div>
                    <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
                        Active Elections
                    </h2>
                    <p className="text-[#64748B] mt-2 max-w-xl text-sm">
                        Cast your vote in real-time – every voice matters. See the latest active elections below.
                    </p>
                </div>
                <Link
                    to="/elections"
                    className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition group"
                >
                    View all elections
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((election, index) => {
                    const total = election.maxVoters || election.totalVotes || 1;
                    const progress = Math.min(100, Math.round((election.totalVotes / total) * 100));
                    const color = colors[index % colors.length];
                    const remaining = timeLeft[election.id] || { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

                    return (
                        <Link
                            key={election.id}
                            to={`/elections/${election.id}`}
                            className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer block overflow-hidden"
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition duration-500 rounded-2xl bg-gradient-to-br ${color}`} />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-[#0F172A] font-semibold text-base">{election.title}</h3>
                                        <p className="text-sm text-[#64748B] mt-0.5">{election.category}</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-600">
                                    <Clock size={14} />
                                    <span className="font-mono font-medium">
                                        {remaining.total > 0 ? formatCountdown(remaining) : 'Ended'}
                                    </span>
                                </div>
                                <div className="mt-4 h-1.5 w-full rounded-full bg-[#F8FAFC] overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${color}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="mt-3 flex justify-between text-xs text-[#64748B]">
                                    <span>{election.totalVotes || 0} votes</span>
                                    <span>{election.candidates?.length || 0} candidates</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <p className="text-[#64748B] text-center mt-8">No active elections found.</p>
            )}
        </section>
    );
}
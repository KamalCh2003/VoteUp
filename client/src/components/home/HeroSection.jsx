// src/components/home/HeroSection.jsx
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, ShieldCheck, Vote } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function HeroSection() {
    const { user } = useAuth();
    const [activeCount, setActiveCount] = useState(0);
    const [stats, setStats] = useState({
        totalElections: 0,
        totalUsers: 0,
        totalVotes: 0,
        totalCandidates: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [recentElection, setRecentElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                // Fetch public stats
                const [statsRes, electionsRes] = await Promise.all([
                    api.get('/public/stats'),
                    api.get('/elections', { params: { limit: 100 } }),
                ]);

                const publicStats = statsRes.data;
                const elections = electionsRes.data.elections || [];

                // Calculate total candidates (approved) across all elections
                let totalCandidates = 0;
                if (publicStats.totalCandidates !== undefined) {
                    totalCandidates = publicStats.totalCandidates;
                } else {
                    // Fallback: sum approvedCandidates from each election
                    elections.forEach(e => {
                        totalCandidates += (e.approvedCandidates || 0);
                    });
                }

                setStats({
                    totalElections: publicStats.totalElections || elections.length || 0,
                    totalUsers: publicStats.totalUsers || 0,
                    totalVotes: publicStats.totalVotes || 0,
                    totalCandidates,
                });

                // Active elections count
                const active = elections.filter(e => e.status === 'ACTIVE');
                setActiveCount(active.length || publicStats.activeElections || 0);

            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();

        // Fetch most recent active election for the mockup card
        const fetchMostRecentActiveElection = async () => {
            setLoadingCandidates(true);
            try {
                const { data } = await api.get('/elections', {
                    params: { status: 'ACTIVE', limit: 1 },
                });
                const elections = data.elections || [];
                if (elections.length === 0) {
                    setRecentElection(null);
                    setCandidates([]);
                    setLoadingCandidates(false);
                    return;
                }
                const mostRecent = elections[0];
                const electionRes = await api.get(`/elections/${mostRecent.id}`);
                const election = electionRes.data.election;
                const sorted = [...(election.candidates || [])].sort((a, b) => {
                    const nameA = `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.trim().toLowerCase();
                    const nameB = `${b.user?.firstName ?? ''} ${b.user?.lastName ?? ''}`.trim().toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                setRecentElection(election);
                setCandidates(sorted.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch most recent active election:', err);
            } finally {
                setLoadingCandidates(false);
            }
        };

        fetchMostRecentActiveElection();
        const interval = setInterval(fetchMostRecentActiveElection, 10000);
        return () => clearInterval(interval);
    }, []);

    const votingRoute = user ? '/voter/elections' : '/login';

    return (
        <section className="relative overflow-hidden pt-8 pb-4 md:pt-12">
            <div className="mx-auto max-w-7xl px-6">
                {/* Active Election Badge */}
                <div className="flex justify-center mb-6 md:mb-10">
                    {loadingStats ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-5 py-2 text-sm text-gray-400 shadow-sm animate-pulse">
                            <Sparkles size={14} />
                            Loading elections...
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm">
                            <Sparkles size={14} className="text-purple-600" />
                            {activeCount} ACTIVE ELECTION{activeCount !== 1 ? 'S' : ''}
                        </div>
                    )}
                </div>

                {/* Hero Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left lg:col-span-2">
                        <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.06] tracking-[-0.02em] text-[#0F172A]">
                            Secure Digital<br />
                            <span className="bg-gradient-to-r from-[#6D28D9] to-[#2563EB] bg-clip-text text-transparent">
                                Voting Platform
                            </span>
                        </h1>

                        <p className="mt-5 text-lg leading-relaxed text-[#64748B] max-w-xl lg:mx-0 mx-auto">
                            Vote securely from anywhere. VoteUp brings government-level security and a delightful voter experience to student unions, talent shows, corporate boards, and community polls.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                to={votingRoute}
                                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:brightness-105 hover:shadow-purple-600/35"
                            >
                                <Vote size={18} />
                                Vote Now
                                <ChevronRight
                                    size={18}
                                    className="transition group-hover:translate-x-1"
                                />
                            </Link>

                            <Link
                                to="/request-election"
                                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-8 py-3.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
                            >
                                <ShieldCheck size={18} />
                                Create Election
                            </Link>
                        </div>

                        {/* Dynamic Stats */}
                        <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8">
                            {loadingStats ? (
                                // Skeleton loaders
                                <>
                                    <div className="animate-pulse">
                                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-20 bg-gray-100 rounded mt-1"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-20 bg-gray-100 rounded mt-1"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-20 bg-gray-100 rounded mt-1"></div>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-20 bg-gray-100 rounded mt-1"></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold text-[#0F172A]">
                                            {stats.totalElections.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#64748B]">Total Elections</div>
                                    </div>
                                    <div>
                                        <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold text-[#0F172A]">
                                            {stats.totalUsers.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#64748B]">Registered Users</div>
                                    </div>
                                    <div>
                                        <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold text-[#0F172A]">
                                            {stats.totalVotes.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#64748B]">Votes Cast</div>
                                    </div>
                                    <div>
                                        <div className="font-['IBM_Plex_Sans',sans-serif] text-2xl font-bold text-[#0F172A]">
                                            {stats.totalCandidates.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#64748B]">Total Contestants</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mockup Card */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="relative rounded-2xl border border-[#E2E8F0] bg-white shadow-xl shadow-[#0F172A]/10 p-4 animate-[float_6s_ease-in-out_infinite]">
                            <style>{`
                                @keyframes float {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-10px); }
                                }
                            `}</style>
                            <div className="flex gap-1.5 mb-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]"></span>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
                                <div className="h-[180px] bg-gradient-to-r from-[#6D28D9] to-[#2563EB] relative">
                                    <svg viewBox="0 0 300 120" className="absolute bottom-0 w-full opacity-50">
                                        <polyline
                                            points="0,90 40,70 80,80 120,40 160,55 200,20 240,35 300,10"
                                            fill="none"
                                            stroke="#fff"
                                            strokeWidth="3"
                                        />
                                    </svg>
                                </div>
                                <div className="p-4 bg-white">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-sm text-[#0F172A]">Nepal Idol — Live Results</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Live
                                        </span>
                                    </div>
                                    {[
                                        { name: 'Sneha Bhattarai', pct: 42 },
                                        { name: 'Nabin Shrestha', pct: 31 },
                                        { name: 'Kritika Basnet', pct: 27 },
                                    ].map((item) => (
                                        <div key={item.name} className="mb-2">
                                            <div className="flex justify-between text-xs text-[#64748B] mb-1">
                                                <span>{item.name}</span>
                                                <span>{item.pct}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-[#F8FAFC] overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#2563EB]"
                                                    style={{ width: `${item.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-4 bg-white border border-[#E2E8F0] rounded-xl shadow-md px-3 py-2 flex items-center gap-2 text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_#ECFDF3]"></span>
                                4,821 votes today
                            </div>
                            <div className="absolute bottom-6 -left-5 bg-white border border-[#E2E8F0] rounded-xl shadow-md px-3 py-2 flex items-center gap-2 text-xs font-bold">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Identity verified
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
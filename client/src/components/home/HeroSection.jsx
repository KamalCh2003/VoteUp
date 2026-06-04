import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function HeroSection() {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    api.get('/public/stats')
      .then(({ data }) => setActiveCount(data.activeElections || 0))
      .catch(() => {});
  }, []);

  const votingRoute = user ? '/voter/elections' : '/login';

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 py-28 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-500 px-5 py-2 text-sm  text-white backdrop-blur-xl">
          <Sparkles size={14} />
          {activeCount} ACTIVE ELECTION{activeCount !== 1 ? 'S' : ''}
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
          The future of{' '}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text italic text-transparent">
            democratic
          </span>{' '}
          voting is here
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
          Cast votes with confidence. Blockchain-secured, fully
          transparent, and instantly verified results for every election.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            to={votingRoute}
            className="group flex items-center gap-2 rounded-2xl bg-violet-500 px-10 py-4 text-lg font-semibold transition hover:scale-105 hover:bg-violet-400"
          >
            Start Voting
            <ChevronRight size={20} className="transition group-hover:translate-x-1" />
          </Link>

          <Link
            to="/voter/results/0"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-10 py-4 text-lg font-semibold backdrop-blur-xl transition hover:scale-105 hover:bg-white/[0.08]"
          >
            View Results
          </Link>
        </div>
      </div>
    </section>
  );
}
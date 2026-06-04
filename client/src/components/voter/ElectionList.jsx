import { useState } from 'react';
import LiveElectionSection from '../home/LiveElectionSection';

export default function ElectionList() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen overflow-hidden text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      {/* Page Header + Search */}
      <div className="mx-auto max-w-6xl px-6 pt-10">

        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50"
          />
        </div>
         {/* Pass search to LiveElectionSection */}
      <LiveElectionSection search={search} />
      </div>

     
    </div>
  );
}
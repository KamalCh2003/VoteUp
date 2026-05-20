import { useState } from "react";
import LiveElectionSection from "../components/home/LiveElections";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const Elections = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <Navbar />

      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      {/* Page Header + Search */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <h1 className="text-3xl font-bold mb-4">
          Live Elections
        </h1>

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
      </div>

      {/* Pass search to component */}
      <LiveElectionSection search={search} />

      <Footer />
    </div>
  );
};

export default Elections;
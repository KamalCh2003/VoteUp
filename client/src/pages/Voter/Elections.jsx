// src/pages/ElectionsPage.jsx

import { useState } from "react";
import { Search, Users, BarChart3, Clock } from "lucide-react";

const electionsData = [
  {
    id: 1,
    title: "Student Council President 2025",
    category: "Academic",
    status: "Active",
    end: "Jan 28",
    totalVotes: 12600,
    currentVotes: 9841,
    turnout: 78,
    description:
      "Elect your student council president who will represent academic decisions and student welfare.",
    candidates: 4,
  },
  {
    id: 2,
    title: "Best Campus Café Award",
    category: "Lifestyle",
    status: "Active",
    end: "Feb 5",
    totalVotes: 5000,
    currentVotes: 3102,
    turnout: 62,
    description:
      "Vote for the best café on campus based on food quality, service, and environment.",
    candidates: 6,
  },
  {
    id: 3,
    title: "Sports Team Captain",
    category: "Sports",
    status: "Active",
    end: "Feb 10",
    totalVotes: 2000,
    currentVotes: 1540,
    turnout: 77,
    description:
      "Choose your next sports team captain who will lead inter-college tournaments.",
    candidates: 3,
  },
];

export default function ElectionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(electionsData[0]);

  const filtered = electionsData.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || e.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#070711] text-white px-6 py-10">

        

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Elections</h1>

        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-sm">
          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
          3 Live
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search elections, categories..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none text-white"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 bg-white/5 p-2 rounded-xl w-fit">
        {["All", "Active", "Upcoming", "Ended"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === tab
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT LIST */}
        <div className="lg:col-span-2 space-y-4">

          {filtered.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelected(e)}
              className={`cursor-pointer rounded-2xl border p-5 transition bg-white/5 hover:bg-white/10 ${
                selected.id === e.id ? "border-purple-500" : "border-white/10"
              }`}
            >

              {/* Title */}
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{e.title}</h2>

                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                  {e.status}
                </span>
              </div>

              <p className="text-sm text-gray-400 mt-1">
                {e.category} • Ends {e.end}
              </p>

              {/* Progress */}
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                  style={{
                    width: `${(e.currentVotes / e.totalVotes) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>
                  {e.currentVotes.toLocaleString()} /{" "}
                  {e.totalVotes.toLocaleString()} votes
                </span>
                <span>{e.turnout}% turnout</span>
              </div>
            </div>
          ))}

        </div>

        {/* RIGHT DETAIL PANEL */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit sticky top-6">

          <h2 className="text-xl font-bold mb-2">
            {selected.title}
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            {selected.category} Election
          </p>

          <p className="text-sm text-gray-300 mb-6">
            {selected.description}
          </p>

          {/* Stats */}
          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <Users size={18} className="text-purple-400" />
              <p className="text-sm text-gray-300">
                {selected.candidates} Candidates
              </p>
            </div>

            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-cyan-400" />
              <p className="text-sm text-gray-300">
                {selected.turnout}% Participation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-emerald-400" />
              <p className="text-sm text-gray-300">
                Ends {selected.end}
              </p>
            </div>

          </div>

          {/* Action Button */}
          <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold transition">
            View Full Election
          </button>

        </div>

      </div>
    </div>
  );
}


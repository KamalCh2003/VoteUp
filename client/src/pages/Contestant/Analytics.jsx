// // src/pages/Contestant/Analytics.jsx
// import { useState, useEffect } from "react";
// import API from "../../services/api";
// import { TrendingUp, BarChart2, PieChart, Users } from "lucide-react";

// const ContestantAnalytics = () => {
//   const [analytics, setAnalytics] = useState({
//     dailyVotes: [],
//     totalVotes: 0,
//     rank: 0,
//     percentageOfTotal: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAnalytics();
//   }, []);

//   const fetchAnalytics = async () => {
//     try {
//       const res = await API.get("/contestant/analytics");
//       setAnalytics(res.data.data);
//     } catch (error) {
//       console.error("Failed to load analytics", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="text-white p-8">Loading analytics...</div>;

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
//       <p className="text-gray-400 mb-8">Track your voting performance and trends</p>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Total Votes</p>
//               <p className="text-3xl font-bold mt-2">{analytics.totalVotes}</p>
//             </div>
//             <TrendingUp className="text-purple-400" size={28} />
//           </div>
//         </div>
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Your Rank</p>
//               <p className="text-3xl font-bold mt-2">#{analytics.rank}</p>
//             </div>
//             <BarChart2 className="text-green-400" size={28} />
//           </div>
//         </div>
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">% of Total Votes</p>
//               <p className="text-3xl font-bold mt-2">{analytics.percentageOfTotal}%</p>
//             </div>
//             <PieChart className="text-blue-400" size={28} />
//           </div>
//         </div>
//       </div>

//       {/* Daily Vote Trend (placeholder) */}
//       <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 mb-8">
//         <h2 className="text-xl font-semibold text-white mb-4">Daily Vote Trend (Last 7 Days)</h2>
//         <div className="h-64 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-gray-500">
//           Chart placeholder – integrate Recharts or Chart.js here
//         </div>
//       </div>

//       {/* Candidate Comparison (placeholder) */}
//       <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//         <h2 className="text-xl font-semibold text-white mb-4">Comparison with Other Candidates</h2>
//         <div className="h-64 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-gray-500">
//           Bar chart comparing vote counts across candidates
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContestantAnalytics;
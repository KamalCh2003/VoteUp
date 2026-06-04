// // src/pages/Contestant/Dashboard.jsx
// import { useState, useEffect } from "react";
// import API from "../../services/api";
// import { Vote, Users, TrendingUp, Calendar } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";

// const ContestantDashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalVotes: 0,
//     activeElections: 0,
//     pastElections: 0,
//     rankPercentile: 0,
//   });
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch contestant's elections and vote counts
//         const [electionsRes, votesRes] = await Promise.all([
//           API.get('/contestant/elections'),   // returns elections where user is candidate
//           API.get('/contestant/votes'),       // total votes received
//         ]);
        
//         const allElections = electionsRes.data.data;
//         const active = allElections.filter(e => e.status === 'ACTIVE');
//         const past = allElections.filter(e => e.status === 'ENDED');
//         const totalVotes = votesRes.data.data?.total || 0;
        
//         setStats({
//           totalVotes,
//           activeElections: active.length,
//           pastElections: past.length,
//           rankPercentile: 78, // mock for now – compute from backend later
//         });
//         setElections(allElections);
//       } catch (error) {
//         console.error("Failed to fetch contestant data", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <div className="text-white p-8">Loading dashboard...</div>;

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
//       <p className="text-gray-400 mb-8">Track your campaign performance</p>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Total Votes</p>
//               <p className="text-3xl font-bold text-white mt-2">{stats.totalVotes}</p>
//             </div>
//             <Vote className="text-purple-400" size={28} />
//           </div>
//         </div>
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Active Elections</p>
//               <p className="text-3xl font-bold text-white mt-2">{stats.activeElections}</p>
//             </div>
//             <Calendar className="text-green-400" size={28} />
//           </div>
//         </div>
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Past Elections</p>
//               <p className="text-3xl font-bold text-white mt-2">{stats.pastElections}</p>
//             </div>
//             <TrendingUp className="text-blue-400" size={28} />
//           </div>
//         </div>
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-400 text-sm">Performance Rank</p>
//               <p className="text-3xl font-bold text-white mt-2">{stats.rankPercentile}th %ile</p>
//             </div>
//             <Users className="text-yellow-400" size={28} />
//           </div>
//         </div>
//       </div>

//       {/* Elections Table */}
//       <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//         <h2 className="text-xl font-semibold text-white mb-4">Your Elections</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="border-b border-white/10">
//               <tr>
//                 <th className="py-3 text-gray-400">Election Title</th>
//                 <th className="py-3 text-gray-400">Status</th>
//                 <th className="py-3 text-gray-400">Votes Received</th>
//                 <th className="py-3 text-gray-400">End Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {elections.map((election) => (
//                 <tr key={election.id} className="border-b border-white/5">
//                   <td className="py-3 text-white">{election.title}</td>
//                   <td className="py-3">
//                     <span className={`px-2 py-1 rounded-full text-xs ${
//                       election.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
//                       election.status === 'UPCOMING' ? 'bg-yellow-500/20 text-yellow-400' :
//                       'bg-gray-500/20 text-gray-400'
//                     }`}>
//                       {election.status}
//                     </span>
//                   </td>
//                   <td className="py-3 text-gray-300">{election._count?.votes || 0}</td>
//                   <td className="py-3 text-gray-300">{new Date(election.endDate).toLocaleDateString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContestantDashboard;
// // src/pages/Contestant/History.jsx
// import { useState, useEffect } from "react";
// import API from "../../services/api";
// import { Award, TrendingUp, BarChart } from "lucide-react";

// const ContestantHistory = () => {
//   const [pastElections, setPastElections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const res = await API.get('/contestant/history'); 
//         setPastElections(res.data.data);
//       } catch (error) {
//         console.error("Failed to load history", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchHistory();
//   }, []);

//   if (loading) return <div className="text-white p-8">Loading history...</div>;

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-white mb-2">Your History</h1>
//       <p className="text-gray-400 mb-8">Past elections and your performance</p>

//       {pastElections.length === 0 ? (
//         <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-12 text-center">
//           <Award className="mx-auto text-gray-500 mb-4" size={48} />
//           <p className="text-gray-400">No past elections yet.</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {pastElections.map((election) => (
//             <div key={election.id} className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-white">{election.title}</h2>
//                 <span className="text-gray-400 text-sm">
//                   Ended {new Date(election.endDate).toLocaleDateString()}
//                 </span>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
//                     <TrendingUp size={18} className="text-purple-400" />
//                   </div>
//                   <div>
//                     <p className="text-gray-400 text-sm">Your Votes</p>
//                     <p className="text-white font-bold">{election.votesReceived}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
//                     <Award size={18} className="text-green-400" />
//                   </div>
//                   <div>
//                     <p className="text-gray-400 text-sm">Position</p>
//                     <p className="text-white font-bold">{election.position || '—'}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
//                     <BarChart size={18} className="text-blue-400" />
//                   </div>
//                   <div>
//                     <p className="text-gray-400 text-sm">Total Votes in Election</p>
//                     <p className="text-white font-bold">{election.totalElectionVotes}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ContestantHistory;
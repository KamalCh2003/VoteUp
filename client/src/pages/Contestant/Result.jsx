// // src/pages/Results.jsx
// import { useState, useEffect } from "react";
// import API from "../services/api";
// import { Trophy, Vote, Calendar, UserCheck, BarChart3, ChevronRight } from "lucide-react";
// import { Link } from "react-router-dom";

// const Results = () => {
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedElection, setSelectedElection] = useState(null);

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         // Fetch all ended elections with results (including winners)
//         const res = await API.get("/elections/results");
//         setElections(res.data.data);
//       } catch (error) {
//         console.error("Failed to fetch election results", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchResults();
//   }, []);

//   const handleViewDetails = (election) => {
//     setSelectedElection(election);
//   };

//   const closeModal = () => {
//     setSelectedElection(null);
//   };

//   if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading results...</div>;

//   return (
//     <div className="min-h-screen bg-black text-white py-12 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
//             Election Results
//           </h1>
//           <p className="text-gray-400 mt-4 text-lg">View the outcomes of past elections and who won.</p>
//         </div>

//         {elections.length === 0 ? (
//           <div className="text-center py-16 bg-[#0B1020] rounded-2xl border border-white/10">
//             <p className="text-gray-400">No results available yet. Check back after elections end.</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {elections.map((election) => (
//               <div key={election.id} className="bg-[#0B1020] border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all">
//                 <div className="p-6">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
//                     <div>
//                       <h2 className="text-2xl font-semibold">{election.title}</h2>
//                       <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
//                         <span className="flex items-center gap-1"><Calendar size={14} /> Ended: {new Date(election.endDate).toLocaleDateString()}</span>
//                         <span className="flex items-center gap-1"><Vote size={14} /> Total Votes: {election.totalVotes}</span>
//                       </div>
//                     </div>
//                     <div className="mt-3 md:mt-0">
//                       <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
//                         Winner: {election.winner?.name || "TBD"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Winner card */}
//                   {election.winner && (
//                     <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
//                       <div className="flex items-center gap-4">
//                         {election.winner.imageUrl ? (
//                           <img src={election.winner.imageUrl} alt={election.winner.name} className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400" />
//                         ) : (
//                           <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
//                             <UserCheck className="text-yellow-400" size={28} />
//                           </div>
//                         )}
//                         <div>
//                           <p className="text-gray-300 text-sm">Winner</p>
//                           <p className="text-xl font-bold">{election.winner.name}</p>
//                           <p className="text-yellow-400 text-sm">{election.winner.party || "Independent"}</p>
//                         </div>
//                         <div className="ml-auto text-right">
//                           <p className="text-gray-400 text-sm">Votes Received</p>
//                           <p className="text-2xl font-bold">{election.winner.votes}</p>
//                           <p className="text-green-400 text-sm">{election.winner.percentage}% of total</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <button
//                     onClick={() => handleViewDetails(election)}
//                     className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mt-2 group"
//                   >
//                     View full results <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Modal for detailed results */}
//       {selectedElection && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
//           <div className="bg-[#0B1020] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//             <div className="sticky top-0 bg-[#0B1020] border-b border-white/10 p-4 flex justify-between items-center">
//               <h2 className="text-xl font-bold">{selectedElection.title} – Detailed Results</h2>
//               <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
//             </div>
//             <div className="p-6">
//               <div className="mb-6 p-4 bg-white/5 rounded-xl">
//                 <p className="text-gray-400">Total Votes Cast: <span className="text-white font-bold">{selectedElection.totalVotes}</span></p>
//                 <p className="text-gray-400 mt-1">Election Ended: {new Date(selectedElection.endDate).toLocaleString()}</p>
//               </div>
//               <h3 className="font-semibold mb-3">All Candidates</h3>
//               <div className="space-y-3">
//                 {selectedElection.candidates?.map((candidate) => (
//                   <div key={candidate.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       {candidate.imageUrl ? (
//                         <img src={candidate.imageUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" />
//                       ) : (
//                         <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><UserCheck size={18} /></div>
//                       )}
//                       <div>
//                         <p className="font-medium">{candidate.name}</p>
//                         <p className="text-xs text-gray-400">{candidate.party || "Independent"}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold">{candidate.votes} votes</p>
//                       <p className="text-xs text-gray-400">{candidate.percentage}%</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Results;
// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import API from '../../services/api';

// const Results = () => {
//   const { electionId } = useParams();
//   const [results, setResults] = useState(null);

//   useEffect(() => {
//     if (electionId) {
//       API.get(`/elections/${electionId}/results`).then(res => setResults(res.data.data));
//     }
//   }, [electionId]);

//   if (!electionId) return (
//     <div className="max-w-3xl mx-auto p-6">
//       <h1 className="text-2xl mb-4">Results</h1>
//       <p>Select an election to view results.</p>
//       <Link to="/voter/elections" className="text-purple-400">Go to elections</Link>
//     </div>
//   );

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       {results ? (
//         <>
//           <h1 className="text-2xl font-bold mb-4">{results.title}</h1>
//           <p className="text-gray-400 mb-6">Total votes: {results.totalVotes}</p>
//           <div className="space-y-3">
//             {results.candidates.map(c => (
//               <div key={c.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
//                 <div>
//                   <p className="font-semibold">{c.name}</p>
//                   <p className="text-sm text-gray-400">{c.party}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-bold">{c.percentage}%</p>
//                   <p className="text-xs text-gray-400">{c.voteCount} votes</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       ) : <p>Loading...</p>}
//     </div>
//   );
// };
// export default Results;
// import { Trophy, BarChart3 } from "lucide-react";
// import Navbar from "../layout/Navbar";
// import Footer from "../layout/Footer";

// const resultsData = [
//   {
//     title: "Student Council President 2025",
//     winner: "Aarav Sharma",
//     votes: 8421,
//     total: 12000,
//     category: "Academic",
//   },
//   {
//     title: "Best Campus Café Award",
//     winner: "Bean Hive Café",
//     votes: 5630,
//     total: 9000,
//     category: "Lifestyle",
//   },
//   {
//     title: "Sports Captain Election",
//     winner: "Rohit KC",
//     votes: 7340,
//     total: 11000,
//     category: "Sports",
//   },
// ];

// export default function Results() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white ">
//         <Navbar />
//       {/* Header */}
//       <div className="mx-auto max-w-6xl text-center mb-10 px-6 py-10">
//         <div className="flex justify-center mb-3 text-violet-400">
//           <BarChart3 size={34} />
//         </div>
//         <h1 className="text-3xl md:text-4xl font-bold">
//           Election Results
//         </h1>
//         <p className="text-zinc-400 mt-2">
//           Live and completed voting outcomes
//         </p>
//       </div>

//       {/* Results Grid */}
//       <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {resultsData.map((item, index) => {
//           const percentage = Math.round(
//             (item.votes / item.total) * 100
//           );

//           return (
//             <div
//               key={index}
//               className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-violet-500/30 transition"
//             >
//               {/* Title */}
//               <div className="flex items-start justify-between">
//                 <h2 className="text-lg font-semibold">
//                   {item.title}
//                 </h2>
//                 <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400">
//                   {item.category}
//                 </span>
//               </div>

//               {/* Winner */}
//               <div className="mt-4 flex items-center gap-2 text-violet-400">
//                 <Trophy size={18} />
//                 <span className="font-medium">
//                   Winner: {item.winner}
//                 </span>
//               </div>

//               {/* Progress */}
//               <div className="mt-5">
//                 <div className="flex justify-between text-sm text-zinc-400 mb-2">
//                   <span>Votes</span>
//                   <span>
//                     {item.votes.toLocaleString()} /{" "}
//                     {item.total.toLocaleString()} ({percentage}%)
//                   </span>
//                 </div>

//                 <div className="h-2 w-full rounded-full bg-white/10">
//                   <div
//                     className="h-2 rounded-full bg-violet-500"
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>
//               </div>

//               {/* Footer */}
//               <p className="mt-4 text-xs text-zinc-500">
//                 Updated recently
//               </p>
//             </div>
//           );
//         })}
//       </div>
//         <Footer />
//     </div>
//   );
// }
// // src/pages/Contestant/Campaign.jsx
// import { useState, useEffect } from "react";
// import API from "../../services/api";
// import toast from "react-hot-toast";
// import { Megaphone, CheckCircle, Link as LinkIcon, Plus, Trash2 } from "lucide-react";

// const ContestantCampaign = () => {
//   const [campaign, setCampaign] = useState({
//     slogan: "",
//     keyIssues: [],
//     socialLinks: { twitter: "", facebook: "", instagram: "" },
//   });
//   const [newIssue, setNewIssue] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchCampaign();
//   }, []);

//   const fetchCampaign = async () => {
//     try {
//       const res = await API.get("/contestant/campaign");
//       setCampaign(res.data.data);
//     } catch (error) {
//       console.error("Failed to load campaign", error);
//     }
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       await API.put("/contestant/campaign", campaign);
//       toast.success("Campaign updated");
//     } catch (error) {
//       toast.error("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addIssue = () => {
//     if (newIssue.trim()) {
//       setCampaign({ ...campaign, keyIssues: [...campaign.keyIssues, newIssue.trim()] });
//       setNewIssue("");
//     }
//   };

//   const removeIssue = (index) => {
//     const updated = campaign.keyIssues.filter((_, i) => i !== index);
//     setCampaign({ ...campaign, keyIssues: updated });
//   };

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold text-white mb-2">Campaign Manager</h1>
//       <p className="text-gray-400 mb-8">Share your message, promises, and connect with voters</p>

//       <div className="space-y-8">
//         {/* Slogan */}
//         <div>
//           <label className="block text-gray-300 text-sm mb-2">Campaign Slogan</label>
//           <input type="text" value={campaign.slogan} onChange={(e) => setCampaign({ ...campaign, slogan: e.target.value })}
//             className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 text-white"
//             placeholder="e.g., 'Vote for a Better Tomorrow'" />
//         </div>

//         {/* Key Issues */}
//         <div>
//           <label className="block text-gray-300 text-sm mb-2">Key Issues / Promises</label>
//           <div className="flex gap-2 mb-3">
//             <input type="text" value={newIssue} onChange={(e) => setNewIssue(e.target.value)}
//               className="flex-1 bg-[#0B1020] border border-white/10 rounded-xl px-4 py-2 text-white"
//               placeholder="Add a key issue (e.g., 'Improve healthcare')" />
//             <button onClick={addIssue} className="bg-purple-500 hover:bg-purple-600 px-4 rounded-xl text-white">
//               <Plus size={18} />
//             </button>
//           </div>
//           <div className="space-y-2">
//             {campaign.keyIssues.map((issue, idx) => (
//               <div key={idx} className="flex items-center justify-between bg-[#0B1020] border border-white/10 rounded-xl p-3">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle size={16} className="text-green-400" />
//                   <span className="text-white">{issue}</span>
//                 </div>
//                 <button onClick={() => removeIssue(idx)} className="text-red-400 hover:text-red-300">
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Social Links */}
//         <div>
//           <label className="block text-gray-300 text-sm mb-2">Social Media Links</label>
//           <div className="space-y-3">
//             <div className="flex items-center gap-3">
//               <LinkIcon size={18} className="text-gray-500" />
//               <input type="url" placeholder="Twitter URL" value={campaign.socialLinks.twitter}
//                 onChange={(e) => setCampaign({ ...campaign, socialLinks: { ...campaign.socialLinks, twitter: e.target.value } })}
//                 className="flex-1 bg-[#0B1020] border border-white/10 rounded-xl px-4 py-2 text-white" />
//             </div>
//             <div className="flex items-center gap-3">
//               <LinkIcon size={18} className="text-gray-500" />
//               <input type="url" placeholder="Facebook URL" value={campaign.socialLinks.facebook}
//                 onChange={(e) => setCampaign({ ...campaign, socialLinks: { ...campaign.socialLinks, facebook: e.target.value } })}
//                 className="flex-1 bg-[#0B1020] border border-white/10 rounded-xl px-4 py-2 text-white" />
//             </div>
//             <div className="flex items-center gap-3">
//               <LinkIcon size={18} className="text-gray-500" />
//               <input type="url" placeholder="Instagram URL" value={campaign.socialLinks.instagram}
//                 onChange={(e) => setCampaign({ ...campaign, socialLinks: { ...campaign.socialLinks, instagram: e.target.value } })}
//                 className="flex-1 bg-[#0B1020] border border-white/10 rounded-xl px-4 py-2 text-white" />
//             </div>
//           </div>
//         </div>

//         <button onClick={handleSave} disabled={loading}
//           className="w-full bg-purple-500 hover:bg-purple-600 py-3 rounded-xl text-white font-semibold transition">
//           {loading ? "Saving..." : "Save Campaign"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ContestantCampaign;
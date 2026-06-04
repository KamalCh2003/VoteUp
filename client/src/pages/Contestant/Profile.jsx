// // src/pages/Contestant/Profile.jsx
// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import API from "../../services/api";
// import toast from "react-hot-toast";
// import { User, Mail, Users, FileText, Save } from "lucide-react";

// const ContestantProfile = () => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [candidate, setCandidate] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     party: "",
//     description: "",
//     imageUrl: "",
//   });

//   useEffect(() => {
//     fetchCandidateProfile();
//   }, []);

//   const fetchCandidateProfile = async () => {
//     try {
//       const res = await API.get("/contestant/profile");
//       const data = res.data.data;
//       setCandidate(data);
//       setFormData({
//         name: data.name || user?.name || "",
//         email: data.email || user?.email || "",
//         party: data.party || "",
//         description: data.description || "",
//         imageUrl: data.imageUrl || "",
//       });
//     } catch (error) {
//       console.error("Failed to load profile", error);
//       toast.error("Could not load profile");
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await API.put("/contestant/profile", formData);
//       toast.success("Profile updated successfully");
//       fetchCandidateProfile(); // refresh
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!candidate && !loading) return <div className="text-white p-8">Loading profile...</div>;

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
//       <p className="text-gray-400 mb-8">Manage your public contestant information</p>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Avatar preview */}
//         {formData.imageUrl && (
//           <div className="mb-4">
//             <img src={formData.imageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-purple-500" />
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-gray-300 text-sm mb-2">Full Name</label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
//               <input type="text" name="name" value={formData.name} onChange={handleChange} required
//                 className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm mb-2">Email</label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
//               <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled
//                 className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white opacity-70 cursor-not-allowed" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm mb-2">Party</label>
//             <div className="relative">
//               <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
//               <input type="text" name="party" value={formData.party} onChange={handleChange} placeholder="e.g. Independent, Democratic Party"
//                 className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm mb-2">Image URL</label>
//             <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..."
//               className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 text-white" />
//           </div>
//         </div>

//         <div>
//           <label className="block text-gray-300 text-sm mb-2">Description / Bio</label>
//           <div className="relative">
//             <FileText className="absolute left-3 top-3 text-gray-500" size={18} />
//             <textarea name="description" value={formData.description} onChange={handleChange} rows="4"
//               placeholder="Tell voters about yourself, your vision, and your goals..."
//               className="w-full bg-[#0B1020] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white resize-none" />
//           </div>
//         </div>

//         <button type="submit" disabled={loading}
//           className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl text-white font-semibold transition">
//           <Save size={18} />
//           {loading ? "Saving..." : "Save Changes"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ContestantProfile;
// // src/pages/Register.jsx
// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const Register = () => {
//   const navigate = useNavigate();
//   const { register } = useAuth();

//   const [role, setRole] = useState("VOTER");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [elections, setElections] = useState([]);

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     contestantId: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [selectedElectionId, setSelectedElectionId] = useState("");

//   useEffect(() => {
//     if (role === "CONTESTANT") {
//       const fetchElections = async () => {
//         try {
//           const res = await axios.get("http://localhost:5000/api/elections");
//           setElections(res.data.data || []);
//         } catch (error) {
//           console.error("Failed to fetch elections", error);
//           toast.error("Could not load elections list");
//         }
//       };
//       fetchElections();
//     } else {
//       setSelectedElectionId("");
//     }
//   }, [role]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Form submitted");

//     if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
//       return toast.error("Please fill all fields");
//     }
//     if (role === "CONTESTANT" && !formData.contestantId) {
//       return toast.error("Contestant ID is required");
//     }
//     // ✅ REMOVED: validation for selectedElectionId – now optional
//     if (formData.password.length < 8) {
//       return toast.error("Password must be at least 8 characters");
//     }
//     if (formData.password !== formData.confirmPassword) {
//       return toast.error("Passwords do not match");
//     }

//     try {
//       setLoading(true);
//       const fullName = `${formData.firstName} ${formData.lastName}`.trim();
//       const payload = {
//         name: fullName,
//         email: formData.email,
//         password: formData.password,
//         role,
//       };
//       if (role === "CONTESTANT") {
//         payload.contestantId = formData.contestantId;
//         // Only send electionId if one was selected (non‑empty)
//         if (selectedElectionId) {
//           payload.electionId = selectedElectionId;
//         }
//       }
//       await register(payload);
//       toast.success("Registration Successful! Please login.");
//       navigate("/login");
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4 py-3 overflow-hidden">
//       <div className="w-full max-w-[430px] bg-[#070711] border border-white/10 rounded-[28px] p-5 lg:p-6 shadow-2xl">
//         {/* Logo */}
//         <div className="flex justify-center mb-1">
//           <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center">
//             <ShieldCheck className="text-green-400" size={22} />
//           </div>
//         </div>

//         <h1 className="text-white text-2xl lg:text-3xl font-bold text-center">Create your account</h1>
//         <p className="text-gray-400 text-center mt-1 mb-5 text-sm">Join thousands of verified voters on VoteChain</p>

//         {/* Role Tabs */}
//         <div className="bg-[#10101a] border border-white/10 rounded-2xl p-1 flex mb-5">
//           <button type="button" onClick={() => setRole("VOTER")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${role === "VOTER" ? "bg-purple-500 text-white" : "text-gray-400"}`}>
//             Voter
//           </button>
//           <button type="button" onClick={() => setRole("CONTESTANT")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${role === "CONTESTANT" ? "bg-purple-500 text-white" : "text-gray-400"}`}>
//             Contestant
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-3">
//           {/* Name Fields */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-gray-300 text-xs mb-1.5">First name</label>
//               <input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange}
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500" />
//             </div>
//             <div>
//               <label className="block text-gray-300 text-xs mb-1.5">Last name</label>
//               <input type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange}
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500" />
//             </div>
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-gray-300 text-xs mb-1.5">Email address</label>
//             <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange}
//               className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500" />
//           </div>

//           {/* Contestant ID */}
//           {role === "CONTESTANT" && (
//             <div>
//               <label className="block text-gray-300 text-xs mb-1.5">Contestant ID</label>
//               <input type="text" name="contestantId" placeholder="ID provided by admin" value={formData.contestantId} onChange={handleChange}
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500" />
//             </div>
//           )}

//           {/* Election Dropdown - now visible and optional */}
//           {role === "CONTESTANT" && (
//             <div>
//               <label className="block text-gray-300 text-xs mb-1.5">Select Election (Optional)</label>
//               {/* <select
//                 value={selectedElectionId}
//                 onChange={(e) => setSelectedElectionId(e.target.value)}
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
//               >
//                 <option value="">-- No election (optional) --</option>
//                 {elections.map((election) => (
//                   <option key={election.id} value={election.id}>
//                     {election.title} ({election.status})
//                   </option>
//                 ))}
//               </select> */}
//             </div>
//           )}

//           {/* Password */}
//           <div>
//             <label className="block text-gray-300 text-xs mb-1.5">Password</label>
//             <div className="relative">
//               <input type={showPassword ? "text" : "password"} name="password" placeholder="Min 8 characters" value={formData.password} onChange={handleChange}
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 pr-11 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500" />
//               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
//                 {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
//               </button>
//             </div>
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label className="block text-gray-300 text-xs mb-1.5">Confirm password</label>
//             <div className="relative">
//               <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange}
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 pr-11 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500" />
//               <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
//                 {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
//               </button>
//             </div>
//           </div>

//           {/* Security Box */}
//           <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-3 flex gap-3">
//             <div className="w-4 h-4 border border-green-400 rounded-sm mt-0.5 flex-shrink-0"></div>
//             <p className="text-gray-300 text-xs leading-relaxed">Your identity is verified securely and never shared.</p>
//           </div>

//           {/* Submit */}
//           <button type="submit" disabled={loading}
//             className="w-full h-11 bg-purple-500 hover:bg-purple-600 disabled:opacity-70 transition-all rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 mt-1">
//             {loading ? <><Loader2 className="animate-spin" size={16} /> Creating...</> : "Create Account"}
//           </button>
//         </form>

//         <p className="text-center text-gray-400 mt-5 text-sm">
//           Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;
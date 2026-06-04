// // src/pages/Login.jsx

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   // Role State
//   const [role, setRole] = useState("VOTER");
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     contestantId: "",
//     adminKey: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Handle Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.email || !formData.password) {
//       return toast.error("Please fill all required fields");
//     }

//     // Contestant Validation
//     if (role === "CONTESTANT" && !formData.contestantId) {
//       return toast.error("Contestant ID is required");
//     }

//     // Admin Validation
//     if (role === "ADMIN" && !formData.adminKey) {
//       return toast.error("Admin Security Key is required");
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         email: formData.email,
//         password: formData.password,
//         role,
//       };
//       if (role === "CONTESTANT") payload.contestantId = formData.contestantId;
//       if (role === "ADMIN") payload.adminKey = formData.adminKey;

//       const response = await login(payload);
//       toast.success("Login Successful");

//       const userRole = response?.data?.user?.role?.toLowerCase();

//       switch (userRole) {
//         case "admin":
//           navigate("/admin/AdminHome");
//           break;
//         case "contestant":
//           navigate("/contestant/ContestantHome");
//           break;
//         case "voter":
//         default:
//           navigate("/voter/userhome");
//           break;
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4 py-4 overflow-hidden">
//       {/* Login Card */}
//       <div className="w-full max-w-[420px] bg-[#070711] border border-white/10 rounded-[28px] p-5 lg:p-6 shadow-2xl">
//         {/* Logo */}
//         <div className="flex justify-center mb-3">
//           <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center">
//             <ShieldCheck className="text-green-400" size={22} />
//           </div>
//         </div>

//         {/* Heading */}
//         <h1 className="text-white text-2xl lg:text-3xl font-bold text-center">
//           Welcome back
//         </h1>

//         <p className="text-gray-400 text-center mt-1 mb-5 text-sm">
//           Sign in to your VoteChain account
//         </p>

//         <button
//           type="button"
//           onClick={() => toast.error("Google login not implemented yet")}
//           className="w-full h-11 flex items-center justify-center gap-3 rounded-full border border-white/10 bg-[#141420] hover:bg-[#1a1a2a] transition-all text-white text-sm font-medium"
//         >
//           <img
//             src="https://www.svgrepo.com/show/475656/google-color.svg"
//             alt="google"
//             className="w-4 h-4"
//           />
//           Continue with Google
//         </button>

//         {/* Divider */}
//         <div className="flex items-center gap-3 my-5">
//           <div className="flex-1 h-[1px] bg-white/10"></div>

//           <p className="text-xs text-gray-500 whitespace-nowrap">
//             or continue with email
//           </p>

//           <div className="flex-1 h-[1px] bg-white/10"></div>
//         </div>

//         {/* Role Tabs */}
//         <div className="bg-[#10101a] border border-white/10 rounded-2xl p-1 flex mb-5">
//           {/* Voter */}
//           <button
//             type="button"
//             onClick={() => setRole("VOTER")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
//               role === "VOTER" ? "bg-purple-500 text-white" : "text-gray-400"
//             }`}
//           >
//             Voter
//           </button>

//           {/* Contestant */}
//           <button
//             type="button"
//             onClick={() => setRole("CONTESTANT")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
//               role === "CONTESTANT"
//                 ? "bg-purple-500 text-white"
//                 : "text-gray-400"
//             }`}
//           >
//             Contestant
//           </button>

//           {/* Admin */}
//           <button
//             type="button"
//             onClick={() => setRole("ADMIN")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
//               role === "ADMIN" ? "bg-purple-500 text-white" : "text-gray-400"
//             }`}
//           >
//             Admin
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-3.5">
//           {/* Email */}
//           <div>
//             <label className="block text-gray-300 text-xs mb-1.5">
//               Email address
//             </label>

//             <input
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
//             />
//           </div>

//           {/* Contestant ID */}
//           {role === "CONTESTANT" && (
//             <div>
//               <label className="block text-gray-300 text-xs mb-1.5">
//                 Contestant ID
//               </label>

//               <input
//                 type="text"
//                 name="contestantId"
//                 placeholder="Enter contestant ID"
//                 value={formData.contestantId}
//                 onChange={handleChange}
//                 required
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
//               />
//             </div>
//           )}

//           {/* Admin Key */}
//           {role === "ADMIN" && (
//             <div>
//               <label className="block text-gray-300 text-xs mb-1.5">
//                 Admin Security Key
//               </label>

//               <input
//                 type="password"
//                 name="adminKey"
//                 placeholder="Enter admin key"
//                 value={formData.adminKey}
//                 onChange={handleChange}
//                 required
//                 className="w-full h-11 bg-[#12121b] border border-red-500/20 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-red-500"
//               />
//             </div>
//           )}

//           {/* Password */}
//           <div>
//             <label className="block text-gray-300 text-xs mb-1.5">
//               Password
//             </label>

//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 pr-11 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
//               >
//                 {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
//               </button>
//             </div>
//           </div>

//           {/* Remember */}
//           <div className="flex items-center justify-between text-xs">
//             <label className="flex items-center gap-2 text-gray-400">
//               <input type="checkbox" className="accent-purple-500" />
//               Remember me
//             </label>

//             <button
//               type="button"
//               className="text-purple-400 hover:text-purple-300"
//             >
//               Forgot password?
//             </button>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full h-11 bg-purple-500 hover:bg-purple-600 disabled:opacity-70 transition-all rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 mt-1"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="animate-spin" size={16} />
//                 Signing In...
//               </>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>

//         {/* Bottom */}
//         <p className="text-center text-gray-400 mt-5 text-sm">
//           No account?{" "}
//           <Link
//             to="/register"
//             className="text-purple-400 hover:text-purple-300"
//           >
//             Sign up free
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

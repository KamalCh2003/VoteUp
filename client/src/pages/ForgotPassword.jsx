// // src/pages/ForgotPassword.jsx

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
// import toast from "react-hot-toast";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email) {
//       return toast.error("Email is required");
//     }

//     try {
//       setLoading(true);

//       // TODO: connect API later
//       await new Promise((res) => setTimeout(res, 1500));

//       toast.success("Password reset link sent to your email!");
//       setEmail("");
//     } catch (error) {
//       toast.error("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#070711] px-4">

//       <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-md">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
//               <ShieldCheck className="text-purple-400" size={24} />
//             </div>
//           </div>

//           <h1 className="text-2xl font-bold text-white">
//             Forgot Password
//           </h1>

//           <p className="text-gray-400 text-sm mt-2">
//             Enter your email and we’ll send you a reset link
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">

//           {/* Email */}
//           <div>
//             <label className="text-sm text-gray-400">Email</label>

//             <div className="mt-2 flex items-center bg-white/5 border border-white/10 rounded-xl px-3">
//               <Mail className="text-gray-400" size={18} />

//               <input
//                 type="email"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full bg-transparent p-3 text-white outline-none"
//               />
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center"
//           >
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>
//         </form>

//         {/* Back to login */}
//         <div className="mt-6 text-center">
//           <Link
//             to="/login"
//             className="text-sm text-gray-400 hover:text-purple-400 inline-flex items-center gap-1"
//           >
//             <ArrowLeft size={16} />
//             Back to Login
//           </Link>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default ForgotPassword;
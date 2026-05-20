// src/pages/VerifyEmail.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code) {
      return toast.error("Verification code is required");
    }

    try {
      setLoading(true);

      // TODO: connect backend API
      await new Promise((res) => setTimeout(res, 1500));

      toast.success("Email verified successfully!");
      setCode("");
    } catch (error) {
      toast.error("Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);

      // TODO: resend API
      await new Promise((res) => setTimeout(res, 1500));

      toast.success("Verification code resent to your email");
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070711] px-4">

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-md">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <ShieldCheck className="text-purple-400" size={24} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white">
            Verify Your Email
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            We sent a verification code to your email
          </p>

        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <MailCheck className="text-purple-400" size={40} />
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-5">

          {/* Code Input */}
          <div>
            <label className="text-sm text-gray-400">
              Verification Code
            </label>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none text-center tracking-widest text-lg"
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">

          <p className="text-gray-400 text-sm mb-3">
            Didn’t receive the code?
          </p>

          <button
            onClick={handleResend}
            disabled={resending}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            {resending ? "Resending..." : "Resend Code"}
          </button>

        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
};

export default VerifyEmail;
// src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState("VOTER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role,
      });

      if (response.devOtp) {
        navigate(
          `/verify-email?email=${encodeURIComponent(formData.email)}&otp=${response.devOtp}`
        );
        return;
      }

      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register in under a minute and start voting."
      backTo="/"
    >
      <div className="flex gap-2 mb-5 bg-[#F8FAFC] p-1">
        <button
          type="button"
          onClick={() => setRole("VOTER")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            role === "VOTER"
              ? "bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white shadow-sm"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Voter
        </button>
        <button
          type="button"
          onClick={() => setRole("CONTESTANT")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            role === "CONTESTANT"
              ? "bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white shadow-sm"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Contestant
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
            className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-11 text-sm text-[#0F172A] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#64748B]"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-11 text-sm text-[#0F172A] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#64748B]"
          >
            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex gap-3 rounded-xl border border-[#6D28D9]/20 bg-[#F3ECFE] p-3 text-xs text-[#64748B]">
          <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-[#6D28D9]" />
          <span className="leading-relaxed">
            Your identity is verified securely and never shared.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white font-semibold shadow-md shadow-purple-600/25 transition hover:brightness-105 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748B]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#6D28D9] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
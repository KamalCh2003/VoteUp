// src/components/auth/LoginForm.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AuthLayout from "./AuthLayout";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedError = sessionStorage.getItem("loginError");
    if (storedError) setErrorMessage(storedError);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error === "google_auth_failed") {
      toast.error("Google authentication failed. Please try again.");
      window.history.replaceState({}, document.title, "/login");
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) {
      setErrorMessage("");
      sessionStorage.removeItem("loginError");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      const msg = "Please fill all required fields";
      setErrorMessage(msg);
      sessionStorage.setItem("loginError", msg);
      return;
    }
    setLoading(true);
    setErrorMessage("");
    sessionStorage.removeItem("loginError");
    try {
      const user = await login(formData.email, formData.password);
      toast.success("Login Successful");
      const urlParams = new URLSearchParams(location.search);
      const from = urlParams.get("from");
      const redirect = from
        ? decodeURIComponent(from)
        : user.role === "ADMIN"
          ? "/admin/dashboard"
          : user.role === "CONTESTANT"
            ? "/contestant/profile-campaign"
            : "/voter/dashboard";
      navigate(redirect);
    } catch (err) {
      const msg = err?.response?.data?.error || "Login failed";
      setErrorMessage(msg);
      sessionStorage.setItem("loginError", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to vote, track elections, and manage your account."
      backTo="/"
    >
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition"
      >
        {googleLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 text-[#64748B]">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-1">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
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
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#64748B]">
            <input type="checkbox" className="accent-[#6D28D9]" /> Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-[#6D28D9] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white font-semibold shadow-md shadow-purple-600/25 transition hover:brightness-105 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Log in"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#64748B]">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-[#6D28D9] hover:underline">
          Create one
        </Link>
      </div>
    </AuthLayout>
  );
}
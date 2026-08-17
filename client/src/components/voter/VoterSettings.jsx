// src/components/voter/VoterSettings.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import GlassCard from "../common/GlassCard";
import Button from "../common/Button";
import { useToast } from "../../context/ToastContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Loader2,
  Camera,
  Eye,
  EyeOff,
  UserCog,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function VoterSettings() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Accordion state – both sections open by default
  const [openProfile, setOpenProfile] = useState(true);
  const [openSecurity, setOpenSecurity] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      updateUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all password fields");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setChangingPassword(true);
    try {
      await api.post("/users/me/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = { ...user, avatarUrl: data.avatarUrl };
      updateUser(updatedUser);
      setProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Settings</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Manage your profile and security settings
          </p>
        </div>

        {/* Profile Accordion */}
        <div className="mb-4">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-t-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <UserCog size={20} className="text-violet-600" />
              <span className="font-semibold text-gray-800">Profile</span>
            </div>
            {openProfile ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
          </button>
          {openProfile && (
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden shadow-md">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {profile.firstName?.[0]?.toUpperCase()}
                        {profile.lastName?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-violet-600 shadow-sm transition disabled:opacity-50"
                    title="Change avatar"
                  >
                    {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail size={14} /> {profile.email}
                  </p>
                  {user?.role && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Shield size={14} /> {user.role}
                      {user.isVerified && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Verified
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3">
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="First Name"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Last Name"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  type="email"
                  placeholder="Email"
                  value={profile.email}
                  disabled
                />
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                <Button type="submit" variant="primary" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Save Changes"}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Security Accordion */}
        <div>
          <button
            onClick={() => setOpenSecurity(!openSecurity)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-t-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <Lock size={20} className="text-violet-600" />
              <span className="font-semibold text-gray-800">Security</span>
            </div>
            {openSecurity ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
          </button>
          {openSecurity && (
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-5">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="relative">
                  <input
                    className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    type={showCurrent ? "text" : "password"}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    type={showNew ? "text" : "password"}
                    placeholder="New Password (min. 8 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={changingPassword}>
                  {changingPassword ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Password"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// src/components/common/EditProfileModal.jsx
import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function EditProfileModal({ open, onClose, profile, onSave }) {
  const [form, setForm] = useState({
    slogan: '',
    bio: '',
    manifesto: '',
    websiteUrl: '',
    twitterHandle: '',
    instagramHandle: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && open) {
      setForm({
        slogan: profile.slogan || '',
        bio: profile.bio || '',
        manifesto: profile.manifesto || '',
        websiteUrl: profile.websiteUrl || '',
        twitterHandle: profile.twitterHandle || '',
        instagramHandle: profile.instagramHandle || '',
      });
    }
  }, [profile, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg mx-4 bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Slogan</label>
            <input
              type="text"
              name="slogan"
              value={form.slogan}
              onChange={handleChange}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
              placeholder="Your campaign slogan"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Manifesto</label>
            <textarea
              name="manifesto"
              rows={4}
              value={form.manifesto}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 resize-none"
              placeholder="Your manifesto..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              rows={5}
              value={form.bio}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 resize-none"
              placeholder="Tell voters about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={handleChange}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Twitter Handle</label>
            <input
              type="text"
              name="twitterHandle"
              value={form.twitterHandle}
              onChange={handleChange}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Instagram Handle</label>
            <input
              type="text"
              name="instagramHandle"
              value={form.instagramHandle}
              onChange={handleChange}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
              placeholder="@username"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-70 transition text-white text-sm font-semibold"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
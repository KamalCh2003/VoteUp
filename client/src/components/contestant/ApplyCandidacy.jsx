// src/components/contestant/ApplyCandidacy.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, PartyPopper, Quote, FileText, Loader2, Upload, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ApplyCandidacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    electionId: '',
    party: '',
    slogan: '',
    bio: '',
  });

  useEffect(() => {
    api.get('/elections', { params: { status: 'UPCOMING' } })
      .then(({ data }) => setElections(data.elections || []))
      .catch(() => toast.error('Failed to load elections'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.electionId) return toast.error('Please select an election');
    if (!form.party) return toast.error('Party / Affiliation is required');
    if (!profileImage) return toast.error('Profile image is required');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('electionId', form.electionId);
      formData.append('party', form.party);
      formData.append('slogan', form.slogan);
      formData.append('bio', form.bio);
      formData.append('profileImage', profileImage);

      await api.post('/candidates/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Application submitted successfully!');
      navigate('/contestant/profile-campaign');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-md">
            <Vote size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Apply for Candidacy</h2>
            <p className="text-sm text-gray-500">
              Welcome, {user?.firstName || 'User'}. Fill the details to run for an election.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Election Selection */}
          <div>
            <label className="block text-gray-700 text-sm mb-1.5 flex items-center gap-1.5">
              <Vote size={16} className="text-violet-500" /> Select Election *
            </label>
            <select
              name="electionId"
              value={form.electionId}
              onChange={handleChange}
              required
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
            >
              <option value="">-- Choose an election --</option>
              {elections.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.title} ({el.status})
                </option>
              ))}
            </select>
          </div>

          {/* Party */}
          <div>
            <label className="block text-gray-700 text-sm mb-1.5 flex items-center gap-1.5">
              <PartyPopper size={16} className="text-pink-600" /> Party / Affiliation *
            </label>
            <input
              type="text"
              name="party"
              placeholder="e.g., Progressive Alliance"
              value={form.party}
              onChange={handleChange}
              required
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
            />
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block text-gray-700 text-sm mb-1.5 flex items-center gap-1.5">
              <Upload size={16} className="text-blue-600" /> Profile Image *
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                  <Upload size={24} />
                </div>
              )}
              <label className="cursor-pointer bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!profileImage}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended: Square image, max 5MB (JPG, PNG, WEBP)</p>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-gray-700 text-sm mb-1.5 flex items-center gap-1.5">
              <Quote size={16} className="text-yellow-600" /> Slogan
            </label>
            <input
              type="text"
              name="slogan"
              placeholder="A short, catchy phrase"
              value={form.slogan}
              onChange={handleChange}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 text-sm mb-1.5 flex items-center gap-1.5">
              <FileText size={16} className="text-green-600" /> Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              placeholder="Tell voters about yourself…"
              value={form.bio}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70 transition-all rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Vote size={18} /> Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
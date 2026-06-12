import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, Vote, PartyPopper, Quote, FileText, Loader2, Upload, X } from 'lucide-react';
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
    candidateNumber: '',
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
    if (!form.candidateNumber) return toast.error('Candidate ID is required');
    if (!form.party) return toast.error('Party / Affiliation is required');
    if (!profileImage) return toast.error('Profile image is required');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('electionId', form.electionId);
      formData.append('candidateNumber', form.candidateNumber);
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
      // Backend will return 400 if candidate number is duplicate
      toast.error(err.response?.data?.error || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl bg-[#070711] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Vote size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Apply for Candidacy</h2>
            <p className="text-sm text-gray-400">
              Welcome, {user?.firstName || 'User'}. Fill the details to run for an election.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Election Selection */}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Vote size={16} className="text-violet-400" /> Select Election *
            </label>
            <select
              name="electionId"
              value={form.electionId}
              onChange={handleChange}
              required
              className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
            >
              <option value="">-- Choose an election --</option>
              {elections.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.title} ({el.status})
                </option>
              ))}
            </select>
          </div>

          {/* Candidate Number */}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <IdCard size={16} className="text-cyan-400" /> Candidate ID *
            </label>
            <input
              type="text"
              name="candidateNumber"
              placeholder="e.g., CN-2025-001"
              value={form.candidateNumber}
              onChange={handleChange}
              required
              className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
            />
          </div>

          {/* Party */}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <PartyPopper size={16} className="text-pink-400" /> Party / Affiliation *
            </label>
            <input
              type="text"
              name="party"
              placeholder="e.g., Progressive Alliance"
              value={form.party}
              onChange={handleChange}
              required
              className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
            />
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Upload size={16} className="text-blue-400" /> Profile Image *
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
                <div className="h-20 w-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-gray-400">
                  <Upload size={24} />
                </div>
              )}
              <label className="cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
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
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Quote size={16} className="text-yellow-400" /> Slogan
            </label>
            <input
              type="text"
              name="slogan"
              placeholder="A short, catchy phrase"
              value={form.slogan}
              onChange={handleChange}
              className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <FileText size={16} className="text-green-400" /> Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              placeholder="Tell voters about yourself…"
              value={form.bio}
              onChange={handleChange}
              className="w-full bg-[#12121b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-70 transition-all rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2"
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
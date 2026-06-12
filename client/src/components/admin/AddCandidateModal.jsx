import { useState, useEffect } from 'react';
import { X, UserPlus, Hash, Building2, Vote, Mail, Shield, Loader2, Upload, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AddCandidateModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    candidateNumber: '',
    party: '',
    electionId: '',
    slogan: '',
    bio: '',
  });
  const [candidateNumberError, setCandidateNumberError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (open) {
      api.get('/elections', { params: { status: 'UPCOMING' } })
        .then(({ data }) => setElections(data.elections || []))
        .catch(() => toast.error('Could not load elections'));
      api.get('/admin/candidates')
        .then(({ data }) => setAllCandidates(data.candidates || []))
        .catch(() => console.warn('Could not fetch candidates for validation'));
    }
  }, [open, toast]);

  // Validate candidateNumber uniqueness per election
  useEffect(() => {
    if (!form.electionId || !form.candidateNumber) {
      setCandidateNumberError('');
      return;
    }
    const isDuplicate = allCandidates.some(
      (c) => c.electionId === form.electionId && c.candidateNumber === form.candidateNumber
    );
    if (isDuplicate) {
      setCandidateNumberError(`Candidate number "${form.candidateNumber}" already exists in this election.`);
    } else {
      setCandidateNumberError('');
    }
  }, [form.candidateNumber, form.electionId, allCandidates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
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
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.party || !form.electionId) {
      return toast.error('Please fill all required fields (name, email, party, election).');
    }
    if (candidateNumberError) {
      return toast.error(candidateNumberError);
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('firstName', form.firstName);
      payload.append('lastName', form.lastName);
      payload.append('email', form.email);
      payload.append('party', form.party);
      payload.append('electionId', form.electionId);
      payload.append('slogan', form.slogan);
      payload.append('bio', form.bio);
      payload.append('candidateNumber', form.candidateNumber);
      if (avatarFile) payload.append('avatar', avatarFile);

      await api.post('/admin/create-candidate', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Candidate added successfully!');
      setForm({
        firstName: '', lastName: '', email: '', candidateNumber: '', party: '', electionId: '', slogan: '', bio: '',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Candidate</h2>
              <p className="text-sm text-gray-400">Fill in the details to register a contestant.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full h-11 pl-10 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                placeholder="candidate@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Candidate Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="candidateNumber"
                  value={form.candidateNumber}
                  onChange={handleChange}
                  className={`w-full h-11 pl-10 bg-[#12121b] border rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500 ${
                    candidateNumberError ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="CN-001"
                />
              </div>
              {candidateNumberError && (
                <p className="text-xs text-red-400 mt-1">{candidateNumberError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Organization / Party *</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="party"
                  value={form.party}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-10 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                  placeholder="Progressive Alliance"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Election *</label>
              <div className="relative">
                <Vote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="electionId"
                  value={form.electionId}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-10 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Select election...</option>
                  {elections.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Slogan</label>
            <input
              type="text"
              name="slogan"
              value={form.slogan}
              onChange={handleChange}
              className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
              placeholder="Building a better tomorrow"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Bio</label>
            <textarea
              name="bio"
              rows="3"
              value={form.bio}
              onChange={handleChange}
              className="w-full bg-[#12121b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500 resize-none"
              placeholder="Short biography..."
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Upload size={16} className="text-blue-400" /> Profile Image
            </label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <XCircle size={12} className="text-white" />
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
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended: Square image, max 5MB (JPG, PNG, WEBP)</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!candidateNumberError}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-70 transition text-white text-sm font-semibold"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
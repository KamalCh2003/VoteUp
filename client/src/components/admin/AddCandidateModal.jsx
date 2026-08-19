import { useState, useEffect } from 'react';
import { X, UserPlus, Building2, Vote, Mail, Loader2, Upload, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AddCandidateModal({ open, onClose, onSuccess, electionId: initialElectionId, hideElectionSelect = false }) {
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    party: '',
    electionId: initialElectionId || '',
    slogan: '',
    bio: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (open && !hideElectionSelect) {
      api.get('/elections', { params: { status: 'UPCOMING' } })
        .then(({ data }) => setElections(data.elections || []))
        .catch(() => toast.error('Could not load elections'));
    }
    if (open && initialElectionId) {
      setForm((prev) => ({ ...prev, electionId: initialElectionId }));
    }
    if (!open) {
      setAvatarFile(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  }, [open, toast, initialElectionId, hideElectionSelect]);

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

    if (!form.firstName || !form.lastName || !form.email) {
      return toast.error('Please fill all required fields (name and email).');
    }

    if (!hideElectionSelect && !form.electionId) {
      return toast.error('Please select an election.');
    }

    try {
      setLoading(true);

      if (hideElectionSelect) {
        const candidateData = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          party: form.party || null,
          slogan: form.slogan,
          bio: form.bio,
          avatarFile: avatarFile,
        };
        onSuccess?.(candidateData);
        onClose();
        return;
      }

      const payload = new FormData();
      payload.append('firstName', form.firstName);
      payload.append('lastName', form.lastName);
      payload.append('email', form.email);
      payload.append('party', form.party || '');
      payload.append('electionId', form.electionId);
      payload.append('slogan', form.slogan);
      payload.append('bio', form.bio);
      if (avatarFile) payload.append('avatar', avatarFile);

      await api.post('/admin/create-candidate', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Candidate added successfully!');
      setForm({
        firstName: '', lastName: '', email: '', party: '', electionId: initialElectionId || '', slogan: '', bio: '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {hideElectionSelect ? 'Add Candidate (during election creation)' : 'Add New Candidate'}
              </h2>
              <p className="text-sm text-gray-500">Fill in the details to register a contestant.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full h-11 pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
                placeholder="candidate@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Organization / Party</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="party"
                  value={form.party}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {!hideElectionSelect && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Election *</label>
              <div className="relative">
                <Vote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="electionId"
                  value={form.electionId}
                  onChange={handleChange}
                  required
                  disabled={!!initialElectionId}
                  className={`w-full h-11 pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 outline-none appearance-none cursor-pointer ${
                    initialElectionId ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select election...</option>
                  {elections.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                </select>
              </div>
              {initialElectionId && (
                <p className="text-xs text-gray-500 mt-1">Election is pre‑selected and cannot be changed.</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Slogan</label>
            <input
              type="text"
              name="slogan"
              value={form.slogan}
              onChange={handleChange}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
              placeholder="Building a better tomorrow"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              rows="3"
              value={form.bio}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 resize-none"
              placeholder="Short biography..."
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1.5 flex items-center gap-1.5">
              <Upload size={16} className="text-violet-500" /> Profile Image
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
                <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                  <Upload size={24} />
                </div>
              )}
              <label className="cursor-pointer bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
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
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-70 transition text-white text-sm font-semibold"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? (hideElectionSelect ? 'Adding...' : 'Saving...') : (hideElectionSelect ? 'Add to list' : 'Add Candidate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
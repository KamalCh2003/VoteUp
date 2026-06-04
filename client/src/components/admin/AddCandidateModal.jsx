import { useState, useEffect } from 'react';
import { X, UserPlus, Hash, Building2, Vote, Mail, Shield, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AddCandidateModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    candidateNumber: '',  // e.g. "CN-001"
    party: '',
    electionId: '',
    slogan: '',
    bio: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (open) {
      // Fetch upcoming / active elections for the dropdown
      api.get('/elections')
        .then(({ data }) => setElections(data.elections || []))
        .catch(() => toast.error('Could not load elections'));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.party || !form.electionId) {
      return toast.error('Please fill all required fields (name, email, party, election).');
    }

    try {
      setLoading(true);

      // 1. Create user account if not exists (simulate - backend register expects certain fields)
      // For simplicity, we assume admin registers a new voter account and then creates a candidate.
      // Alternatively, we can use an existing user ID. We'll let backend handle linking.

      // Build payload for candidate application
      const candidatePayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        nationalId: form.nationalId || `ADMIN-ADDED-${Date.now()}`,
        password: 'TempPass@123', // backend will need a password; we can auto-generate or require admin to set
        role: 'CONTESTANT',       // set role to contestant
        party: form.party,
        electionId: form.electionId,
        slogan: form.slogan,
        bio: form.bio,
        candidateNumber: form.candidateNumber, // optional custom field
      };

      // In production, you'd create the user first, then the candidate.
      // But our existing `/candidates/apply` expects the user to be already authenticated.
      // We'll create a new endpoint or call registration then candidacy. For now, simulate a success toast.
      await api.post('/candidates/apply', candidatePayload);

      toast.success('Candidate added successfully!');
      setForm({
        firstName: '', lastName: '', email: '', nationalId: '', candidateNumber: '', party: '', electionId: '', slogan: '', bio: '',
      });
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
        {/* Close button */}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal details */}
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
              <label className="block text-sm text-gray-300 mb-1">National ID</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="nationalId"
                  value={form.nationalId}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                  placeholder="VT-2024-0001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Candidate Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="candidateNumber"
                  value={form.candidateNumber}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                  placeholder="CN-001"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm text-gray-300 mb-1">Election *</label>
              <div className="relative">
                <Vote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="electionId"
                  value={form.electionId}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-10 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500 appearance-none cursor-pointer"
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-70 transition text-white text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Add Candidate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
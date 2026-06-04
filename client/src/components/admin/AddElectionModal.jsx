import { useState } from 'react';
import {
  X, Calendar, Clock, Users, Image as ImageIcon, Type, AlignLeft,
  Tag, Shield, Loader2, Vote, Phone, Mail, User, DollarSign
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AddElectionModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Academic',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    maxCandidates: 10,
    maxVoters: 0,        // 0 = unlimited
    votePrice: 100,      // new: base price per vote in NPR
    electionType: 'public',
    rules: '',
    banner: null,
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'banner') {
      setForm((prev) => ({ ...prev, banner: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.startDate || !form.endDate) {
      return toast.error('Title, start date, and end date are required.');
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === 'banner' && form.banner) {
        formData.append('banner', form.banner);
      } else if (key !== 'banner') {
        formData.append(key, form[key]);
      }
    });

    // Combine date & time
    const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
    const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
    formData.set('startDate', startDateTime.toISOString());
    formData.set('endDate', endDateTime.toISOString());
    formData.delete('startTime');
    formData.delete('endTime');

    setLoading(true);
    try {
      const config = form.banner
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      await api.post('/elections', formData, config);
      toast.success('Election created successfully!');
      setForm({
        title: '', description: '', category: 'Academic',
        startDate: '', startTime: '08:00', endDate: '', endTime: '17:00',
        maxCandidates: 10, maxVoters: 0, votePrice: 100,
        electionType: 'public', rules: '', banner: null,
        organizerName: '', organizerEmail: '', organizerPhone: '',
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Vote size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Election</h2>
            <p className="text-sm text-gray-400">Fill in the complete details for the election</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">
                <Type size={14} className="inline mr-1.5" /> Election Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                placeholder="Student Council President 2025"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Tag size={14} className="inline mr-1.5" /> Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              >
                <option>Academic</option>
                <option>Sports</option>
                <option>Lifestyle</option>
                <option>Culture</option>
                <option>Technology</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              <AlignLeft size={14} className="inline mr-1.5" /> Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-[#12121b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500 resize-none"
              placeholder="Describe the purpose and scope of this election..."
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Calendar size={14} className="inline mr-1.5" /> Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Clock size={14} className="inline mr-1.5" /> Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Calendar size={14} className="inline mr-1.5" /> End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Clock size={14} className="inline mr-1.5" /> End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Capacity Settings + Vote Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Users size={14} className="inline mr-1.5" /> Max Candidates
              </label>
              <input
                type="number"
                name="maxCandidates"
                value={form.maxCandidates}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Users size={14} className="inline mr-1.5" /> Max Voters
              </label>
              <input
                type="number"
                name="maxVoters"
                value={form.maxVoters}
                onChange={handleChange}
                min="0"
                placeholder="0 = unlimited"
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <Shield size={14} className="inline mr-1.5" /> Type
              </label>
              <select
                name="electionType"
                value={form.electionType}
                onChange={handleChange}
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                <DollarSign size={14} className="inline mr-1.5" /> Vote Price (रू)
              </label>
              <input
                type="number"
                name="votePrice"
                value={form.votePrice}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              <AlignLeft size={14} className="inline mr-1.5" /> Election Rules / Terms
            </label>
            <textarea
              name="rules"
              rows="3"
              value={form.rules}
              onChange={handleChange}
              className="w-full bg-[#12121b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500 resize-none"
              placeholder="Any specific rules or terms for this election..."
            />
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              <ImageIcon size={14} className="inline mr-1.5" /> Banner Image
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#12121b] cursor-pointer hover:bg-white/5 transition">
                <ImageIcon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">{form.banner ? form.banner.name : 'Choose file'}</span>
                <input
                  type="file"
                  name="banner"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {form.banner && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, banner: null })}
                  className="text-red-400 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200×600px. JPG, PNG, or WebP.</p>
          </div>

          {/* Organizer Info */}
          <div className="border-t border-white/10 pt-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-1.5">
              <User size={14} /> Organizer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  <User size={14} className="inline mr-1.5" /> Name
                </label>
                <input
                  type="text"
                  name="organizerName"
                  value={form.organizerName}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                  placeholder="Election Committee"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  <Mail size={14} className="inline mr-1.5" /> Email
                </label>
                <input
                  type="email"
                  name="organizerEmail"
                  value={form.organizerEmail}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                  placeholder="organizer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  <Phone size={14} className="inline mr-1.5" /> Phone
                </label>
                <input
                  type="tel"
                  name="organizerPhone"
                  value={form.organizerPhone}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#12121b] border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500"
                  placeholder="+977 9800000000"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
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
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Vote size={16} /> Create Election
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// src/components/voter/CreateElectionRequest.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Calendar, Clock, Users, Image as ImageIcon, Type, AlignLeft,
  Tag, Shield, Loader2, Vote, Phone, Mail, User, DollarSign,
  CreditCard, Gift, FileText
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CreateElectionRequest() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Academic',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    maxCandidates: 10,
    maxVoters: 0,
    votePrice: 100,
    rules: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    banner: null,
  });

  const [votingType, setVotingType] = useState('paid'); // 'free' or 'paid'

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'banner') {
      setForm((prev) => ({ ...prev, banner: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVotingTypeChange = (type) => {
    setVotingType(type);
    if (type === 'free') {
      setForm((prev) => ({ ...prev, votePrice: 0 }));
    } else if (type === 'paid' && form.votePrice === 0) {
      setForm((prev) => ({ ...prev, votePrice: 100 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.startDate || !form.endDate) {
      return toast.error('Title, start date, and end date are required.');
    }

    const startTimeStr = form.startTime || '00:00';
    const endTimeStr = form.endTime || '23:59';
    const startDateTime = new Date(`${form.startDate}T${startTimeStr}`);
    const endDateTime = new Date(`${form.endDate}T${endTimeStr}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return toast.error('Invalid date or time format.');
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      maxCandidates: Number(form.maxCandidates),
      maxVoters: Number(form.maxVoters),
      votePrice: Number(form.votePrice),
      rules: form.rules || null,
      organizerName: form.organizerName || null,
      organizerEmail: form.organizerEmail || null,
      organizerPhone: form.organizerPhone || null,
    };

    let request;
    if (form.banner) {
      const formData = new FormData();
      Object.keys(payload).forEach(key => formData.append(key, payload[key]));
      formData.append('banner', form.banner);
      request = api.post('/elections/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      request = api.post('/elections/request', payload);
    }

    setLoading(true);
    try {
      await request;
      toast.success('Election request submitted! Admin will review it shortly.');
      navigate('/elections'); // or a success page
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Vote size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Propose a New Election</h2>
            <p className="text-sm text-gray-500">Fill in the details to request a new election. Admin will review and approve.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Election Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 focus:outline-none focus:border-violet-500">
                <option>Singing</option> <option>Dance</option><option>Cooking</option><option>Art</option>
                <option>Debate</option><option>Academic</option><option>Sports</option><option>Lifestyle</option>
                <option>Culture</option><option>Technology</option><option>Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-violet-500" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-700 mb-1">Start Date *</label><input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Start Time</label><input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" /></div>
            <div><label className="block text-sm text-gray-700 mb-1">End Date *</label><input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" /></div>
            <div><label className="block text-sm text-gray-700 mb-1">End Time</label><input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" /></div>
          </div>

          {/* Capacity + Vote Type + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm text-gray-700 mb-1">Max Candidates</label><input type="number" name="maxCandidates" value={form.maxCandidates} onChange={handleChange} min="1" max="50" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" /></div>
            <div><label className="block text-sm text-gray-700 mb-1">Max Voters (0 = unlimited)</label><input type="number" name="maxVoters" value={form.maxVoters} onChange={handleChange} min="0" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" /></div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Vote Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleVotingTypeChange('free')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${votingType === 'free' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Gift size={16}/> Free</button>
                <button type="button" onClick={() => handleVotingTypeChange('paid')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${votingType === 'paid' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><CreditCard size={16}/> Paid</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Vote Price (रू)</label>
              <input type="number" name="votePrice" value={form.votePrice} onChange={handleChange} min="0" step="1" disabled={votingType === 'free'} className={`w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 ${votingType === 'free' ? 'opacity-50' : ''}`} />
              {votingType === 'free' && <p className="text-xs text-gray-500 mt-1">Free elections do not charge voters.</p>}
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Election Rules / Terms</label>
            <textarea name="rules" rows="3" value={form.rules} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none" placeholder="Any specific rules or terms..." />
          </div>

          {/* Organizer Details */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <User size={14} /> Organizer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input type="text" name="organizerName" value={form.organizerName} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" placeholder="Election Committee" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input type="email" name="organizerEmail" value={form.organizerEmail} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" placeholder="organizer@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input type="tel" name="organizerPhone" value={form.organizerPhone} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800" placeholder="+977 9800000000" />
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Banner Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <ImageIcon size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{form.banner ? form.banner.name : 'Choose file'}</span>
                <input type="file" name="banner" accept="image/*" onChange={handleChange} className="hidden" />
              </label>
              {form.banner && <button type="button" onClick={() => setForm({ ...form, banner: null })} className="text-red-600 text-sm hover:underline">Remove</button>}
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200×600px. JPG, PNG, or WebP.</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-70 transition text-white text-sm font-semibold">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Vote size={16} />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
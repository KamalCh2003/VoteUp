// src/components/admin/CreateElectionPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Calendar, Clock, Users, Image as ImageIcon, Type, AlignLeft,
  Tag, Shield, Loader2, Vote, Phone, Mail, User, DollarSign,
  CreditCard, Gift, FileText, Check, ChevronRight, ChevronLeft,
  ArrowLeft, Plus,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AddCandidateModal from './AddCandidateModal'; 

const steps = ['General', 'Voting', 'Candidates', 'Payment', 'Preview & Publish'];

export default function CreateElectionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];

  // State to control the candidate modal
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);

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

  const [votingType, setVotingType] = useState('paid');

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
    if (type === 'free') setForm((prev) => ({ ...prev, votePrice: 0 }));
    else if (type === 'paid' && form.votePrice === 0) setForm((prev) => ({ ...prev, votePrice: 100 }));
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!form.title || !form.category || !form.description || !form.startDate || !form.endDate) {
        return toast.error('Please fill all required fields in General');
      }
    }
    if (currentStep === 1) {
      if (!form.maxCandidates || form.maxCandidates < 1) {
        return toast.error('Max candidates must be at least 1');
      }
    }
    if (currentStep === 3) {
      if (votingType === 'paid' && form.votePrice <= 0) {
        return toast.error('Vote price must be greater than zero for paid elections');
      }
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startDateTime = new Date(`${form.startDate}T${form.startTime || '00:00'}`);
      const endDateTime = new Date(`${form.endDate}T${form.endTime || '23:59'}`);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        maxCandidates: Number(form.maxCandidates),
        maxVoters: Number(form.maxVoters),
        votePrice: Number(form.votePrice),
        rules: form.rules.trim() || null,
        organizerName: form.organizerName.trim() || null,
        organizerEmail: form.organizerEmail.trim() || null,
        organizerPhone: form.organizerPhone.trim() || null,
      };
      let request;
      if (form.banner) {
        const formData = new FormData();
        Object.keys(payload).forEach(key => formData.append(key, payload[key]));
        formData.append('banner', form.banner);
        request = api.post('/elections', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        request = api.post('/elections', payload);
      }
      await request;
      toast.success('Election created successfully!');
      navigate('/admin/elections');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Election Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none" placeholder="e.g. Miss Nepal 2026" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none">
                <option>Singing</option><option>Dance</option><option>Cooking</option><option>Art</option>
                <option>Debate</option><option>Academic</option><option>Sports</option><option>Lifestyle</option>
                <option>Culture</option><option>Technology</option><option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-violet-500 outline-none" placeholder="Describe the election" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label><input type="date" name="startDate" value={form.startDate} onChange={handleChange} min={today} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label><input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label><input type="date" name="endDate" value={form.endDate} onChange={handleChange} min={form.startDate || today} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label><input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Image (optional)</label>
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
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Voting Method</label><select className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"><option>Single choice</option><option>Ranked choice</option><option>Multiple picks</option></select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Vote limit per user</label><input type="number" value="1" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Eligibility</label><select className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"><option>All verified users</option><option>Invited only</option></select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Results visibility</label><select className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"><option>Live</option><option>After close</option><option>Admin only</option></select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Max Candidates *</label><input type="number" name="maxCandidates" value={form.maxCandidates} onChange={handleChange} min="1" max="50" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Max Voters (0 = unlimited)</label><input type="number" name="maxVoters" value={form.maxVoters} onChange={handleChange} min="0" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <p>Add candidates manually or upload a CSV. You can also add them later.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Name</label>
              <input placeholder="Full name" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Party / Organization</label>
              <input placeholder="Optional" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddCandidateModal(true)} // 👈 opens the modal
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Plus size={16} /> Add another candidate
          </button>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Entry Fee (Rs)</label><input type="number" name="votePrice" value={form.votePrice} onChange={handleChange} min="0" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Accepted Gateways</label><select className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"><option>Khalti + eSewa + Stripe</option><option>Khalti only</option><option>eSewa only</option><option>Stripe only</option><option>Free election</option></select></div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div><div className="font-medium text-gray-800">Premium voting</div><div className="text-sm text-gray-500">Allow users to buy extra votes</div></div>
            <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300 cursor-pointer"><span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform" /></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-2">Gateway settings</h4>
            {['eSewa', 'Khalti', 'Stripe'].map(g => (
              <div key={g} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                <span className="text-sm">{g}</span>
                <div className="relative inline-block w-10 h-5 rounded-full bg-violet-600 cursor-pointer"><span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform translate-x-5" /></div>
              </div>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-violet-600 to-blue-600 relative flex items-end p-4">
              <span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Draft</span>
              <div className="text-white"><h3 className="text-lg font-bold">{form.title || 'Untitled Election'}</h3><span className="text-xs opacity-80">{form.category}</span></div>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Start</span><span>{form.startDate || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">End</span><span>{form.endDate || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Candidates</span><span>{form.maxCandidates}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price</span><span>{form.votePrice === 0 ? 'Free' : `रू ${form.votePrice}`}</span></div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Review the summary above. Once published, the election becomes visible to voters immediately and moves to <strong>Live</strong> status on its start date.</p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-8">
      <button
        onClick={() => navigate('/admin/elections')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={18} /> Back to Elections
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Vote size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Election</h2>
            <p className="text-sm text-gray-500">Fill in all the required details to launch your election</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-8 border-b border-gray-200 pb-3 overflow-x-auto">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1 min-w-[80px]">
            <button
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition ${
                i === currentStep ? 'bg-violet-100 text-violet-700' :
                i < currentStep ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                i < currentStep ? 'bg-emerald-100 text-emerald-600' :
                i === currentStep ? 'bg-violet-600 text-white' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < currentStep ? <Check size={12} /> : i + 1}
              </span>
              {label}
            </button>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-1 last:hidden" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-8">{renderStep()}</div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={currentStep === 0 ? () => navigate('/admin/elections') : prevStep}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            {currentStep === 0 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
          </button>
          <button
            type="button"
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white text-sm font-semibold transition"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {currentStep === steps.length - 1 ? (loading ? 'Saving...' : 'Publish Election') : 'Continue'}
          </button>
        </div>
      </form>

      {/* AddCandidateModal */}
      <AddCandidateModal
        open={showAddCandidateModal}
        onClose={() => {
          setShowAddCandidateModal(false);
          // Optionally refresh candidate list (if you maintain one)
          toast.info('You can add more candidates from the Candidates tab later.');
        }}
        onSuccess={() => {
          // Candidate added – you could refresh a local list here.
          setShowAddCandidateModal(false);
          toast.success('Candidate added successfully!');
        }}
      />
    </div>
  );
}
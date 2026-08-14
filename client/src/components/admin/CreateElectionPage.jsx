import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Calendar, Clock, Users, Image as ImageIcon, Type, AlignLeft,
  Tag, Shield, Loader2, Vote, Phone, Mail, User, DollarSign,
  CreditCard, Gift, FileText, Check, ChevronRight, ChevronLeft,
  ArrowLeft, Plus, Trash2, UserPlus,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AddCandidateModal from './AddCandidateModal';

const steps = ['General', 'Voting & Payment', 'Candidates', 'Preview & Publish'];

export default function CreateElectionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];

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
    maxVotesPerUser: 1,
  });

  const [votingType, setVotingType] = useState('paid');
  const [votingMethod, setVotingMethod] = useState('single');
  const [candidates, setCandidates] = useState([]);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'banner') {
      setForm((prev) => ({ ...prev, banner: files[0] || null }));
    } else if (name === 'maxVotesPerUser') {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 1) {
        setForm((prev) => ({ ...prev, maxVotesPerUser: num }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVotingTypeChange = (type) => {
    setVotingType(type);
    if (type === 'free') {
      setForm((prev) => ({ ...prev, votePrice: 0, maxVotesPerUser: 1 }));
      setVotingMethod('single');
    } else if (type === 'paid') {
      if (form.votePrice === 0) setForm((prev) => ({ ...prev, votePrice: 100 }));
      if (form.maxVotesPerUser < 2) setForm((prev) => ({ ...prev, maxVotesPerUser: 3 }));
      setVotingMethod('multiple');
    }
  };

  const handleVotingMethodChange = (method) => {
    if (votingType === 'free' && method === 'multiple') {
      toast.error('Free elections can only be Single Choice.');
      return;
    }
    setVotingMethod(method);
    if (method === 'single') {
      setForm((prev) => ({ ...prev, maxVotesPerUser: 1 }));
    } else {
      if (form.maxVotesPerUser < 2) setForm((prev) => ({ ...prev, maxVotesPerUser: 3 }));
    }
  };

  const addCandidate = (candidateData) => {
    if (candidates.length >= form.maxCandidates) {
      toast.error(`Maximum ${form.maxCandidates} candidates allowed.`);
      return;
    }
    setCandidates((prev) => [...prev, candidateData]);
  };

  const removeCandidate = (index) => {
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    if (step === 0) {
      if (!form.title || !form.category || !form.description || !form.startDate || !form.endDate) {
        toast.error('Please fill all required fields in General');
        return false;
      }
      if (!form.organizerName || !form.organizerEmail || !form.organizerPhone) {
        toast.error('Please fill all organizer details (Name, Email, Phone)');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.organizerEmail)) {
        toast.error('Please enter a valid organizer email address');
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!form.maxCandidates || form.maxCandidates < 1) {
        toast.error('Max candidates must be at least 1');
        return false;
      }
      if (votingMethod === 'multiple' && (form.maxVotesPerUser < 2 || form.maxVotesPerUser > form.maxCandidates)) {
        toast.error(`Max votes per user must be between 2 and ${form.maxCandidates} for multiple choice.`);
        return false;
      }
      if (votingType === 'paid' && form.votePrice <= 0) {
        toast.error('Vote price must be greater than zero for paid elections');
        return false;
      }
      return true;
    }
    // Steps 2 and 3 have no validation (candidates are optional, preview is final)
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const goToStep = (index) => {
    if (index === currentStep) return;
    if (index < currentStep) {
      setCurrentStep(index);
      return;
    }
    // Trying to go to a future step – validate current step first
    if (validateStep(currentStep)) {
      setCurrentStep(index);
    }
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
        maxVotesPerUser: Number(form.maxVotesPerUser),
      };

      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        const val = payload[key];
        if (val !== null && val !== undefined) {
          formData.append(key, String(val));
        }
      });
      if (form.banner) {
        formData.append('banner', form.banner);
      }

      const { data } = await api.post('/elections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const electionId = data.election.id;

      if (candidates.length > 0) {
        let failed = 0;
        for (const candidate of candidates) {
          try {
            const candidatePayload = new FormData();
            candidatePayload.append('firstName', candidate.firstName);
            candidatePayload.append('lastName', candidate.lastName);
            candidatePayload.append('email', candidate.email);
            candidatePayload.append('party', candidate.party || '');
            candidatePayload.append('electionId', electionId);
            candidatePayload.append('slogan', candidate.slogan || '');
            candidatePayload.append('bio', candidate.bio || '');
            if (candidate.avatarFile) {
              candidatePayload.append('avatar', candidate.avatarFile);
            }
            await api.post('/admin/create-candidate', candidatePayload, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch (err) {
            failed++;
            console.error('Failed to add candidate:', candidate, err);
          }
        }
        if (failed > 0) {
          toast.warning(`Election created, but ${failed} candidate(s) failed to add.`);
        } else {
          toast.success(`Election created with ${candidates.length} candidate(s)!`);
        }
      } else {
        toast.success('Election created successfully!');
      }

      navigate('/admin/elections');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* General step – unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Election Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none"
                  placeholder="e.g. Miss Nepal 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none"
                >
                  <option>Singing</option>
                  <option>Dance</option>
                  <option>Cooking</option>
                  <option>Art</option>
                  <option>Debate</option>
                  <option>Academic</option>
                  <option>Sports</option>
                  <option>Lifestyle</option>
                  <option>Culture</option>
                  <option>Technology</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-violet-500 outline-none"
                placeholder="Describe the election"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Rules & Guidelines <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="rules"
                rows="4"
                value={form.rules}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-violet-500 outline-none"
                placeholder="e.g. Each voter can vote once, candidates must be verified, etc."
              />
              <p className="text-xs text-gray-500 mt-1">These rules will be displayed to voters before they cast their vote.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organizer Name *</label>
                <input
                  type="text"
                  name="organizerName"
                  value={form.organizerName}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none"
                  placeholder="e.g. National Election Committee"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organizer Email *</label>
                <input
                  type="email"
                  name="organizerEmail"
                  value={form.organizerEmail}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none"
                  placeholder="organizer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organizer Phone *</label>
                <input
                  type="text"
                  name="organizerPhone"
                  value={form.organizerPhone}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:border-violet-500 outline-none"
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={today}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || today}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Image (optional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                  <ImageIcon size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{form.banner ? form.banner.name : 'Choose file'}</span>
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
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Recommended: 1200×600px. JPG, PNG, or WebP.</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Voting & Payment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Voting Method</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleVotingMethodChange('single')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      votingMethod === 'single'
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    } ${votingType === 'free' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={votingType === 'free'}
                  >
                    Single Choice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVotingMethodChange('multiple')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      votingMethod === 'multiple'
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    } ${votingType === 'free' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={votingType === 'free'}
                  >
                    Multiple Choice
                  </button>
                </div>
                {votingType === 'free' && <p className="text-xs text-gray-500 mt-2">Free elections are always Single Choice.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Max Votes per User
                  {votingMethod === 'single' && <span className="text-gray-400 font-normal ml-1">(fixed: 1)</span>}
                </label>
                <input
                  type="number"
                  name="maxVotesPerUser"
                  value={form.maxVotesPerUser}
                  onChange={handleChange}
                  min={votingMethod === 'single' ? 1 : 2}
                  max={form.maxCandidates}
                  disabled={votingMethod === 'single'}
                  className={`w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-violet-500 ${
                    votingMethod === 'single' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
                {votingMethod === 'multiple' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Each voter can vote for up to {form.maxVotesPerUser} candidate{form.maxVotesPerUser > 1 ? 's' : ''}.
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Candidates *</label>
                <input
                  type="number"
                  name="maxCandidates"
                  value={form.maxCandidates}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Voters (0 = unlimited)</label>
                <input
                  type="number"
                  name="maxVoters"
                  value={form.maxVoters}
                  onChange={handleChange}
                  min="0"
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Election Type</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleVotingTypeChange('free')}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        votingType === 'free'
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVotingTypeChange('paid')}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        votingType === 'paid'
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vote Price (Rs)</label>
                  <input
                    type="number"
                    name="votePrice"
                    value={form.votePrice}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    disabled={votingType === 'free'}
                    className={`w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-violet-500 ${
                      votingType === 'free' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                  {votingType === 'free' && (
                    <p className="text-xs text-gray-500 mt-1">Free election – voters pay nothing.</p>
                  )}
                  {votingType === 'paid' && (
                    <p className="text-xs text-gray-500 mt-1">Set the amount voters must pay per vote.</p>
                  )}
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} />
                  <span className="font-semibold">Payments are processed via Khalti</span>
                </div>
                <p className="mt-1 text-xs text-blue-600">
                  Voters will pay using Khalti wallet or mobile banking. This is the only available gateway.
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Candidates</h3>
              <button
                type="button"
                onClick={() => {
                  if (candidates.length >= form.maxCandidates) {
                    toast.error(`Maximum ${form.maxCandidates} candidates allowed.`);
                    return;
                  }
                  setShowAddCandidateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
              >
                <UserPlus size={16} />
                Add Candidate ({candidates.length}/{form.maxCandidates})
              </button>
            </div>
            {candidates.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
                No candidates added yet. Click "Add Candidate" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{c.firstName} {c.lastName}</p>
                      <p className="text-sm text-gray-500">{c.email} • {c.party || 'No party'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCandidate(idx)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-500">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} added</p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-violet-600 to-blue-600 relative flex items-end p-4">
                <span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Draft</span>
                <div className="text-white">
                  <h3 className="text-lg font-bold">{form.title || 'Untitled Election'}</h3>
                  <span className="text-xs opacity-80">{form.category}</span>
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Start</span>
                  <span>{form.startDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End</span>
                  <span>{form.endDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Candidates</span>
                  <span>{form.maxCandidates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Voting Method</span>
                  <span className="text-gray-700">
                    {votingMethod === 'single' ? 'Single Choice' : `Multiple Choice (max ${form.maxVotesPerUser} votes)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price</span>
                  <span>{form.votePrice === 0 ? 'Free' : `रू ${form.votePrice}`}</span>
                </div>
                {form.rules && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rules</span>
                    <span className="text-gray-700 text-right max-w-xs truncate">{form.rules}</span>
                  </div>
                )}
                {form.organizerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organizer</span>
                    <span className="text-gray-700">{form.organizerName}</span>
                  </div>
                )}
                {form.organizerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organizer Email</span>
                    <span className="text-gray-700">{form.organizerEmail}</span>
                  </div>
                )}
                {form.organizerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organizer Phone</span>
                    <span className="text-gray-700">{form.organizerPhone}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Review the summary above. Once published, the election becomes visible to voters immediately and moves to <strong>Live</strong> status on its start date.
            </p>
          </div>
        );
      default:
        return null;
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
        {steps.map((label, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <div key={i} className="flex items-center flex-1 min-w-[80px]">
              <button
                type="button"
                onClick={() => goToStep(i)}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition ${
                  isActive ? 'bg-violet-100 text-violet-700' :
                  isCompleted ? 'text-emerald-600' : 'text-gray-400'
                } ${!isActive && !isCompleted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                disabled={!isActive && !isCompleted}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    isCompleted ? 'bg-emerald-100 text-emerald-600' :
                    isActive ? 'bg-violet-600 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check size={12} /> : i + 1}
                </span>
                {label}
              </button>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-1 last:hidden" />}
            </div>
          );
        })}
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

      <AddCandidateModal
        open={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        onSuccess={(candidateData) => {
          addCandidate(candidateData);
          setShowAddCandidateModal(false);
        }}
        hideElectionSelect={true}
      />
    </div>
  );
}
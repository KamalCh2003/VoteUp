// src/components/contestant/ContestantProfileCampaign.jsx
import { useState, useEffect } from 'react';
import {
  User, AtSign, Share2, Quote, FileText,
  Globe, Edit3, Loader2, Shield,
  CheckCircle, Copy, Save, PlusCircle, RefreshCw
} from 'lucide-react';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EditProfileModal from '../common/EditProfileModal';

export default function ContestantProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [manifesto, setManifesto] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    api.get('/candidates/me')
      .then(({ data }) => {
        if (data.candidate) {
          setProfile(data.candidate);
          setManifesto(data.candidate.manifesto || '');
          const contestantId = data.candidate.contestantId || data.candidate.id;
          setShareUrl(`${window.location.origin}/candidate/${contestantId}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (formData) => {
    try {
      await api.put('/candidates/me', formData);
      setProfile((prev) => ({ ...prev, ...formData }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed');
      throw err;
    }
  };

  const handleSaveManifesto = async () => {
    setSaving(true);
    try {
      await api.put('/candidates/me', { manifesto });
      setProfile((prev) => ({ ...prev, manifesto }));
      toast.success('Manifesto updated!');
    } catch (err) {
      toast.error('Failed to update manifesto');
    } finally {
      setSaving(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Vote for ${profile?.user?.firstName || ''} ${profile?.user?.lastName || ''} in the upcoming election!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Vote for ${profile?.user?.firstName || ''} ${profile?.user?.lastName || ''}! ${shareUrl}`)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-md">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Not a candidate yet</h2>
          <p className="text-gray-600 mb-8">Apply to create your public candidate profile and start your campaign.</p>
          <Link
            to="/contestant/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-8 py-3 text-sm font-medium text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            Apply for Candidacy
          </Link>
        </div>
      </div>
    );
  }

  const isRejected = profile.status === 'REJECTED';
  const isElectionEnded = profile.election?.status === 'ENDED';
  const showApplyAgain = isRejected || isElectionEnded;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Top bar – only "Apply Again" if needed */}
        {showApplyAgain && (
          <div className="flex justify-end mb-4">
            <Link
              to="/contestant/apply"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition flex items-center gap-2"
            >
              {isRejected ? <RefreshCw size={16} /> : <PlusCircle size={16} />}
              {isRejected ? 'Apply Again' : 'Apply for New Election'}
            </Link>
          </div>
        )}

        {/* Single card – Personal Info + Edit */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500">{profile.party || 'Independent'}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                profile.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                profile.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {profile.status}
              </span>
            </div>
            {/* ✅ Edit Profile button inside the card */}
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition flex items-center gap-2 shadow-sm flex-shrink-0"
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>

          {/* My Votes */}
          <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{profile.votesReceived?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">My Votes</p>
            </div>
          </div>
        </div>

        {/* Slogan & About Me */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold flex items-center gap-1 text-gray-800 mb-3">
            <Quote size={16} className="text-yellow-500" /> Slogan
          </h3>
          <p className="text-gray-600 text-sm mb-4">“{profile.slogan || 'No slogan set'}”</p>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold flex items-center gap-1 text-gray-800 mb-2">
              <User size={16} className="text-violet-600" /> About Me
            </h3>
            <p className="text-gray-600 text-sm">{profile.bio || 'No bio yet.'}</p>
          </div>
        </div>

        {/* Connect */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold flex items-center gap-1 text-gray-800 mb-3">
            <Globe size={16} className="text-cyan-600" /> Connect
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Globe size={14} />{profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">{profile.websiteUrl}</a> : 'Not provided'}</span>
            <span className="flex items-center gap-1"><AtSign size={14} />{profile.twitterHandle || 'Not provided'}</span>
            <span className="flex items-center gap-1"><Share2 size={14} />{profile.instagramHandle || 'Not provided'}</span>
          </div>
        </div>

        {/* Manifesto */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} className="text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-800">Your Manifesto</h2>
          </div>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm resize-none focus:border-violet-500 outline-none"
            rows={6}
            placeholder="Write your vision, promises, and goals..."
            value={manifesto}
            onChange={(e) => setManifesto(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveManifesto}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70 text-white shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Manifesto'}
            </button>
          </div>
        </div>

        {/* Share Profile */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 size={20} className="text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-800">Share Your Profile</h2>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Your unique voting profile link:</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent px-2 py-1 text-sm text-gray-800 outline-none" />
              <button onClick={copyShareLink} className="p-1 rounded hover:bg-gray-100">
                {copied ? <CheckCircle size={18} className="text-emerald-600" /> : <Copy size={18} className="text-gray-500" />}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Share on social media:</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={shareOnTwitter} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-sm text-gray-700"><FaTwitter /> Twitter</button>
            <button onClick={shareOnFacebook} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-sm text-gray-700"><FaFacebook /> Facebook</button>
            <button onClick={shareOnLinkedIn} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-sm text-gray-700"><FaLinkedin /> LinkedIn</button>
            <button onClick={shareOnWhatsApp} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-sm text-gray-700"><FaWhatsapp /> WhatsApp</button>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
    </div>
  );
}
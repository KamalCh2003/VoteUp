// src/components/contestant/ContestantProfileCampaign.jsx
import { useState, useEffect } from 'react';
import {
  User, AtSign, Share2, Calendar, PartyPopper, Quote, FileText,
  Globe, Edit3, Award, TrendingUp, Vote, Loader2, Shield, Clock,
  CheckCircle, Link as LinkIcon, Copy, Save, PlusCircle, RefreshCw
} from 'lucide-react';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EditProfileModal from '../common/EditProfileModal';

export default function ContestantProfileCampaign() {
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
        <Loader2 className="animate-spin text-violet-400" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Not a candidate yet</h2>
          <p className="text-gray-400 mb-8">Apply to create your public candidate profile and start your campaign.</p>
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

  const voteShare = profile.election?.totalVotes
    ? ((profile.votesReceived / profile.election.totalVotes) * 100).toFixed(1)
    : 0;

  const isRejected = profile.status === 'REJECTED';
  const isElectionEnded = profile.election?.status === 'ENDED';
  const showApplyAgain = isRejected || isElectionEnded;

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Profile & Campaign</h1>
          <div className="flex gap-3">
            {showApplyAgain && (
              <Link
                to="/contestant/apply"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-2"
              >
                {isRejected ? <RefreshCw size={16} /> : <PlusCircle size={16} />}
                {isRejected ? 'Apply Again' : 'Apply for New Election'}
              </Link>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition flex items-center gap-2"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN – PROFILE INFO */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-gray-400">{profile.party || 'Independent'}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    profile.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                    profile.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {profile.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.votesReceived?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">My Votes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.election?.totalVotes?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-400">Total Votes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{voteShare}%</p>
                  <p className="text-xs text-gray-400">Share</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Quote size={18} className="text-yellow-400" /> Slogan
              </h3>
              <p className="text-gray-300 italic">“{profile.slogan || 'No slogan set'}”</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <User size={18} className="text-violet-400" /> About Me
                </h3>
                <p className="text-gray-300">{profile.bio || 'No bio yet.'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Globe size={18} className="text-cyan-400" /> Connect
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" />
                  {profile.websiteUrl ? (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                      {profile.websiteUrl}
                    </a>
                  ) : <span className="text-gray-500">Not provided</span>}
                </div>
                <div className="flex items-center gap-3">
                  <AtSign size={16} className="text-blue-400" />
                  <span className="text-gray-300">{profile.twitterHandle || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Share2 size={16} className="text-pink-400" />
                  <span className="text-gray-300">{profile.instagramHandle || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN – CAMPAIGN MANAGER */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText size={22} className="text-violet-400" />
                <h2 className="text-xl font-semibold text-white">Your Manifesto</h2>
              </div>
              <textarea
                className="w-full bg-[#12121b] border border-white/10 rounded-xl px-4 py-3 text-gray-200 text-sm resize-none focus:border-violet-500 outline-none"
                rows={6}
                placeholder="Write your vision, promises, and goals..."
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveManifesto}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70 text-white"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Manifesto'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 size={22} className="text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Share Your Profile</h2>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Your unique voting profile link:</p>
                <div className="flex items-center gap-2 bg-[#12121b] border border-white/10 rounded-xl p-2">
                  <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent px-2 py-1 text-sm text-gray-300 outline-none" />
                  <button onClick={copyShareLink} className="p-1 rounded hover:bg-white/10">
                    {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">Share on social media:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={shareOnTwitter} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-sm"><FaTwitter /> Twitter</button>
                <button onClick={shareOnFacebook} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-sm"><FaFacebook /> Facebook</button>
                <button onClick={shareOnLinkedIn} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-sm"><FaLinkedin /> LinkedIn</button>
                <button onClick={shareOnWhatsApp} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-sm"><FaWhatsapp /> WhatsApp</button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" /> Campaign Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{profile.votesReceived?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-400">Total Votes</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{profile.election?.title ? 'Active' : 'N/A'}</p>
                  <p className="text-xs text-gray-400">Election Status</p>
                </div>
              </div>
            </div>
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
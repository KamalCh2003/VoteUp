import { useState, useEffect } from 'react';
import {
  FileText, Share2, Link as LinkIcon, Copy, Check, Globe, Users, TrendingUp, Edit3, Save, Loader2
} from 'lucide-react';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function CampaignManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [candidate, setCandidate] = useState(null);
  const [manifesto, setManifesto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const { data } = await api.get('/candidates/me');
        if (data.candidate) {
          setCandidate(data.candidate);
          setManifesto(data.candidate.manifesto || '');
          // Build shareable URL – adjust route to match your public candidate page
          const contestantId = data.candidate.contestantId || data.candidate.id;
          const baseUrl = window.location.origin;
          setShareUrl(`${baseUrl}/candidate/${contestantId}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/candidates/me', { manifesto });
      toast.success('Campaign updated successfully!');
    } catch (err) {
      toast.error('Failed to update campaign');
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
    const text = `Vote for ${candidate?.user?.firstName || ''} ${candidate?.user?.lastName || ''} in the upcoming election!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Vote for ${candidate?.user?.firstName || ''} ${candidate?.user?.lastName || ''}! ${shareUrl}`)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={40} />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">No campaign data</h2>
          <p className="text-gray-400">Please apply for candidacy first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0B1020] to-black">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Campaign Hub</h1>
          <p className="text-gray-400 text-lg">Manage your manifesto and spread the word</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Manifesto Editor & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manifesto Card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-violet-500/20">
                  <FileText size={22} className="text-violet-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Your Manifesto</h2>
              </div>
              <textarea
                className="w-full bg-[#12121b] border border-white/10 rounded-2xl px-5 py-4 text-gray-200 text-sm outline-none focus:border-violet-500 resize-none transition"
                rows={8}
                placeholder="Write your vision, promises, and goals for voters..."
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70 transition text-white font-medium"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Manifesto'}
                </button>
              </div>
            </div>

            {/* Campaign Stats (Optional) */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Campaign Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{candidate.votesReceived?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Total Votes</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{candidate.election?.title ? 'Active' : 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-1">Election Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Share Options & Profile Preview */}
          <div className="space-y-6">
            {/* Share Card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-cyan-500/20">
                  <Share2 size={22} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Share Your Profile</h2>
              </div>

              {/* Shareable Link */}
              <div className="mb-5">
                <p className="text-sm text-gray-400 mb-2">Your unique voting profile link:</p>
                <div className="flex items-center gap-2 bg-[#12121b] border border-white/10 rounded-xl p-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-300 outline-none"
                  />
                  <button
                    onClick={copyShareLink}
                    className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
                  >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Social Buttons */}
              <p className="text-sm text-gray-400 mb-3">Share on social media:</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={shareOnTwitter}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-white transition"
                >
                  <FaTwitter size={18} /> Twitter
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-white transition"
                >
                  <FaFacebook size={18} /> Facebook
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-white transition"
                >
                  <FaLinkedin size={18} /> LinkedIn
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-white transition"
                >
                  <FaWhatsapp size={18} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Candidate Preview Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm p-6 text-center">
              <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {candidate.user?.firstName?.[0]}{candidate.user?.lastName?.[0]}
              </div>
              <h3 className="text-xl font-bold text-white mt-4">
                {candidate.user?.firstName} {candidate.user?.lastName}
              </h3>
              <p className="text-gray-400 text-sm mt-1">{candidate.party || 'Independent'}</p>
              <p className="text-gray-500 text-xs mt-3 flex items-center justify-center gap-1">
                <Globe size={12} /> {candidate.election?.title || 'No active election'}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400">Share this profile with friends & family to gather votes!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
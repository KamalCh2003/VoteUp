import { useState, useEffect } from 'react';
import {
  User, AtSign, Share2, Calendar, PartyPopper, Quote, FileText,
  Globe, Edit3, Award, TrendingUp,
  Vote, Loader2, Shield, Clock, CheckCircle, Link as LinkIcon
} from 'lucide-react';
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

  useEffect(() => {
    api.get('/candidates/me')
      .then(({ data }) => {
        if (data.candidate) {
          setProfile(data.candidate);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (formData) => {
    try {
      await api.put('/candidates/me', formData);
      setProfile((prev) => ({ ...prev, ...formData }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0B1020] to-black">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Avatar & Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-10">
          <div className="relative">
            <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-violet-500/30 ring-4 ring-white/10">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-2 border-black">
              <CheckCircle size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <p className="text-gray-300 flex items-center gap-1.5">
                <PartyPopper size={16} className="text-pink-400" />
                {profile.party || 'Independent'}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                profile.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                profile.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {profile.status === 'APPROVED' ? <Award size={12} /> : <Clock size={12} />}
                {profile.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition flex items-center gap-2 font-medium backdrop-blur-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-violet-500/30 transition-all duration-300">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-500/20 blur-xl group-hover:bg-violet-500/30 transition"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Votes Received</p>
                <p className="text-3xl font-bold text-white mt-2">{profile.votesReceived.toLocaleString()}</p>
              </div>
              <Vote className="text-violet-400" size={32} />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Election</p>
                <p className="text-xl font-semibold text-white mt-2 truncate max-w-[180px]">{profile.election?.title || 'N/A'}</p>
              </div>
              <Calendar className="text-emerald-400" size={32} />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vote Share</p>
                <p className="text-3xl font-bold text-white mt-2">{voteShare}%</p>
              </div>
              <TrendingUp className="text-cyan-400" size={32} />
            </div>
          </div>
        </div>

        {/* Slogan & Manifesto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Quote size={20} className="text-yellow-400" /> Campaign Slogan
            </h3>
            <p className="text-gray-300 text-lg italic leading-relaxed">
              “{profile.slogan || 'No slogan set'}”
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText size={20} className="text-green-400" /> Manifesto
            </h3>
            <div className="text-gray-300 whitespace-pre-line max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {profile.manifesto || 'No manifesto provided.'}
            </div>
          </div>
        </div>

        {/* Bio & Social Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <User size={20} className="text-violet-400" /> About Me
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {profile.bio || 'No bio yet. Add a bio to connect with voters.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-5">
              <Globe size={20} className="text-cyan-400" /> Connect
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-gray-400" />
                {profile.websiteUrl ? (
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline flex items-center gap-1">
                    {profile.websiteUrl} <LinkIcon size={14} />
                  </a>
                ) : (
                  <span className="text-gray-300">Not provided</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <AtSign size={18} className="text-blue-400" />
                <span className="text-gray-300">{profile.twitterHandle || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Share2 size={18} className="text-pink-400" />
                <span className="text-gray-300">{profile.instagramHandle || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onSave={handleSave}
      />
    </div>
  );
}
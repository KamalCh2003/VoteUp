import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

export default function VoterProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/me', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="mt-6 max-w-md mx-auto">
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-3">
          <input className="w-full p-3 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm" placeholder="First Name" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} />
          <input className="w-full p-3 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm" placeholder="Last Name" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} />
          <input className="w-full p-3 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm" type="email" placeholder="Email" value={profile.email} disabled />
          <input className="w-full p-3 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
          <Button type="submit" variant="primary" className="w-full">Save Changes</Button>
        </form>
      </GlassCard>
    </div>
  );
}
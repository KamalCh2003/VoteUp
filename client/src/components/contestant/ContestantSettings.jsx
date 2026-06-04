import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

export default function ContestantSettings() {
  const [settings, setSettings] = useState({ notifications: true });
  const toast = useToast();

  const handleToggle = async () => {
    // Simulated: this would be an API call
    toast.success('Settings updated');
  };

  return (
    <div className="mt-6 max-w-md mx-auto">
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm">Email Notifications</span>
          <input type="checkbox" checked={settings.notifications} onChange={handleToggle} className="accent-[var(--a)]" />
        </div>
      </GlassCard>
    </div>
  );
}
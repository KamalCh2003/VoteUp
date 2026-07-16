// src/components/admin/SystemSettings.jsx
import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: 'VoteUp',
    maintenanceMode: false,
    maxLoginAttempts: 5,
    candidacyFee: 5000,
    currency: 'NPR',
    enablePayments: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const map = {};
        (data.settings || []).forEach(s => {
          try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = s.value; }
        });
        setSettings(prev => ({ ...prev, ...map }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', { settings });
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>

      {/* General Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Maintenance Mode</span>
            <button
              onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
              className={`relative w-12 h-6 rounded-full transition ${settings.maintenanceMode ? 'bg-violet-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.maintenanceMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        <div>
          <label className="text-sm text-gray-700">Max Login Attempts</label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Payment</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Candidacy Fee (रू)</label>
            <input
              type="number"
              value={settings.candidacyFee}
              onChange={(e) => handleChange('candidacyFee', parseFloat(e.target.value))}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
            >
              <option value="NPR">NPR (रू)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable Payments</span>
            <button
              onClick={() => handleChange('enablePayments', !settings.enablePayments)}
              className={`relative w-12 h-6 rounded-full transition ${settings.enablePayments ? 'bg-violet-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.enablePayments ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium disabled:opacity-70"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Save All Settings
      </button>
    </div>
  );
}
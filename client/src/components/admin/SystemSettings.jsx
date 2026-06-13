// src/components/admin/SystemSettings.jsx
import { useState, useEffect } from 'react';
import {
  Settings, Shield, Mail, Bell, CreditCard, Globe,
  Lock, Key, Eye, EyeOff, Save, Loader2, Server
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SystemSettings() {
  const toast = useToast();

  const [settings, setSettings] = useState({
    // General
    siteName: 'VoteChain',
    siteDescription: 'Secure online voting platform',
    defaultLanguage: 'en',
    timezone: 'Asia/Kathmandu',
    maintenanceMode: false,

    // Security
    twoFactorRequired: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireEmailVerification: true,

    // Payment (now in NPR)
    candidacyFee: 5000,
    premiumVoterFee: 1500,
    currency: 'NPR',
    enablePayments: true,
    paymentGateway: 'esewa',

    // Email
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: 'noreply@votechain.com',

    // Notifications
    notifyNewElection: true,
    notifyVoteConfirmed: true,
    notifyCandidateApplied: true,
    notifyPaymentReceived: true,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/settings')
      .then(({ data }) => {
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const saveSection = async (fields) => {
    try {
      const updatedFields = {};
      fields.forEach((f) => {
        updatedFields[f] = settings[f];
      });
      await api.put('/admin/settings', updatedFields);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
          <Settings size={20} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Globe size={18} className="text-violet-600" />
            General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea
                rows="2"
                value={settings.siteDescription}
                onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Language</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => handleChange('general', 'defaultLanguage', e.target.value)}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                >
                  <option value="en">English</option>
                  <option value="ne">Nepali</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                >
                  <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Maintenance Mode</span>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                className={`relative w-12 h-6 rounded-full transition ${settings.maintenanceMode ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.maintenanceMode ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <button
              onClick={() => saveSection(['siteName', 'siteDescription', 'defaultLanguage', 'timezone', 'maintenanceMode'])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
            >
              <Save size={16} /> Save General
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-green-600" />
            Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Require 2FA for Admins</span>
              <button
                onClick={() => handleToggle('twoFactorRequired')}
                className={`relative w-12 h-6 rounded-full transition ${settings.twoFactorRequired ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.twoFactorRequired ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Minimum Password Length</label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Require Email Verification</span>
              <button
                onClick={() => handleToggle('requireEmailVerification')}
                className={`relative w-12 h-6 rounded-full transition ${settings.requireEmailVerification ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.requireEmailVerification ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <button
              onClick={() => saveSection(['twoFactorRequired', 'maxLoginAttempts', 'sessionTimeout', 'passwordMinLength', 'requireEmailVerification'])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
            >
              <Save size={16} /> Save Security
            </button>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-yellow-600" />
            Payment
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Candidacy Fee (रु)</label>
                <input
                  type="number"
                  value={settings.candidacyFee}
                  onChange={(e) => handleChange('payment', 'candidacyFee', parseFloat(e.target.value))}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Premium Voter Fee (रु)</label>
                <input
                  type="number"
                  value={settings.premiumVoterFee}
                  onChange={(e) => handleChange('payment', 'premiumVoterFee', parseFloat(e.target.value))}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('payment', 'currency', e.target.value)}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                >
                  <option value="NPR">NPR (रू)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Gateway</label>
                <select
                  value={settings.paymentGateway}
                  onChange={(e) => handleChange('payment', 'paymentGateway', e.target.value)}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                >
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="stripe">Stripe</option>
                  <option value="mobile_banking">Mobile Banking</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable Payments</span>
              <button
                onClick={() => handleToggle('enablePayments')}
                className={`relative w-12 h-6 rounded-full transition ${settings.enablePayments ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.enablePayments ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <button
              onClick={() => saveSection(['candidacyFee', 'premiumVoterFee', 'currency', 'paymentGateway', 'enablePayments'])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
            >
              <Save size={16} /> Save Payment
            </button>
          </div>
        </div>

        {/* Email Settings */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail size={18} className="text-blue-600" />
            Email
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleChange('email', 'smtpPort', parseInt(e.target.value))}
                  className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">SMTP Username</label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </div>
            <div className="relative">
              <label className="block text-sm text-gray-700 mb-1">SMTP Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings.smtpPass}
                onChange={(e) => handleChange('email', 'smtpPass', e.target.value)}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 pr-11 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">From Email</label>
              <input
                type="email"
                value={settings.fromEmail}
                onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                className="w-full h-11 bg-white border border-gray-300 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={() => saveSection(['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'fromEmail'])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
            >
              <Save size={16} /> Save Email
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-pink-600" />
            Notifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New Election Alerts</span>
              <button
                onClick={() => handleToggle('notifyNewElection')}
                className={`relative w-12 h-6 rounded-full transition ${settings.notifyNewElection ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.notifyNewElection ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Vote Confirmed</span>
              <button
                onClick={() => handleToggle('notifyVoteConfirmed')}
                className={`relative w-12 h-6 rounded-full transition ${settings.notifyVoteConfirmed ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.notifyVoteConfirmed ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Candidate Applications</span>
              <button
                onClick={() => handleToggle('notifyCandidateApplied')}
                className={`relative w-12 h-6 rounded-full transition ${settings.notifyCandidateApplied ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.notifyCandidateApplied ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Payment Received</span>
              <button
                onClick={() => handleToggle('notifyPaymentReceived')}
                className={`relative w-12 h-6 rounded-full transition ${settings.notifyPaymentReceived ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${settings.notifyPaymentReceived ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
          <button
            onClick={() => saveSection(['notifyNewElection', 'notifyVoteConfirmed', 'notifyCandidateApplied', 'notifyPaymentReceived'])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition mt-4"
          >
            <Save size={16} /> Save Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
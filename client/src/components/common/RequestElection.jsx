// src/pages/RequestElection.jsx
import { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext'; 
import { Loader2, Mail, Send } from 'lucide-react';

export default function RequestElection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check all fields are filled
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim()) return toast.error('Email is required');
    if (!form.phone.trim()) return toast.error('Phone number is required');
    if (!form.organization.trim()) return toast.error('Organization is required');
    if (!form.message.trim()) return toast.error('Message is required');

    setLoading(true);
    try {
      await api.post('/public/request-election', form);
      toast.success('Your request has been sent. The admin will contact you soon.');
      setForm({ name: '', email: '', phone: '', organization: '', message: '' });
    } catch (err) {
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 sm:py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Mail className="text-violet-600" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Request an Election</h2>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Fill out the form below and our team will get in touch to help you set up your election.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-500"
          />
          <div className="flex gap-4">
            <input
              type="email"
              name="email"
              placeholder="Your Email *"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-500"
            />
            <input 
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-500"
            />  
          </div>
          
          <input
            type="text"
            name="organization"
            placeholder="Organization / Community *"
            value={form.organization}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-500"
          />
          <textarea
            name="message"
            placeholder="Describe the election you need (type, number of voters, timeline, etc.) *"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-500 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            {loading ? 'Sending…' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
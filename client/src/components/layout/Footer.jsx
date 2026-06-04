// client/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#070711] border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ShieldCheck className="text-purple-400" size={22} />
              </div>
              <h2 className="text-white text-xl font-bold">VoteChain</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Secure and transparent online voting platform designed for trusted elections, contests, and digital voting systems.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500 transition-all"><FaFacebook size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500 transition-all"><FaTwitter size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500 transition-all"><FaInstagram size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500 transition-all"><FaGithub size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link className="text-gray-400 hover:text-purple-400" to="/">Home</Link></li>
              <li><Link className="text-gray-400 hover:text-purple-400" to="/login">Login</Link></li>
              <li><Link className="text-gray-400 hover:text-purple-400" to="/register">Register</Link></li>
              <li><Link className="text-gray-400 hover:text-purple-400" to="/about">About</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-5">Features</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Secure Authentication</li>
              <li>Real-time Voting</li>
              <li>Contest Management</li>
              <li>Admin Dashboard</li>
              <li>Blockchain Transparency</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5">Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="text-purple-400 mt-0.5" size={16} />
                <p className="text-gray-400">support@votechain.com</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-purple-400 mt-0.5" size={16} />
                <p className="text-gray-400">+977 9800000000</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-purple-400 mt-0.5" size={16} />
                <p className="text-gray-400">Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © 2026 VoteChain. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-purple-400">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-purple-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
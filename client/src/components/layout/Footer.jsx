// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Vote, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="border-t border-[#E2E8F0] bg-white">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#2563EB] text-white text-sm font-bold">
                                V
                            </div>
                            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-extrabold text-[#0F172A]">
                                Vote<span className="text-purple-600">Up</span>
                            </h2>
                        </div>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#64748B]">
                            Secure digital voting for student unions, talent shows, corporate boards, and community elections.
                        </p>
                        <div className="mt-5 flex items-center gap-2.5">
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600 transition hover:bg-purple-700 hover:text-white"
                            >
                                <FaFacebookF size={13} />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600 transition hover:bg-purple-700 hover:text-white"
                            >
                                <FaInstagram size={13} />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600 transition hover:bg-purple-700 hover:text-white"
                            >
                                <FaLinkedinIn size={13} />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600 transition hover:bg-purple-700 hover:text-white"
                            >
                                <FaGithub size={13} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">Product</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/elections" className="text-[#64748B] hover:text-purple-600 transition">Elections</Link></li>
                            <li><Link to="/results" className="text-[#64748B] hover:text-purple-600 transition">Results</Link></li>
                            <li><Link to="/request-election" className="text-[#64748B] hover:text-purple-600 transition">Create Election</Link></li>
                            <li><Link to="/about" className="text-[#64748B] hover:text-purple-600 transition">About</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">Legal</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/privacy" className="text-[#64748B] hover:text-purple-600 transition">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-[#64748B] hover:text-purple-600 transition">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="text-[#64748B] hover:text-purple-600 transition">Compliance</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">Contact</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-3">
                                <Mail size={16} className="mt-0.5 text-purple-600 flex-shrink-0" />
                                <span className="text-[#64748B]">support@voteup.io</span>
                            </div>
                            <div className="flex gap-3">
                                <Phone size={16} className="mt-0.5 text-purple-600 flex-shrink-0" />
                                <span className="text-[#64748B]">+977-1-4XXXXXX</span>
                            </div>
                            <div className="flex gap-3">
                                <MapPin size={16} className="mt-0.5 text-purple-600 flex-shrink-0" />
                                <span className="text-[#64748B]">Kathmandu, Nepal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-[#E2E8F0]">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs md:flex-row">
                    <p className="text-[#64748B]">© 2026 VoteUp Technologies. All rights reserved.</p>
                    <p className="text-[#64748B]">Made for transparent elections everywhere.</p>
                </div>
            </div>
        </footer>
    );
}
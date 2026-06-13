// client/src/components/layout/Footer.jsx

import { Link } from 'react-router-dom';
import { Vote, Mail, Phone, MapPin } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-white">
      {/* Top CTA */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-purple-600 p-8 md:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Ready to launch your next election?
                </h2>

                <p className="mt-3 max-w-2xl text-violet-100">
                  Create secure elections, manage contestants, track votes
                  in real-time, and engage your community with confidence.
                </p>
              </div>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-violet-700 shadow-lg transition hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Vote size={22} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Vote<span className="text-violet-600">Up</span>
              </h2>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-gray-600">
              VoteUp is a modern digital voting platform designed for
              elections, competitions, student unions, awards, organizations,
              and community engagement with transparency and security.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              >
                <FaInstagram size={14} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              >
                <FaLinkedinIn size={14} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              >
                <FaGithub size={14} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-5 font-semibold text-gray-900">
              Product
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/elections"
                  className="text-gray-600 hover:text-violet-600"
                >
                  Elections
                </Link>
              </li>

              <li>
                <Link
                  to="/results"
                  className="text-gray-600 hover:text-violet-600"
                >
                  Results
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-violet-600"
                >
                  Create Election
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-violet-600"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="mb-5 font-semibold text-gray-900">
              Features
            </h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>Secure Voting</li>
              <li>Live Results</li>
              <li>Contest Management</li>
              <li>Candidate Profiles</li>
              <li>Admin Dashboard</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 font-semibold text-gray-900">
              Contact
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Mail
                  size={16}
                  className="mt-0.5 text-violet-600"
                />
                <span className="text-gray-600">
                  support@voteup.com
                </span>
              </div>

              <div className="flex gap-3">
                <Phone
                  size={16}
                  className="mt-0.5 text-violet-600"
                />
                <span className="text-gray-600">
                  +977 9800000000
                </span>
              </div>

              <div className="flex gap-3">
                <MapPin
                  size={16}
                  className="mt-0.5 text-violet-600"
                />
                <span className="text-gray-600">
                  Kathmandu, Nepal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm md:flex-row">
          <p className="text-gray-500">
            © 2026 VoteUp. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-violet-600"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="text-gray-500 hover:text-violet-600"
            >
              Terms of Service
            </Link>

            <Link
              to="/cookies"
              className="text-gray-500 hover:text-violet-600"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
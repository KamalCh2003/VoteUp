// src/components/home/CtaBand.jsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CtaBand() {
  const { user } = useAuth();
  const ctaHref = user ? '/voter/elections' : '/register';
  const ctaLabel = user ? 'Go to dashboard' : 'Get started free';

  return (
    <section className="py-14">
      <div className="bg-gray-900 rounded-2xl px-10 py-14 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-white tracking-tight mb-3">
          Ready to run your first election?
        </h2>
        <p className="text-gray-400 text-base font-light mb-8">
          Set up in minutes. No credit card required.
        </p>
        <Link
          to={ctaHref}
          className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-medium px-7 py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {ctaLabel}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
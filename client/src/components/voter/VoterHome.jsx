import { useEffect, useRef, useState } from 'react';

import HeroSection from '../home/HeroSection';
import LiveElectionSection from '../home/LiveElectionSection';
import WhoCanUse from '../home/WhoCanUse';
import FeaturesSection from '../home/FeaturesSection';
import TestimonialsSection from '../home/TestimonialsSection';
import FAQSection from '../home/FAQSection';
import ElectionRequestCTA from '../home/ElectionRequestCTA';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ '--animation-delay': `${delay}ms` }}
      className={`
        transition-all
        duration-1000
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-12 opacity-0'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden text-gray-900">

      {/* ================================
          Animated Background
      ================================= */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        {/* Purple Glow */}
        <div
          className="
            absolute left-0 top-0
            h-[500px] w-[500px]
            rounded-full
            bg-violet-200/40
            blur-[140px]
            animate-[backgroundFloat_10s_ease-in-out_infinite]
          "
        />

        {/* Cyan Glow */}
        <div
          className="
            absolute bottom-0 right-0
            h-[500px] w-[500px]
            rounded-full
            bg-cyan-200/40
            blur-[140px]
            animate-[backgroundFloatReverse_12s_ease-in-out_infinite]
          "
        />

        {/* Main Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      </div>

      {/* ================================
          Hero
      ================================= */}
      <AnimatedSection>
        <HeroSection />
      </AnimatedSection>

      {/* ================================
          Live Elections
      ================================= */}
      <AnimatedSection delay={100}>
        <LiveElectionSection />
      </AnimatedSection>

      {/* ================================
          Who Can Use
      ================================= */}
      <AnimatedSection delay={150}>
        <WhoCanUse />
      </AnimatedSection>

      {/* ================================
          Features
      ================================= */}
      <AnimatedSection delay={200}>
        <FeaturesSection />
      </AnimatedSection>

      {/* ================================
          Testimonials
      ================================= */}
      <AnimatedSection delay={250}>
        <TestimonialsSection />
      </AnimatedSection>

      {/* ================================
          FAQ
      ================================= */}
      <AnimatedSection delay={300}>
        <FAQSection />
      </AnimatedSection>

      {/* ================================
          CTA
      ================================= */}
      <AnimatedSection delay={350}>
        <ElectionRequestCTA />
      </AnimatedSection>

      {/* ================================
          Animation Styles
      ================================= */}
      <style>{`
        @keyframes backgroundFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(40px, 30px, 0) scale(1.08);
          }
        }

        @keyframes backgroundFloatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-40px, -30px, 0) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
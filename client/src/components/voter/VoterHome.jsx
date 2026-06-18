import HeroSection from '../home/HeroSection';
import StatsSection from '../home/StatsSection';
import LiveElectionSection from '../home/LiveElectionSection';
import WhoCanUse from '../home/WhoCanUse';
import FeaturesSection from '../home/FeaturesSection';
import ElectionRequestCTA from '../home/ElectionRequestCTA';

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden text-gray-900">
      {/* Light Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-[140px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      </div>

      <HeroSection />

      <StatsSection />

      <LiveElectionSection />

      <WhoCanUse />

      <FeaturesSection />

      <ElectionRequestCTA />
    </div>
  );
}
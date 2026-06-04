import HeroSection from '../home/HeroSection';
import StatsSection from '../home/StatsSection';
import LiveElectionSection from '../home/LiveElectionSection';
import WhoCanUse from '../home/WhoCanUse';
import FeaturesSection from '../home/FeaturesSection';


export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <HeroSection />

      <StatsSection />

      <LiveElectionSection />

      <WhoCanUse />

      <FeaturesSection />

    </div>
  );
}
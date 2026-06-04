import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import LiveElectionSection from "../components/home/LiveElectionSection";
import FeaturesSection from "../components/home/FeaturesSection";
import WhoCanUse from "../components/home/WhoCanUse";


export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
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
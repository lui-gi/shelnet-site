import BinaryRain from './components/animations/BinaryRain';
import HeroSection from './components/home/HeroSection';
import PBQsSection from './components/home/PBQsSection';
import ExamsSection from './components/home/ExamsSection';
import AboutSection from './components/home/AboutSection';
import ConnectSection from './components/home/ConnectSection';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30 selection:text-green-200 relative">
      {/* GLOBAL BINARY RAIN - Fixed position covering entire viewport */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BinaryRain />
      </div>

      {/* PAGE SECTIONS */}
      <HeroSection />
      <PBQsSection />
      <ExamsSection />
      <AboutSection />
      <ConnectSection />
    </div>
  );
}

// src/App.jsx
import HeroSection from './components/home/HeroSection';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-emerald-500/30 selection:text-emerald-200">
      <HeroSection />
    </div>
  );
}

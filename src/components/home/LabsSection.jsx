import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';
import LabBlueprintCard from './LabBlueprintCard';
import { labs } from '../../data/labs';

const LabsSection = () => {
  return (
    <section id="labs" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="LABS" subtitle="C:\Shelnet> THREAT SIMULATION RANGE" />

        <div className="relative">
          {/* Orange glow */}
          <div className="absolute -inset-4 bg-gradient-to-b from-orange-500/10 to-transparent blur-3xl opacity-20 pointer-events-none" />

          {labs.map((lab) => (
            <LabBlueprintCard key={lab.id} lab={lab} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LabsSection;

import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';
import LabBlueprintCard from './LabBlueprintCard';
import { labs } from '../../data/labs';

const LabsSection = () => {
  // Dynamic grid based on lab count
  const getGridClass = () => {
    if (labs.length === 1) return 'max-w-3xl mx-auto';
    if (labs.length === 2) return 'grid lg:grid-cols-2 gap-6';
    return 'grid md:grid-cols-2 xl:grid-cols-3 gap-6';
  };

  return (
    <section id="labs" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="LABS" subtitle="C:\Shelnet> HOME INFRASTRUCTURE" />

        <div className={getGridClass()}>
          {labs.map((lab) => (
            <LabBlueprintCard key={lab.id} lab={lab} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LabsSection;

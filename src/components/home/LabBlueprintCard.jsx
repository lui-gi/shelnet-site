import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LabTopologyCanvas from './LabTopologyCanvas';

const LabBlueprintCard = ({ lab }) => {
  const specPills = [
    lab.host.ram,
    lab.host.cpu,
    lab.hypervisor,
    `${lab.vms.length} VMs`,
  ];

  return (
    <div className="w-full">
      {/* Row 1 -- Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-5 border border-orange-500/20 bg-orange-500/[0.03]">
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
          <div className="w-3 h-3 bg-orange-500 rounded-sm flex-shrink-0" />
          <span className="text-2xl font-bold text-white uppercase tracking-tight">
            {lab.name}
          </span>
          <span className="text-sm text-white/60">
            {lab.description}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {specPills.map((pill) => (
            <span
              key={pill}
              className="px-2.5 py-1 border border-orange-500/20 bg-orange-500/5 text-xs font-mono text-white/70"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 -- Canvas Topology */}
      <div className="border border-orange-500/20 border-t-0 bg-black relative overflow-hidden">
        {/* Corner markers */}
        <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-orange-500/60 z-10 pointer-events-none" />
        <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-orange-500/60 z-10 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-orange-500/60 z-10 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-orange-500/60 z-10 pointer-events-none" />

        {/* Overlay labels */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
            SIMULATION VIEW
          </span>
        </div>
        <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-2">
          <span className="text-xs font-mono text-red-400">LIVE</span>
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
        </div>

        <LabTopologyCanvas vms={lab.vms} hypervisor={lab.hypervisor} />
      </div>

      {/* Row 3 -- CTA Bar */}
      <div className="border border-orange-500/20 border-t-0 bg-orange-500/[0.03] px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="font-mono text-sm">
            <div className="text-white/40">
              root@shelnet:~# ./launch_simulation.sh
            </div>
            <div className="text-orange-400">
              Initializing attack vectors... Ready.
            </div>
          </div>
          <Link
            to={`/labs/${lab.slug}`}
            className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-black font-bold text-sm uppercase hover:bg-orange-400 transition-colors flex items-center justify-center gap-3 tracking-wider flex-shrink-0 btn-scanline"
          >
            ENTER SIMULATION
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LabBlueprintCard;

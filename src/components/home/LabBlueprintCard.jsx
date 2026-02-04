import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const LabBlueprintCard = ({ lab }) => {
  const specs = [
    { label: 'HOST', value: lab.host.name },
    { label: 'RAM', value: lab.host.ram },
    { label: 'HYPE', value: lab.hypervisor },
    { label: 'VMs', value: `${lab.vms.length} machines` }
  ];

  return (
    <div className="group relative border border-dashed border-orange-500/30 bg-black/50 hover:border-orange-500/60 transition-all duration-300">
      {/* Blueprint grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(251, 146, 60, 0.8) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Schematic Header */}
      <div className="border-b border-dashed border-orange-500/30 p-4 font-mono text-xs">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-orange-400/60">SCHEMATIC REV {lab.revision}</div>
            <div className="text-white font-bold text-lg mt-1 tracking-tight uppercase">{lab.name}</div>
          </div>
          <div className="text-right text-orange-400/40">
            <div>SCALE: 1:1</div>
            <div>DATE: {lab.date}</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          {/* Specs Table */}
          <div>
            <div className="text-[10px] text-orange-400/60 font-mono mb-2 uppercase tracking-wider">Host Specs</div>
            <div className="border border-orange-500/20">
              {specs.map((spec, idx) => (
                <div
                  key={spec.label}
                  className={`flex text-xs font-mono ${idx !== specs.length - 1 ? 'border-b border-orange-500/20' : ''}`}
                >
                  <div className="w-14 px-2 py-1.5 text-orange-400/70 border-r border-orange-500/20 bg-orange-500/5">
                    {spec.label}
                  </div>
                  <div className="flex-1 px-2 py-1.5 text-white/80">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VM Topology Preview */}
          <div className="relative">
            <div className="text-[10px] text-orange-400/60 font-mono mb-2 uppercase tracking-wider">VM Topology</div>
            <div className="border border-orange-500/20 bg-orange-500/5 h-[100px] relative overflow-hidden">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-orange-500/40" />
              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-orange-500/40" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-orange-500/40" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-orange-500/40" />

              {/* Simplified VM topology */}
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-1 font-mono text-[9px] text-orange-400/60">
                  {/* Hypervisor layer */}
                  <div className="px-2 py-0.5 border border-orange-500/40 bg-orange-500/10 text-orange-400/80">
                    [{lab.hypervisor}]
                  </div>
                  <div className="w-px h-2 bg-orange-500/30" />

                  {/* VMs row with isolated network indicator */}
                  <div className="flex items-center gap-1">
                    {/* Kali - external */}
                    <div className="px-1.5 py-0.5 border border-orange-500/30 text-[8px]">
                      KALI
                    </div>

                    <div className="w-2 h-px bg-orange-500/20" />

                    {/* Isolated network boundary */}
                    <div className="border border-dashed border-orange-500/40 p-1 flex items-center gap-1">
                      <div className="px-1.5 py-0.5 border border-orange-500/30 text-[8px]">
                        PFS
                      </div>
                      <div className="w-1.5 h-px bg-orange-500/30" />
                      <div className="px-1.5 py-0.5 border border-orange-500/30 text-[8px]">
                        MS2
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="text-[7px] text-orange-400/40 mt-1">
                    ISOLATED NET
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-xs text-white/50 font-mono">
          {lab.description}
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-dashed border-orange-500/30 p-4">
        <Link
          to={`/labs/${lab.slug}`}
          className="flex items-center justify-between text-xs font-mono text-orange-400 hover:text-orange-300 transition-colors group/link"
        >
          <span>VIEW FULL SCHEMATIC</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default LabBlueprintCard;

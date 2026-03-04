import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const roleColors = {
  Attacker:    'border-red-400 text-red-400',
  Firewall:    'border-blue-400 text-blue-400',
  Target:      'border-green-400 text-green-400',
  Implant:     'border-purple-400 text-purple-400',
  Victim:      'border-amber-400 text-amber-400',
  Monitor:     'border-cyan-400 text-cyan-400',
  Sensor:      'border-teal-400 text-teal-400',
  Analyzer:    'border-violet-400 text-violet-400',
  Environment: 'border-gray-400 text-gray-400',
};

const formatDate = (dateStr) => {
  const [year, month] = dateStr.split('-');
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const LabBlueprintCard = ({ lab }) => {
  return (
    <div className="w-full">
      {/* Row 1 -- Header Bar */}
      <div className="flex items-start justify-between flex-wrap gap-4 px-6 py-5 border border-orange-500/20 bg-orange-500/[0.03]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-orange-500 rounded-sm flex-shrink-0 mt-0.5" />
            <span className="text-2xl font-bold text-white uppercase tracking-tight">
              {lab.name}
            </span>
          </div>
          <span className="text-sm text-white/50 pl-6">
            {lab.description}
          </span>
        </div>
        <span className="text-sm font-mono text-white/50 whitespace-nowrap">
          {formatDate(lab.date)}&nbsp;·&nbsp;Rev {lab.revision}
        </span>
      </div>

      {/* Row 2 -- Compact Body */}
      <div className="border border-orange-500/20 border-t-0 bg-black px-6 py-6 flex flex-col gap-4">
        {/* Role pills */}
        <div className="flex flex-wrap gap-3">
          {(lab.components ?? lab.vms).map((item) => (
            <span
              key={item.name}
              className={`px-3 py-1.5 border text-xs font-mono uppercase tracking-wide ${roleColors[item.role] ?? 'border-white/20 text-white/50'}`}
            >
              {item.role}: {item.name}
            </span>
          ))}
        </div>

        {/* Spec line */}
        <div className="text-xs font-mono text-white/40">
          {lab.type === 'hardware'
            ? `${lab.host.platform} · ${lab.components.length} components · ${lab.host.interface}`
            : `${lab.hypervisor} · ${lab.vms.length} VMs · ${lab.host.ram} · ${lab.host.cpu}`
          }
        </div>
      </div>

      {/* Row 3 -- CTA Bar */}
      <div className="border border-orange-500/20 border-t-0 bg-orange-500/[0.03] px-6 py-5">
        <Link
          to={`/labs/${lab.slug}`}
          className="w-full px-8 py-4 bg-orange-500 text-black font-bold text-sm uppercase hover:bg-orange-400 transition-colors flex items-center justify-center gap-3 tracking-wider btn-scanline"
        >
          ENTER LAB
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default LabBlueprintCard;

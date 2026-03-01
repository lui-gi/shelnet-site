import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const roleColors = {
  Attacker: 'border-red-400 text-red-400',
  Firewall: 'border-blue-400 text-blue-400',
  Target: 'border-green-400 text-green-400',
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
        {/* VM role pills */}
        <div className="flex flex-wrap gap-3">
          {lab.vms.map((vm) => (
            <span
              key={vm.name}
              className={`px-3 py-1.5 border text-xs font-mono uppercase tracking-wide ${roleColors[vm.role] ?? 'border-white/20 text-white/50'}`}
            >
              {vm.role}: {vm.name}
            </span>
          ))}
        </div>

        {/* Spec line */}
        <div className="text-xs font-mono text-white/40">
          {lab.hypervisor}&nbsp;·&nbsp;{lab.vms.length} VMs&nbsp;·&nbsp;{lab.host.ram}&nbsp;·&nbsp;{lab.host.cpu}
        </div>
      </div>

      {/* Row 3 -- CTA Bar */}
      <div className="border border-orange-500/20 border-t-0 bg-orange-500/[0.03] px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="font-mono text-sm">
            <div className="text-white/40">
              root@shelnet:~# ./launch.sh
            </div>
            <div className="text-orange-400">
              Initializing attack vectors... Ready.
            </div>
          </div>
          <Link
            to={`/labs/${lab.slug}`}
            className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-black font-bold text-sm uppercase hover:bg-orange-400 transition-colors flex items-center justify-center gap-3 tracking-wider flex-shrink-0 btn-scanline"
          >
            READ WRITE-UPS/DOCUMENTATION
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LabBlueprintCard;

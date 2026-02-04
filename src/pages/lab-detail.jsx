import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Server, Cpu, MemoryStick, Monitor, Shield, Target, Skull, ExternalLink } from 'lucide-react';
import GridBackground from '../components/shared/GridBackground';
import { labs } from '../data/labs';

const roleIcons = {
  'Attacker': Skull,
  'Firewall': Shield,
  'Target': Target
};

const roleColors = {
  'Attacker': 'text-red-400',
  'Firewall': 'text-blue-400',
  'Target': 'text-green-400'
};

const LabDetail = () => {
  const { slug } = useParams();
  const lab = labs.find(l => l.slug === slug);

  if (!lab) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <div className="pt-24 px-6 pb-12 relative">
          <GridBackground />
          <div className="max-w-7xl mx-auto relative z-10">
            <Link to="/#labs" className="inline-flex items-center gap-2 text-white/40 hover:text-orange-400 transition-colors font-mono text-sm mb-6">
              <ChevronLeft size={16} />
              ../BACK_TO_LABS
            </Link>
            <div className="text-center py-20">
              <div className="text-6xl mb-4">404</div>
              <div className="text-white/60 font-mono">Lab not found</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="pt-24 px-6 pb-12 relative">
        <GridBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8">
            <Link to="/#labs" className="inline-flex items-center gap-2 text-white/40 hover:text-orange-400 transition-colors font-mono text-sm mb-6">
              <ChevronLeft size={16} />
              ../BACK_TO_LABS
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/50 rounded flex items-center justify-center">
                <Server size={20} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-tight">{lab.name}</h1>
                <div className="text-sm text-white/50 font-mono">REV {lab.revision} | {lab.date}</div>
              </div>
            </div>
            <div className="text-white/60 max-w-2xl">
              {lab.description}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Specifications */}
            <div className="space-y-6">
              {/* Host Hardware */}
              <div className="border border-dashed border-orange-500/30 bg-black/50">
                <div className="border-b border-dashed border-orange-500/30 p-4">
                  <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Host Hardware</div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 border border-orange-500/20 bg-orange-500/5">
                    <div className="p-2 border border-orange-500/30 bg-orange-500/10">
                      <Monitor size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs text-orange-400/60 font-mono uppercase">Host Machine</div>
                      <div className="text-sm text-white/90">{lab.host.name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-orange-500/20 bg-orange-500/5">
                    <div className="p-2 border border-orange-500/30 bg-orange-500/10">
                      <Cpu size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs text-orange-400/60 font-mono uppercase">CPU</div>
                      <div className="text-sm text-white/90">{lab.host.cpu}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-orange-500/20 bg-orange-500/5">
                    <div className="p-2 border border-orange-500/30 bg-orange-500/10">
                      <MemoryStick size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs text-orange-400/60 font-mono uppercase">Memory</div>
                      <div className="text-sm text-white/90">{lab.host.ram}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-orange-500/20 bg-orange-500/5">
                    <div className="p-2 border border-orange-500/30 bg-orange-500/10">
                      <Server size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs text-orange-400/60 font-mono uppercase">Hypervisor</div>
                      <div className="text-sm text-white/90">{lab.hypervisor}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* VM Resources Table */}
              <div className="border border-dashed border-orange-500/30 bg-black/50">
                <div className="border-b border-dashed border-orange-500/30 p-4">
                  <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Virtual Machines</div>
                </div>
                <div className="p-4">
                  <div className="border border-orange-500/20">
                    <div className="flex text-xs font-mono border-b border-orange-500/20 bg-orange-500/10">
                      <div className="flex-1 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">Name</div>
                      <div className="w-20 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">Role</div>
                      <div className="w-16 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">RAM</div>
                      <div className="w-20 px-3 py-2 text-orange-400/80">CPU</div>
                    </div>
                    {lab.vms.map((vm, idx) => {
                      const Icon = roleIcons[vm.role] || Server;
                      const colorClass = roleColors[vm.role] || 'text-orange-400';
                      return (
                        <div
                          key={idx}
                          className={`flex text-sm font-mono ${idx !== lab.vms.length - 1 ? 'border-b border-orange-500/20' : ''}`}
                        >
                          <div className="flex-1 px-3 py-2 text-white/80 border-r border-orange-500/20 flex items-center gap-2">
                            <Icon size={12} className={colorClass} />
                            {vm.name}
                          </div>
                          <div className={`w-20 px-3 py-2 border-r border-orange-500/20 ${colorClass}`}>{vm.role}</div>
                          <div className="w-16 px-3 py-2 text-white/60 border-r border-orange-500/20">{vm.ram}</div>
                          <div className="w-20 px-3 py-2 text-white/60">{vm.cpu}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Attack Path Legend */}
              <div className="border border-dashed border-orange-500/30 bg-black/50">
                <div className="border-b border-dashed border-orange-500/30 p-4">
                  <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Attack Path</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-red-500/30 bg-red-500/10">
                      <Skull size={12} className="text-red-400" />
                      <span className="text-red-400">Kali</span>
                    </div>
                    <div className="text-orange-400/60">→</div>
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-blue-500/30 bg-blue-500/10">
                      <Shield size={12} className="text-blue-400" />
                      <span className="text-blue-400">pfSense</span>
                    </div>
                    <div className="text-orange-400/60">→</div>
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-green-500/30 bg-green-500/10">
                      <Target size={12} className="text-green-400" />
                      <span className="text-green-400">MS2</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono mt-2">
                    External attacker must traverse firewall to reach isolated target
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Network Topology Diagram */}
            <div className="border border-dashed border-orange-500/30 bg-black/50">
              <div className="border-b border-dashed border-orange-500/30 p-4 flex justify-between items-center">
                <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Network Topology</div>
                <div className="text-[10px] text-orange-400/40 font-mono">SCALE: 1:1</div>
              </div>
              <div className="p-4">
                <div className="border border-orange-500/20 bg-orange-500/5 min-h-[500px] relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-orange-500/40" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-orange-500/40" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-orange-500/40" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-orange-500/40" />

                  {/* Blueprint grid overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.05]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(251, 146, 60, 0.8) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />

                  {/* Network diagram visualization */}
                  <div className="flex items-center justify-center h-full min-h-[500px] p-6">
                    <div className="flex flex-col items-center w-full max-w-sm">
                      {/* Host Machine */}
                      <div className="w-full border-2 border-orange-500/50 bg-orange-500/5 p-4 relative">
                        <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] text-orange-400 font-mono">
                          THINKPAD P53 (HOST)
                        </div>

                        {/* Hypervisor Label */}
                        <div className="text-center mb-4">
                          <div className="inline-block px-3 py-1 border border-orange-500/40 bg-orange-500/10 font-mono text-xs text-orange-400">
                            {lab.hypervisor}
                          </div>
                        </div>

                        {/* Isolated Network Boundary */}
                        <div className="border-2 border-dashed border-blue-500/40 p-4 mb-4 relative">
                          <div className="absolute -top-2.5 left-4 bg-black px-2 text-[9px] text-blue-400 font-mono">
                            ISOLATED NETWORK
                          </div>

                          <div className="flex flex-col items-center gap-3">
                            {/* pfSense */}
                            <div className="px-6 py-3 border-2 border-blue-500/50 bg-blue-500/10 w-full max-w-[180px]">
                              <div className="flex items-center justify-center gap-2">
                                <Shield size={16} className="text-blue-400" />
                                <div className="text-center font-mono">
                                  <div className="text-[9px] text-blue-400/60">FIREWALL</div>
                                  <div className="text-sm text-blue-400">pfSense</div>
                                </div>
                              </div>
                              <div className="text-[8px] text-white/40 text-center mt-1 font-mono">
                                {lab.vms.find(v => v.name === 'pfSense')?.ram} | {lab.vms.find(v => v.name === 'pfSense')?.cpu}
                              </div>
                            </div>

                            {/* Connection line */}
                            <div className="w-px h-4 bg-blue-500/30" />

                            {/* Metasploitable 2 */}
                            <div className="px-6 py-3 border-2 border-green-500/50 bg-green-500/10 w-full max-w-[180px]">
                              <div className="flex items-center justify-center gap-2">
                                <Target size={16} className="text-green-400" />
                                <div className="text-center font-mono">
                                  <div className="text-[9px] text-green-400/60">TARGET</div>
                                  <div className="text-sm text-green-400">Metasploitable 2</div>
                                </div>
                              </div>
                              <div className="text-[8px] text-white/40 text-center mt-1 font-mono">
                                {lab.vms.find(v => v.name === 'Metasploitable 2')?.ram} | {lab.vms.find(v => v.name === 'Metasploitable 2')?.cpu}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Connection from Kali to Isolated Net */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="flex-1 h-px bg-orange-500/30" />
                          <div className="text-[8px] text-orange-400/50 font-mono">ATTACK VECTOR</div>
                          <div className="flex-1 h-px bg-orange-500/30" />
                        </div>

                        {/* Kali Linux - External */}
                        <div className="px-6 py-3 border-2 border-red-500/50 bg-red-500/10 w-full max-w-[180px] mx-auto">
                          <div className="flex items-center justify-center gap-2">
                            <Skull size={16} className="text-red-400" />
                            <div className="text-center font-mono">
                              <div className="text-[9px] text-red-400/60">ATTACKER</div>
                              <div className="text-sm text-red-400">Kali Linux</div>
                            </div>
                          </div>
                          <div className="text-[8px] text-white/40 text-center mt-1 font-mono">
                            {lab.vms.find(v => v.name === 'Kali Linux')?.ram} | {lab.vms.find(v => v.name === 'Kali Linux')?.cpu}
                          </div>
                        </div>

                        <div className="text-[8px] text-orange-400/40 text-center mt-3 font-mono">
                          (EXTERNAL TO ISOLATED NET)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Write-ups Section */}
          {lab.writeupsUrl && (
            <div className="mt-6 border border-dashed border-orange-500/30 bg-black/50">
              <div className="border-b border-dashed border-orange-500/30 p-4 flex justify-between items-center">
                <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Write-ups</div>
                <a
                  href={lab.writeupsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-orange-400/60 hover:text-orange-400 transition-colors font-mono"
                >
                  Open in new tab
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="p-4">
                <div className="border border-orange-500/20 bg-orange-500/5">
                  <iframe
                    src={lab.writeupsUrl}
                    title={`${lab.name} Write-ups`}
                    className="w-full h-[500px] md:h-[600px]"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    loading="lazy"
                  />
                </div>
                <div className="text-[10px] text-white/40 font-mono mt-3 border-t border-dashed border-orange-500/20 pt-3">
                  Attacks and findings documented in this lab
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabDetail;

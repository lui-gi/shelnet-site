import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Server, Cpu, MemoryStick, Monitor, Shield, Target, Skull, Zap } from 'lucide-react';
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

const hwRoleColors = {
  Implant:     { text: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10', dim: 'border-purple-500/30' },
  Victim:      { text: 'text-amber-400',  border: 'border-amber-500/50',  bg: 'bg-amber-500/10',  dim: 'border-amber-500/30'  },
  Monitor:     { text: 'text-cyan-400',   border: 'border-cyan-500/50',   bg: 'bg-cyan-500/10',   dim: 'border-cyan-500/30'   },
  Sensor:      { text: 'text-teal-400',   border: 'border-teal-500/50',   bg: 'bg-teal-500/10',   dim: 'border-teal-500/30'   },
  Analyzer:    { text: 'text-violet-400', border: 'border-violet-500/50', bg: 'bg-violet-500/10', dim: 'border-violet-500/30' },
  Environment: { text: 'text-gray-400',   border: 'border-gray-500/50',   bg: 'bg-gray-500/10',   dim: 'border-gray-500/30'   },
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
                {lab.type === 'hardware'
                  ? <Zap size={20} className="text-orange-400" />
                  : <Server size={20} className="text-orange-400" />
                }
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
                  {lab.type === 'hardware' ? (
                    <>
                      <div className="flex items-start gap-3 p-3 border border-orange-500/20 bg-orange-500/5">
                        <div className="p-2 border border-orange-500/30 bg-orange-500/10">
                          <Zap size={16} className="text-orange-400" />
                        </div>
                        <div>
                          <div className="text-xs text-orange-400/60 font-mono uppercase">Platform</div>
                          <div className="text-sm text-white/90">{lab.host.platform}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border border-orange-500/20 bg-orange-500/5">
                        <div className="p-2 border border-orange-500/30 bg-orange-500/10">
                          <Server size={16} className="text-orange-400" />
                        </div>
                        <div>
                          <div className="text-xs text-orange-400/60 font-mono uppercase">Interface</div>
                          <div className="text-sm text-white/90">{lab.host.interface}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              {/* Resources Table */}
              {lab.type === 'hardware' ? (
                <div className="border border-dashed border-orange-500/30 bg-black/50">
                  <div className="border-b border-dashed border-orange-500/30 p-4">
                    <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Components</div>
                  </div>
                  <div className="p-4">
                    <div className="border border-orange-500/20">
                      <div className="flex text-xs font-mono border-b border-orange-500/20 bg-orange-500/10">
                        <div className="flex-1 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">Name</div>
                        <div className="w-24 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">Role</div>
                        <div className="flex-1 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">Spec</div>
                        <div className="w-24 px-3 py-2 text-orange-400/80">Interface</div>
                      </div>
                      {lab.components.map((comp, idx) => {
                        const colors = hwRoleColors[comp.role] || { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' };
                        return (
                          <div
                            key={idx}
                            className={`flex text-sm font-mono ${idx !== lab.components.length - 1 ? 'border-b border-orange-500/20' : ''}`}
                          >
                            <div className="flex-1 px-3 py-2 text-white/80 border-r border-orange-500/20">{comp.name}</div>
                            <div className={`w-24 px-3 py-2 border-r border-orange-500/20 ${colors.text}`}>{comp.role}</div>
                            <div className="flex-1 px-3 py-2 text-white/60 border-r border-orange-500/20 text-xs">{comp.spec}</div>
                            <div className="w-24 px-3 py-2 text-white/60 text-xs">{comp.interface}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

              {/* Path Legend */}
              {lab.type === 'hardware' ? (
                <div className="border border-dashed border-orange-500/30 bg-black/50">
                  <div className="border-b border-dashed border-orange-500/30 p-4">
                    <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Signal Path</div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center flex-wrap gap-2 font-mono text-sm">
                      {lab.components.map((comp, idx) => {
                        const colors = hwRoleColors[comp.role] || { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' };
                        return (
                          <React.Fragment key={comp.name}>
                            <div className={`flex items-center gap-1.5 px-2 py-1 border ${colors.dim} ${colors.bg}`}>
                              <span className={colors.text}>{comp.name}</span>
                            </div>
                            {idx < lab.components.length - 1 && (
                              <div className="text-orange-400/60">→</div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-2">
                      {lab.host.interface} signal chain · {lab.host.platform}
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            {/* Right: Topology Diagram */}
            <div className="border border-dashed border-orange-500/30 bg-black/50">
              <div className="border-b border-dashed border-orange-500/30 p-4 flex justify-between items-center">
                <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">
                  {lab.type === 'hardware' ? 'Hardware Topology' : 'Network Topology'}
                </div>
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

                  {lab.type === 'hardware' ? (
                    /* Hardware topology: component nodes with connector labels */
                    <div className="flex items-center justify-center h-full min-h-[500px] p-6">
                      <div className="flex flex-col items-center w-full max-w-sm gap-0">
                        {/* Host platform label */}
                        <div className="mb-6 text-center">
                          <div className="inline-block px-3 py-1 border border-orange-500/40 bg-orange-500/10 font-mono text-xs text-orange-400">
                            {lab.host.platform}
                          </div>
                        </div>

                        {lab.components.map((comp, idx) => {
                          const colors = hwRoleColors[comp.role] || { text: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10', dim: 'border-orange-500/30' };
                          const nextComp = lab.components[idx + 1];
                          return (
                            <React.Fragment key={comp.name}>
                              <div className={`px-6 py-3 border-2 ${colors.border} ${colors.bg} w-full max-w-[220px] relative group cursor-help`}>
                                <div className="text-center font-mono">
                                  <div className={`text-[9px] ${colors.text} opacity-60 uppercase`}>{comp.role}</div>
                                  <div className={`text-sm ${colors.text}`}>{comp.name}</div>
                                </div>
                                <div className="text-[8px] text-white/40 text-center mt-1 font-mono">{comp.spec}</div>
                                {/* Tooltip */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                                bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                                  <div className={`bg-black/95 border ${colors.border} px-3 py-2 text-xs font-mono
                                                  text-white/80 max-w-[200px] whitespace-normal`}>
                                    Interface: {comp.interface}
                                  </div>
                                </div>
                              </div>
                              {nextComp && (
                                <div className="flex flex-col items-center gap-0">
                                  <div className="w-px h-3 bg-orange-500/30" />
                                  <div className="px-2 py-0.5 border border-orange-500/20 bg-black font-mono text-[8px] text-orange-400/50">
                                    {comp.interface}
                                  </div>
                                  <div className="w-px h-3 bg-orange-500/30" />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* VM network diagram visualization — unchanged */
                    <div className="flex items-center justify-center h-full min-h-[500px] p-6">
                      <div className="flex flex-col items-center w-full max-w-sm">
                        {/* Host Machine */}
                        <div className="w-full border-2 border-orange-500/50 bg-orange-500/5 p-4 relative">
                          <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] text-orange-400 font-mono relative group cursor-help">
                            THINKPAD P53 (HOST)
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                            bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                              <div className="bg-black/95 border border-orange-500/50 px-3 py-2 text-xs font-mono
                                              text-white/80 max-w-[200px] whitespace-normal">
                                Physical machine running the virtualization environment
                              </div>
                            </div>
                          </div>

                          {/* Hypervisor Label */}
                          <div className="text-center mb-4">
                            <div className="inline-block px-3 py-1 border border-orange-500/40 bg-orange-500/10 font-mono text-xs text-orange-400 relative group cursor-help">
                              {lab.hypervisor}
                              {/* Tooltip */}
                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                              bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                                <div className="bg-black/95 border border-orange-500/50 px-3 py-2 text-xs font-mono
                                                text-white/80 max-w-[200px] whitespace-normal">
                                  Software that creates and manages virtual machines
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Isolated Network Boundary */}
                          <div className="border-2 border-dashed border-blue-500/40 p-4 mb-4 relative">
                            <div className="absolute -top-2.5 left-4 bg-black px-2 text-[9px] text-blue-400 font-mono relative group cursor-help">
                              ISOLATED NETWORK
                              {/* Tooltip */}
                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                              bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                                <div className="bg-black/95 border border-blue-500/50 px-3 py-2 text-xs font-mono
                                                text-white/80 max-w-[200px] whitespace-normal">
                                  Private network segment isolating the target from host network
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                              {/* pfSense */}
                              <div className="px-6 py-3 border-2 border-blue-500/50 bg-blue-500/10 w-full max-w-[180px] relative group cursor-help">
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
                                {/* Tooltip */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                                bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                                  <div className="bg-black/95 border border-blue-500/50 px-3 py-2 text-xs font-mono
                                                  text-white/80 max-w-[200px] whitespace-normal">
                                    Open-source firewall/router controlling traffic between networks
                                  </div>
                                </div>
                              </div>

                              {/* Connection line */}
                              <div className="w-px h-4 bg-blue-500/30" />

                              {/* Metasploitable 2 */}
                              <div className="px-6 py-3 border-2 border-green-500/50 bg-green-500/10 w-full max-w-[180px] relative group cursor-help">
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
                                {/* Tooltip */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                                bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                                  <div className="bg-black/95 border border-green-500/50 px-3 py-2 text-xs font-mono
                                                  text-white/80 max-w-[200px] whitespace-normal">
                                    Intentionally vulnerable Linux VM - the exploitation target
                                  </div>
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
                          <div className="px-6 py-3 border-2 border-red-500/50 bg-red-500/10 w-full max-w-[180px] mx-auto relative group cursor-help">
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
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                            bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
                              <div className="bg-black/95 border border-red-500/50 px-3 py-2 text-xs font-mono
                                              text-white/80 max-w-[200px] whitespace-normal">
                                Penetration testing distribution for launching attacks
                              </div>
                            </div>
                          </div>

                          <div className="text-[8px] text-orange-400/40 text-center mt-3 font-mono">
                            (EXTERNAL TO ISOLATED NET)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Wiki */}
          {lab.docs && (
            <div className="mt-6 space-y-6">

              {/* Overview & Objectives */}
              <div className="border border-dashed border-orange-500/30 bg-black/50">
                <div className="border-b border-dashed border-orange-500/30 p-4">
                  <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Overview &amp; Objectives</div>
                </div>
                <div className="p-4 grid md:grid-cols-[3fr_2fr] gap-6">
                  <p className="text-sm text-white/70 leading-relaxed">{lab.docs.overview.summary}</p>
                  <div>
                    <div className="text-[10px] text-orange-400/60 font-mono uppercase tracking-wider mb-3">Objectives</div>
                    <ul className="space-y-2">
                      {lab.docs.overview.objectives.map((obj, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/70 leading-snug">
                          <span className="text-orange-500 font-mono flex-shrink-0 mt-0.5">›</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Setup + Workflow */}
              <div className="grid lg:grid-cols-2 gap-6">

                {/* Setup / Bill of Materials */}
                <div className="border border-dashed border-orange-500/30 bg-black/50">
                  <div className="border-b border-dashed border-orange-500/30 p-4">
                    <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Setup / Bill of Materials</div>
                  </div>
                  <div className="p-4">
                    <div className="border border-orange-500/20">
                      <div className="flex text-xs font-mono border-b border-orange-500/20 bg-orange-500/10">
                        <div className="w-28 px-3 py-2 text-orange-400/80 border-r border-orange-500/20 flex-shrink-0">Item</div>
                        <div className="flex-1 px-3 py-2 text-orange-400/80 border-r border-orange-500/20">Detail</div>
                        <div className="flex-1 px-3 py-2 text-orange-400/80">Notes</div>
                      </div>
                      {lab.docs.setup.map((row, i) => (
                        <div key={i} className={`flex text-xs font-mono ${i !== lab.docs.setup.length - 1 ? 'border-b border-orange-500/20' : ''}`}>
                          <div className="w-28 px-3 py-2 text-orange-400/70 border-r border-orange-500/20 flex-shrink-0 leading-snug">{row.item}</div>
                          <div className="flex-1 px-3 py-2 text-white/80 border-r border-orange-500/20 leading-snug">{row.detail}</div>
                          <div className="flex-1 px-3 py-2 text-white/40 leading-snug">{row.notes}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workflow */}
                <div className="border border-dashed border-orange-500/30 bg-black/50">
                  <div className="border-b border-dashed border-orange-500/30 p-4">
                    <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">
                      {lab.type === 'hardware' ? 'Experiment Workflow' : 'Attack Workflow'}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {lab.docs.workflow.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-orange-400">{step.step}</span>
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-white/80 uppercase tracking-wide mb-0.5">{step.title}</div>
                          <div className="text-xs text-white/50 leading-relaxed">{step.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Findings */}
              <div className="border border-dashed border-orange-500/30 bg-black/50">
                <div className="border-b border-dashed border-orange-500/30 p-4">
                  <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Findings &amp; Notes</div>
                </div>
                <div className="p-4 grid sm:grid-cols-2 gap-4">
                  {lab.docs.findings.map((f, i) => (
                    <div key={i} className="border border-orange-500/20 bg-orange-500/5 p-4">
                      <div className="flex gap-2 items-start mb-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                        <div className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wide leading-snug">{f.title}</div>
                      </div>
                      <div className="text-xs text-white/55 leading-relaxed pl-3.5">{f.body}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Writeup */}
          {lab.writeupsUrl && (
            <div className="mt-6 border border-dashed border-orange-500/30 bg-black/50">
              <div className="border-b border-dashed border-orange-500/30 p-4">
                <div className="text-xs text-orange-400/60 font-mono uppercase tracking-wider">Writeup</div>
              </div>
              <iframe
                src={lab.writeupsUrl}
                title={`${lab.name} — Writeup`}
                className="w-full h-[600px]"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabDetail;

export const labs = [
  {
    id: 'metasploitable-2-lab',
    name: 'Metasploitable 2 Lab',
    slug: 'metasploitable-2-lab',
    type: 'vm',
    revision: '1.0',
    date: '2025-01',
    description: 'Isolated penetration testing environment for security research',
    writeupsUrl: 'https://lui-gi.github.io/shelnet-resources/writeups/index.html',
    host: {
      name: 'Thinkpad P53',
      ram: '64GB',
      cpu: 'Intel Core i7-9850H'
    },
    hypervisor: 'QEMU/KVM',
    vms: [
      { name: 'Kali Linux', role: 'Attacker', ram: '8GB', cpu: '4 cores', network: 'external' },
      { name: 'pfSense', role: 'Firewall', ram: '2GB', cpu: '2 cores', network: 'bridge' },
      { name: 'Metasploitable 2', role: 'Target', ram: '2GB', cpu: '2 cores', network: 'isolated' }
    ]
  },
  {
    id: 'pcb-hid-implant-lab',
    name: 'PCB Hardware Implant Lab',
    slug: 'pcb-hid-implant-lab',
    type: 'hardware',
    revision: '1.0',
    date: '2025-03',
    description: 'RP2040-based rogue HID device research and USB implant analysis',
    host: {
      name: 'RP2040 Dev Platform',
      platform: 'CircuitPython / bare metal',
      interface: 'USB HID'
    },
    components: [
      { name: 'RP2040 PCB',      role: 'Implant', spec: 'Dual-core ARM M0+, 264KB SRAM', interface: 'USB HID'  },
      { name: 'ThinkPad P53',    role: 'Victim',  spec: '64GB RAM, i7-9850H',             interface: 'USB 3.0' },
      { name: 'Monitoring Host', role: 'Monitor', spec: 'Wireshark / USBPcap',             interface: 'USB 3.0' }
    ]
  },
  {
    id: 'sdr-rf-recon-lab',
    name: 'SDR RF Recon Lab',
    slug: 'sdr-rf-recon-lab',
    type: 'hardware',
    revision: '1.0',
    date: '2025-06',
    description: 'RTL-SDR passive RF reconnaissance and signal analysis environment',
    host: {
      name: 'GNU Radio Workstation',
      platform: 'GNU Radio 3.10',
      interface: 'USB 3.0'
    },
    components: [
      { name: 'RTL-SDR v3',     role: 'Sensor',      spec: '500kHz–1.75GHz, 8-bit ADC',  interface: 'USB 3.0' },
      { name: 'GNU Radio Host', role: 'Analyzer',    spec: '16GB RAM, GRC flowgraphs',    interface: 'USB 3.0' },
      { name: 'RF Environment', role: 'Environment', spec: 'Passive / live RF spectrum',  interface: 'Antenna' }
    ]
  }
];

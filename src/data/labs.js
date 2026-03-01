export const labs = [
  {
    id: 'metasploitable-2-lab',
    name: 'Metasploitable 2 Lab',
    slug: 'metasploitable-2-lab',
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
  }
];

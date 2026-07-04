// src/config/modules/pcap-wireshark.js
// The `pcap`-stage room for PCAP & Wireshark. Four hand-authored captures —
// ssh-brute.pcap, http-creds.pcap, dns-c2.pcap, smb-lateral.pcap — are walked
// as four "acts" with a shared jsmith/10.0.0.9/web-01 through-line (Act II
// deliberately breaks the pattern with a separate awilliams cleartext-post
// scenario). The stage tracks the loaded pcap, applied filter, and selected
// packet; nothing is parsed. Lazily imported by moduleRegistry.

const HOST = 'web-01';

export default {
  stageConfig: {
    host: HOST,
    initialPcap: 'ssh-brute.pcap',
    pcaps: {
      'ssh-brute.pcap': {
        packets: [
          { no: 1, time: '0.0000', src: '10.0.0.9', dst: '10.0.0.1', proto: 'TCP', info: '55432→22 [SYN]',
            details: [
              { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:09', 'Dst: 02:00:00:00:00:01'] },
              { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
              { layer: 'TCP', rows: ['Src Port: 55432', 'Dst Port: 22', 'Flags: SYN'] },
            ] },
          { no: 2, time: '0.0210', src: '10.0.0.1', dst: '10.0.0.9', proto: 'TCP', info: '22→55432 [SYN, ACK]',
            details: [
              { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:01', 'Dst: 02:00:00:00:00:09'] },
              { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
              { layer: 'TCP', rows: ['Src Port: 22', 'Dst Port: 55432', 'Flags: SYN,ACK'] },
            ] },
          { no: 4, time: '2.1044', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: User auth failure',
            details: [
              { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:09', 'Dst: 02:00:00:00:00:01'] },
              { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
              { layer: 'TCP', rows: ['Src Port: 55432', 'Dst Port: 22', 'Flags: PSH,ACK'] },
              { layer: 'SSH', rows: ['Message Code: 51 (User authentication failure)'] },
            ] },
        ],
        filters: [
          { match: /^ip\.addr\s*==\s*10\.0\.0\.9\s*$/i, keep: [1, 2, 4] },
          { match: /^ssh\s*$/i, keep: [4] },
        ],
        actions: [
          {
            match: { menu: 'Statistics→Conversations' },
            payload: {
              kind: 'table',
              columns: ['Address A', 'Address B', 'Packets', 'Bytes'],
              rows: [
                ['10.0.0.9', '10.0.0.1', '51', '8.4 kB'],
                ['10.0.0.4', '10.0.0.1', '3',  '0.6 kB'],
              ],
            },
          },
        ],
      },
    },
  },

  ceremony: {
    toolkit: ['display filters', 'Follow Stream', 'Statistics', 'Export Objects'],
    target: HOST,
  },

  sections: [
    {
      id: 'coming-online',
      title: 'Coming online',
      blocks: [
        { h2: 'Room scaffold' },
        { p: 'This section is a placeholder while Tasks 2–8 land. Type `ready` to advance.' },
        { task: 'Confirm the room is wired.' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /^\s*ready\s*$/i,
        hints: ['Type the word ready.'],
        reveal: 'ready',
        explain: 'Scaffold verified. Sections load in later tasks.',
      },
    },
  ],
};

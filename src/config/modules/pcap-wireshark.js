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
      // Filled in Tasks 4–7.
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

// src/config/modules/pcap-wireshark.js
// The `pcap`-stage room for PCAP & Wireshark. Four hand-authored captures —
// ssh-brute.pcap, http-creds.pcap, dns-c2.pcap, smb-lateral.pcap — are walked
// as four "acts" with a shared jsmith/10.0.0.9/web-01 through-line (Act II
// deliberately breaks the pattern with a separate awilliams cleartext-post
// scenario). The stage tracks the loaded pcap, applied filter, and selected
// packet; nothing is parsed. Lazily imported by moduleRegistry.

const HOST = 'web-01';

// ── Act I: SSH brute-force ─ same jsmith/10.0.0.9 story that splunk-queries
// and log-analysis already told, this time at the packet level. Handshake,
// five failed SSH auth exchanges, one success, all on 10.0.0.9 → web-01.
const sshBrute = {
  packets: [
    { no: 1, time: '0.0000', src: '10.0.0.9', dst: '10.0.0.1', proto: 'TCP', info: '55432→22 [SYN]',
      details: [
        { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:09', 'Dst: 02:00:00:00:00:01'] },
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55432', 'Dst Port: 22', 'Flags: SYN', 'Seq: 0'] },
      ] },
    { no: 2, time: '0.0210', src: '10.0.0.1', dst: '10.0.0.9', proto: 'TCP', info: '22→55432 [SYN, ACK]',
      details: [
        { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:01', 'Dst: 02:00:00:00:00:09'] },
        { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 22', 'Dst Port: 55432', 'Flags: SYN,ACK'] },
      ] },
    { no: 3, time: '0.0289', src: '10.0.0.9', dst: '10.0.0.1', proto: 'TCP', info: '55432→22 [ACK]',
      details: [
        { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:09', 'Dst: 02:00:00:00:00:01'] },
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55432', 'Dst Port: 22', 'Flags: ACK'] },
      ] },
    { no: 4, time: '0.1512', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: Protocol (SSH-2.0-OpenSSH_9.0)',
      details: [
        { layer: 'Ethernet II', rows: ['Src: 02:00:00:00:00:09', 'Dst: 02:00:00:00:00:01'] },
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55432', 'Dst Port: 22', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Protocol: SSH-2.0-OpenSSH_9.0'] },
      ] },
    { no: 5, time: '0.4711', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: User auth request (jsmith, password)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55432', 'Dst Port: 22', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 50 (User authentication request)', 'User: jsmith', 'Method: password'] },
      ] },
    { no: 6, time: '2.1044', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SSH', info: 'Server: User auth failure',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 22', 'Dst Port: 55432', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 51 (User authentication failure)'] },
      ] },
    { no: 7, time: '2.6510', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: User auth request (jsmith, password)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55440', 'Dst Port: 22', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 50 (User authentication request)', 'User: jsmith', 'Method: password'] },
      ] },
    { no: 8, time: '2.7011', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SSH', info: 'Server: User auth failure',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 22', 'Dst Port: 55440', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 51 (User authentication failure)'] },
      ] },
    { no: 9, time: '3.2183', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: User auth request (root, password)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55510', 'Dst Port: 22', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 50 (User authentication request)', 'User: root', 'Method: password'] },
      ] },
    { no: 10, time: '3.2412', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SSH', info: 'Server: User auth failure',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
        { layer: 'SSH', rows: ['Message Code: 51 (User authentication failure)'] },
      ] },
    { no: 11, time: '4.0044', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: User auth request (jsmith, password)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55552', 'Dst Port: 22', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 50 (User authentication request)', 'User: jsmith', 'Method: password'] },
      ] },
    { no: 12, time: '4.0801', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SSH', info: 'Server: User auth failure',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
        { layer: 'SSH', rows: ['Message Code: 51 (User authentication failure)'] },
      ] },
    { no: 13, time: '5.5209', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SSH', info: 'Client: User auth request (jsmith, password)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 55603', 'Dst Port: 22', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 50 (User authentication request)', 'User: jsmith', 'Method: password'] },
      ] },
    { no: 14, time: '5.5488', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SSH', info: 'Server: User auth success',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.1', 'Dst: 10.0.0.9', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 22', 'Dst Port: 55488', 'Flags: PSH,ACK'] },
        { layer: 'SSH', rows: ['Message Code: 52 (User authentication success)'] },
      ] },
  ],
  filters: [
    { match: /^ip\.addr\s*==\s*10\.0\.0\.9\s*$/i,
      keep: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { match: /^tcp\.port\s*==\s*22\s*$/i,
      keep: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { match: /^tcp\.port\s*==\s*22\s*&&\s*ssh\s*$/i,
      keep: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { match: /^ssh\s*$/i,
      keep: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { match: /^ssh\.message_code\s*==\s*52\s*$/i, keep: [14] },
  ],
  actions: [
    { match: { menu: 'Statistics→Conversations' },
      payload: {
        kind: 'table',
        columns: ['Address A', 'Address B', 'Packets', 'Bytes'],
        rows: [
          ['10.0.0.9',  '10.0.0.1', '51', '8.4 kB'],
          ['10.0.0.14', '10.0.0.1', '3',  '0.6 kB'],
          ['10.0.0.22', '10.0.0.1', '1',  '0.2 kB'],
        ],
      } },
  ],
};

export default {
  stageConfig: {
    host: HOST,
    initialPcap: 'ssh-brute.pcap',
    pcaps: {
      'ssh-brute.pcap': sshBrute,
      // http-creds.pcap: Task 5
      // dns-c2.pcap:     Task 6
      // smb-lateral.pcap: Task 7
    },
  },

  ceremony: {
    toolkit: ['display filters', 'Follow Stream', 'Statistics', 'Export Objects'],
    target: HOST,
  },

  sections: [
    // §1 — orientation (no checkpoint).
    {
      id: 'what-wireshark-sees',
      title: 'What Wireshark sees',
      blocks: [
        { h2: 'Packets are ground truth' },
        { p: 'Logs describe what a service *thinks* happened. A packet capture records what actually crossed the wire. When a log and a pcap disagree, the pcap wins — the SIEM only shows what someone told it, while the capture shows raw frames a NIC could not have hallucinated.' },
        { callout: 'Why pros do it: pcap fluency is what lets you contradict a vendor. "Your product says the session was benign; my capture shows the SYN, the auth, and the file transfer." That is the whole conversation.' },
        { p: 'Scenario: same alert as the log-analysis and Splunk rooms. Host `web-01`, jsmith brute force, source `10.0.0.9`. This time you will see it as packets. Four acts follow — SSH here, then a cleartext HTTP login, then a DNS-tunneled beacon, then SMB lateral movement — because a real triage day is never one protocol.' },
      ],
    },
    // §2 — File → Open.
    {
      id: 'open-ssh-brute',
      title: 'Open the capture',
      blocks: [
        { h3: 'File → Open' },
        { p: 'Wireshark opens one capture at a time. The `File` menu lists every pcap available in this room; picking one resets the filter and drops you at packet 1. You will swap captures three more times across the four acts.' },
        { task: 'Load `ssh-brute.pcap`.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'load' && e.pcap === 'ssh-brute.pcap',
        hints: [
          'Click the `File ▾` menu in the stage.',
          'The first entry is Open · ssh-brute.pcap.',
        ],
        reveal: 'File → Open → ssh-brute.pcap',
        explain: 'Capture loaded. Fourteen packets, a full three-way handshake, several SSH auth exchanges, one success at the tail — the exact same story the log said, this time in frames.',
      },
    },
    // §3 — host filter.
    {
      id: 'filter-by-host',
      title: 'Filter by host',
      blocks: [
        { h3: 'Display filters, not capture filters' },
        { p: 'Wireshark has two filter languages: *capture filters* (BPF, applied at the NIC — chosen before you record) and *display filters* (applied to the already-loaded capture — what you type in the bar above the packet list). Display filters are the analyst\'s daily driver and the only kind this room uses.' },
        {
          list: [
            '`ip.addr == 10.0.0.9`: any packet where source or destination is that host.',
            '`ip.src == 10.0.0.9`: only where 10.0.0.9 is the source.',
            '`ip.dst == 10.0.0.1`: only where 10.0.0.1 is the destination.',
          ],
        },
        { task: 'Filter the list to every packet touching 10.0.0.9.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'filter' && e.payload?.matched && /^ip\.addr\s*==\s*10\.0\.0\.9\s*$/i.test(e.filter),
        hints: [
          'The field is `ip.addr`.',
          'Use `==` (two equals), then the IP.',
          'Try `ip.addr == 10.0.0.9`.',
        ],
        reveal: 'ip.addr == 10.0.0.9',
        explain: 'All 14 packets survive — every frame in this capture touches 10.0.0.9. In a busier pcap the same filter would cut you from thousands of rows to just the ones about this host.',
      },
    },
    // §4 — narrow to SSH.
    {
      id: 'filter-ssh',
      title: 'Narrow to SSH',
      blocks: [
        { h3: 'Combine filters with `&&`' },
        { p: 'Display filters compose. `&&` (or `and`) intersects two conditions; `||` (or `or`) unions them. To see only the SSH-layer messages on the standard SSH port, combine a port match with the protocol filter.' },
        { code: 'tcp.port == 22 && ssh' },
        { p: 'The bare `ssh` keyword matches any packet whose highest layer Wireshark decoded as SSH — that is the same set you would get on any well-formed SSH session, since the handshake below layer-7 is TCP-only.' },
        { task: 'Filter to only the SSH message packets.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'filter' && e.payload?.matched && /^(tcp\.port\s*==\s*22\s*&&\s*ssh|ssh)\s*$/i.test(e.filter),
        hints: [
          'The bare protocol keyword is `ssh`.',
          'You can also combine `tcp.port == 22 && ssh`.',
          'Try `ssh` or `tcp.port == 22 && ssh`.',
        ],
        reveal: 'tcp.port == 22 && ssh',
        explain: 'Eleven SSH-layer packets remain — the protocol banner, five auth requests, five auth responses. The TCP handshake dropped out, which is fine: the story is at the SSH layer now.',
      },
    },
    // §5 — Statistics → Conversations.
    {
      id: 'stats-conversations',
      title: 'Read the loudest talker',
      blocks: [
        { h3: 'Statistics → Conversations' },
        { p: 'The Conversations dialog buckets every packet by endpoint pair and shows counts / byte totals per pair. It is the fastest way to answer "which host is loudest here" without writing a filter — and it produces the same shape as the `sort | uniq -c | sort -rn` ranking from the log-analysis room.' },
        { callout: 'Why pros do it: on a big pcap the Conversations dialog is where an incident becomes obvious. One row at the top with three orders of magnitude more packets than the rest is a red flag before you have typed a single filter.' },
        { task: 'Open Statistics → Conversations.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'action' && e.action === 'Statistics→Conversations',
        hints: [
          'Click the `Statistics ▾` menu in the stage.',
          'Pick `Conversations`.',
        ],
        reveal: 'Statistics → Conversations',
        explain: '10.0.0.9 ↔ 10.0.0.1 owns 51 of the 55 packets in scope — the same rank the SPL `| stats count by src_ip` and the shell `sort | uniq -c` produced. One host, one target, one story.',
      },
    },
    // §6 — did it succeed?
    {
      id: 'ssh-success',
      title: 'Did it land?',
      blocks: [
        { h3: 'Filter to the success message' },
        { p: 'SSH numbers its auth messages. Code 50 is a request, 51 is a failure, 52 is a success. Filter on the message code and you see exactly whether one of the attempts eventually landed.' },
        { code: 'ssh.message_code == 52' },
        { task: 'Show every successful SSH authentication.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'filter' && e.payload?.matched && /^ssh\.message_code\s*==\s*52\s*$/i.test(e.filter),
        hints: [
          '52 is the auth-success code.',
          'The field is `ssh.message_code`.',
          'Try `ssh.message_code == 52`.',
        ],
        reveal: 'ssh.message_code == 52',
        explain: 'One packet, at 5.55s — jsmith\'s password finally worked. That is the moment the brute force became a compromise. Everything after that packet on this host is post-exploitation.',
      },
    },
    // Placeholder tail until Task 5 lands.
    {
      id: 'act2-coming',
      title: 'Act II lands next',
      blocks: [
        { h2: 'More acts on the way' },
        { p: 'Type `next` to advance while Acts II–IV are being built.' },
        { task: 'Advance.' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /^\s*next\s*$/i,
        hints: ['Type the word next.'],
        reveal: 'next',
        explain: 'Onward.',
      },
    },
  ],
};

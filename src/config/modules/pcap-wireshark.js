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

// ── Act II: HTTP credential leak ─ intranet host (10.0.0.55) hits a legacy
// portal at http://intranet.corp/login and posts creds in cleartext. Deliberate
// break from the jsmith throughline: this is awilliams making a mistake, not
// the attacker on 10.0.0.9. The pedagogy is: not every bad packet is the same
// attacker; HTTPS mattered here.
const httpCreds = {
  packets: [
    { no: 1, time: '0.0000', src: '10.0.0.55', dst: '10.0.0.80', proto: 'TCP', info: '48211→80 [SYN]',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.55', 'Dst: 10.0.0.80', 'TTL: 64'] },
        { layer: 'TCP', rows: ['Src Port: 48211', 'Dst Port: 80', 'Flags: SYN'] },
      ] },
    { no: 2, time: '0.0180', src: '10.0.0.80', dst: '10.0.0.55', proto: 'TCP', info: '80→48211 [SYN, ACK]',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.80', 'Dst: 10.0.0.55'] },
        { layer: 'TCP', rows: ['Src Port: 80', 'Dst Port: 48211', 'Flags: SYN,ACK'] },
      ] },
    { no: 3, time: '0.0212', src: '10.0.0.55', dst: '10.0.0.80', proto: 'HTTP', info: 'GET /login HTTP/1.1',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.55', 'Dst: 10.0.0.80'] },
        { layer: 'TCP', rows: ['Src Port: 48211', 'Dst Port: 80', 'Flags: PSH,ACK'] },
        { layer: 'HTTP', rows: ['Request Method: GET', 'Request URI: /login', 'Host: intranet.corp', 'User-Agent: Mozilla/5.0'] },
      ] },
    { no: 4, time: '0.0402', src: '10.0.0.80', dst: '10.0.0.55', proto: 'HTTP', info: 'HTTP/1.1 200 OK (text/html)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.80', 'Dst: 10.0.0.55'] },
        { layer: 'HTTP', rows: ['Status Code: 200', 'Content-Type: text/html', 'Content-Length: 812'] },
      ] },
    { no: 5, time: '4.2201', src: '10.0.0.55', dst: '10.0.0.80', proto: 'HTTP', info: 'POST /login HTTP/1.1  (application/x-www-form-urlencoded)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.55', 'Dst: 10.0.0.80'] },
        { layer: 'TCP', rows: ['Src Port: 48211', 'Dst Port: 80', 'Flags: PSH,ACK'] },
        { layer: 'HTTP', rows: ['Request Method: POST', 'Request URI: /login', 'Host: intranet.corp', 'Content-Type: application/x-www-form-urlencoded', 'Content-Length: 44'] },
        { layer: 'HTML Form URL Encoded', rows: ['user: awilliams', 'password: Summer2026!'] },
      ] },
    { no: 6, time: '4.2517', src: '10.0.0.80', dst: '10.0.0.55', proto: 'HTTP', info: 'HTTP/1.1 302 Found (Location: /home)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.80', 'Dst: 10.0.0.55'] },
        { layer: 'HTTP', rows: ['Status Code: 302', 'Location: /home', 'Set-Cookie: session=8f31…'] },
      ] },
  ],
  filters: [
    { match: /^http\s*$/i, keep: [3, 4, 5, 6] },
    { match: /^http\.request\.method\s*==\s*"POST"\s*$/i, keep: [5] },
  ],
  actions: [
    { match: { menu: 'Analyze→Follow HTTP Stream' },
      payload: {
        kind: 'stream',
        text: [
          'GET /login HTTP/1.1',
          'Host: intranet.corp',
          'User-Agent: Mozilla/5.0',
          '',
          'HTTP/1.1 200 OK',
          'Content-Type: text/html',
          'Content-Length: 812',
          '',
          '<html>… login form …</html>',
          '',
          'POST /login HTTP/1.1',
          'Host: intranet.corp',
          'Content-Type: application/x-www-form-urlencoded',
          'Content-Length: 44',
          '',
          'user=awilliams&password=Summer2026!',
          '',
          'HTTP/1.1 302 Found',
          'Location: /home',
          'Set-Cookie: session=8f31…; Path=/; HttpOnly',
        ].join('\n'),
      } },
  ],
};

// ── Act III: DNS tunneling / C2 beacon ─ 10.0.0.9 (jsmith throughline
// resumes) beacons to *.c2.badc2.example every 60s via DNS TXT queries. A
// few benign DNS queries (pool.ntp.org, intranet.corp) sit inline so the
// anomaly stands out against a real-looking baseline.
const dnsC2 = {
  packets: [
    { no: 1, time: '0.0000',   src: '10.0.0.9', dst: '10.0.0.53', proto: 'DNS', info: 'Standard query TXT r7f2a1.c2.badc2.example',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.53'] },
        { layer: 'UDP', rows: ['Src Port: 51221', 'Dst Port: 53'] },
        { layer: 'DNS', rows: ['Transaction ID: 0x8a12', 'Flags: Standard query', 'Query Name: r7f2a1.c2.badc2.example', 'Query Type: TXT'] },
      ] },
    { no: 2, time: '0.0117',   src: '10.0.0.53', dst: '10.0.0.9', proto: 'DNS', info: 'Standard query response TXT (198 bytes)',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.53', 'Dst: 10.0.0.9'] },
        { layer: 'DNS', rows: ['Transaction ID: 0x8a12', 'Answer TXT: "eyJvIjoic2FyIiwiYyI6ImxzIn0="'] },
      ] },
    { no: 3, time: '12.4402',  src: '10.0.0.9', dst: '10.0.0.53', proto: 'DNS', info: 'Standard query A pool.ntp.org',
      details: [
        { layer: 'DNS', rows: ['Query Name: pool.ntp.org', 'Query Type: A'] },
      ] },
    { no: 4, time: '12.4488',  src: '10.0.0.53', dst: '10.0.0.9', proto: 'DNS', info: 'Standard query response A 162.159.200.1',
      details: [
        { layer: 'DNS', rows: ['Answer A: 162.159.200.1'] },
      ] },
    { no: 5, time: '60.0044',  src: '10.0.0.9', dst: '10.0.0.53', proto: 'DNS', info: 'Standard query TXT c1e9d0.c2.badc2.example',
      details: [
        { layer: 'DNS', rows: ['Query Name: c1e9d0.c2.badc2.example', 'Query Type: TXT'] },
      ] },
    { no: 6, time: '60.0140',  src: '10.0.0.53', dst: '10.0.0.9', proto: 'DNS', info: 'Standard query response TXT (204 bytes)',
      details: [
        { layer: 'DNS', rows: ['Answer TXT: "eyJvIjoibGlzdF9kaXIiLCJjIjoiIn0="'] },
      ] },
    { no: 7, time: '73.1201',  src: '10.0.0.9', dst: '10.0.0.53', proto: 'DNS', info: 'Standard query AAAA intranet.corp',
      details: [
        { layer: 'DNS', rows: ['Query Name: intranet.corp', 'Query Type: AAAA'] },
      ] },
    { no: 8, time: '120.0055', src: '10.0.0.9', dst: '10.0.0.53', proto: 'DNS', info: 'Standard query TXT 8b3311.c2.badc2.example',
      details: [
        { layer: 'DNS', rows: ['Query Name: 8b3311.c2.badc2.example', 'Query Type: TXT'] },
      ] },
    { no: 9, time: '120.0121', src: '10.0.0.53', dst: '10.0.0.9', proto: 'DNS', info: 'Standard query response TXT (196 bytes)',
      details: [
        { layer: 'DNS', rows: ['Answer TXT: "eyJvIjoicHdkIiwiYyI6IiJ9"'] },
      ] },
    { no: 10, time: '180.0038', src: '10.0.0.9', dst: '10.0.0.53', proto: 'DNS', info: 'Standard query TXT 4dee02.c2.badc2.example',
      details: [
        { layer: 'DNS', rows: ['Query Name: 4dee02.c2.badc2.example', 'Query Type: TXT'] },
      ] },
    { no: 11, time: '180.0126', src: '10.0.0.53', dst: '10.0.0.9', proto: 'DNS', info: 'Standard query response TXT (212 bytes)',
      details: [
        { layer: 'DNS', rows: ['Answer TXT: "eyJvIjoiZG93bmxvYWQiLCJjIjoicHIueGxzIn0="'] },
      ] },
  ],
  filters: [
    { match: /^dns\s*$/i, keep: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    { match: /^dns\.qry\.name\s+contains\s+"badc2"\s*$/i, keep: [1, 2, 5, 6, 8, 9, 10, 11] },
  ],
  actions: [
    { match: { menu: 'Statistics→Protocol Hierarchy' },
      payload: {
        kind: 'table',
        columns: ['Protocol', 'Packets', '% Packets', 'Bytes'],
        rows: [
          ['Ethernet',       '11', '100.0%', '2.3 kB'],
          ['IPv4',           '11', '100.0%', '2.3 kB'],
          ['UDP',            '11', '100.0%', '2.3 kB'],
          ['DNS',            '11', '100.0%', '2.3 kB'],
          ['  DNS TXT (badc2.example)', '8',  '72.7%',  '1.9 kB'],
          ['  DNS other',              '3',  '27.3%',  '0.4 kB'],
        ],
      } },
  ],
};

// ── Act IV: SMB lateral movement ─ 10.0.0.9 pivots to the finance share on
// 10.0.0.1 and pulls a spreadsheet. Same actor as Act I and III — the room's
// throughline resolves here.
const smbLateral = {
  packets: [
    { no: 1, time: '0.0000', src: '10.0.0.9', dst: '10.0.0.1', proto: 'TCP',  info: '49882→445 [SYN]',
      details: [
        { layer: 'IPv4', rows: ['Src: 10.0.0.9', 'Dst: 10.0.0.1'] },
        { layer: 'TCP', rows: ['Src Port: 49882', 'Dst Port: 445', 'Flags: SYN'] },
      ] },
    { no: 2, time: '0.0192', src: '10.0.0.1', dst: '10.0.0.9', proto: 'TCP',  info: '445→49882 [SYN, ACK]',
      details: [
        { layer: 'TCP', rows: ['Src Port: 445', 'Dst Port: 49882', 'Flags: SYN,ACK'] },
      ] },
    { no: 3, time: '0.0301', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SMB2', info: 'Negotiate Protocol Request',
      details: [
        { layer: 'SMB2', rows: ['Command: Negotiate Protocol (0x00)', 'Dialects: 0x0311 (SMB 3.1.1), 0x0302, 0x0210'] },
      ] },
    { no: 4, time: '0.0402', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SMB2', info: 'Negotiate Protocol Response',
      details: [
        { layer: 'SMB2', rows: ['Command: Negotiate Protocol (0x00)', 'Dialect Selected: 0x0311 (SMB 3.1.1)'] },
      ] },
    { no: 5, time: '0.0510', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SMB2', info: 'Session Setup Request, User: jsmith',
      details: [
        { layer: 'SMB2', rows: ['Command: Session Setup (0x01)', 'User: jsmith'] },
      ] },
    { no: 6, time: '0.0688', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SMB2', info: 'Session Setup Response',
      details: [
        { layer: 'SMB2', rows: ['Command: Session Setup (0x01)', 'Status: STATUS_SUCCESS'] },
      ] },
    { no: 7, time: '0.0801', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SMB2', info: 'Tree Connect Request, Path: \\\\10.0.0.1\\finance',
      details: [
        { layer: 'SMB2', rows: ['Command: Tree Connect (0x03)', 'Path: \\\\10.0.0.1\\finance'] },
      ] },
    { no: 8, time: '0.0912', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SMB2', info: 'Tree Connect Response',
      details: [
        { layer: 'SMB2', rows: ['Command: Tree Connect (0x03)', 'Status: STATUS_SUCCESS'] },
      ] },
    { no: 9, time: '0.1044', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SMB2', info: 'Find Request, Pattern: *',
      details: [
        { layer: 'SMB2', rows: ['Command: Find (0x0e)', 'Search Pattern: *'] },
      ] },
    { no: 10, time: '0.1210', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SMB2', info: 'Find Response, 3 entries (payroll.xlsx, budget-2026.xlsx, README.txt)',
      details: [
        { layer: 'SMB2', rows: ['Command: Find (0x0e)', 'Entry: payroll.xlsx (128 kB)', 'Entry: budget-2026.xlsx (96 kB)', 'Entry: README.txt (1.2 kB)'] },
      ] },
    { no: 11, time: '0.1512', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SMB2', info: 'Create Request, File: payroll.xlsx',
      details: [
        { layer: 'SMB2', rows: ['Command: Create (0x05)', 'Filename: payroll.xlsx', 'Access: Read'] },
      ] },
    { no: 12, time: '0.1601', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SMB2', info: 'Create Response, File: payroll.xlsx',
      details: [
        { layer: 'SMB2', rows: ['Command: Create (0x05)', 'Status: STATUS_SUCCESS', 'File ID: 0x00…f1'] },
      ] },
    { no: 13, time: '0.1704', src: '10.0.0.9', dst: '10.0.0.1', proto: 'SMB2', info: 'Read Request, File: payroll.xlsx, Length: 131072',
      details: [
        { layer: 'SMB2', rows: ['Command: Read (0x08)', 'File: payroll.xlsx', 'Read Length: 131072 bytes'] },
      ] },
    { no: 14, time: '0.2011', src: '10.0.0.1', dst: '10.0.0.9', proto: 'SMB2', info: 'Read Response, 131072 bytes',
      details: [
        { layer: 'SMB2', rows: ['Command: Read (0x08)', 'Status: STATUS_SUCCESS', 'Byte Count: 131072'] },
      ] },
  ],
  filters: [
    { match: /^smb2\s*$/i, keep: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { match: /^smb2\.filename\s+contains\s+"payroll"\s*$/i, keep: [11, 12, 13, 14] },
  ],
  actions: [
    { match: { menu: 'File→Export Objects→SMB' },
      payload: {
        kind: 'objects',
        rows: [
          { filename: 'payroll.xlsx',      size: '128.0 kB' },
          { filename: 'budget-2026.xlsx',  size: '96.0 kB'  },
          { filename: 'README.txt',        size: '1.2 kB'   },
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
      'http-creds.pcap': httpCreds,
      'dns-c2.pcap': dnsC2,
      'smb-lateral.pcap': smbLateral,
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
    // §7 — swap to http-creds.
    {
      id: 'open-http-creds',
      title: 'Swap captures',
      blocks: [
        { h2: 'Act II: an HTTP credential leak' },
        { p: 'Same organization, different problem. An internal host is posting to a legacy portal at `http://intranet.corp/login` — a URL that starts with `http`, not `https`. Anyone on-path sees the request body. The user in this capture is `awilliams`, not jsmith; the point is that not every bad packet in your day comes from the same actor.' },
        { task: 'Load `http-creds.pcap`.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'load' && e.pcap === 'http-creds.pcap',
        hints: [
          'Click the `File ▾` menu.',
          'Pick Open · http-creds.pcap.',
        ],
        reveal: 'File → Open → http-creds.pcap',
        explain: 'Six packets: a handshake, a GET, a POST, and a redirect. Small and fast — but the POST body is where the story lives.',
      },
    },
    // §8 — POST filter.
    {
      id: 'filter-post',
      title: 'Filter HTTP requests',
      blocks: [
        { h3: 'Match the method' },
        { p: 'The `http` display filter keeps every HTTP-layer packet. To narrow further, filter on a request field. `http.request.method` names the verb; the value is a quoted string.' },
        { code: 'http.request.method == "POST"' },
        { task: 'Filter to only POST requests.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'filter' && e.payload?.matched && /^http\.request\.method\s*==\s*"POST"\s*$/i.test(e.filter),
        hints: [
          'The field is `http.request.method`.',
          'The value is `"POST"` (quoted).',
          'Try `http.request.method == "POST"`.',
        ],
        reveal: 'http.request.method == "POST"',
        explain: 'One packet — the single POST. Look at its details tree: the URL-encoded form is decoded inline. You can already read the password without opening another dialog.',
      },
    },
    // §9 — Follow HTTP Stream.
    {
      id: 'follow-http-stream',
      title: 'Follow the stream',
      blocks: [
        { h3: 'Analyze → Follow HTTP Stream' },
        { p: 'For long conversations, the details tree gets clumsy. `Follow HTTP Stream` reassembles both sides of an HTTP exchange — request headers, request body, response headers, response body — into one scrollable pane. It is how you read what really flowed between two endpoints.' },
        { task: 'Open Analyze → Follow HTTP Stream.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'action' && e.action === 'Analyze→Follow HTTP Stream',
        hints: [
          'Click the `Analyze ▾` menu in the stage.',
          'Pick `Follow HTTP Stream`.',
        ],
        reveal: 'Analyze → Follow HTTP Stream',
        explain: '`user=awilliams&password=Summer2026!` sits in the request body in plain UTF-8. Anyone with a Ethernet tap between awilliams and the portal saw this password. The response set a session cookie — an attacker who saw the POST can now replay that session too.',
      },
    },
    // §10 — why-it-matters answer.
    {
      id: 'why-http-bad',
      title: 'Why this is bad',
      blocks: [
        { h3: 'One-word answer' },
        { p: 'The password itself is fine — 12 characters, mixed case, a symbol. The problem is *how* it moved. Name the one thing about this exchange that makes it dangerous.' },
        { task: 'One word: what is missing that would have protected the credential?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /\b(https|tls|ssl|encryption|encrypted)\b/i,
        hints: [
          'Look at the URL scheme in the Host header.',
          'What protects a login form in transit?',
        ],
        reveal: 'HTTPS (TLS)',
        explain: 'HTTPS. The portal was reachable on port 80 and awilliams — or the browser\'s bookmark, or a link somewhere — used it. The fix is not "pick a better password"; the fix is redirect 80→443 at the portal and force TLS. The lesson from the packet is that "should have been encrypted" is a visible, checkable property of a session, not a policy debate.',
      },
    },
    // §11 — swap to dns-c2.
    {
      id: 'open-dns-c2',
      title: 'Swap captures',
      blocks: [
        { h2: 'Act III: DNS tunneling' },
        { p: 'Back on `10.0.0.9`. This capture shows the same host you triaged in Act I doing something new: DNS TXT queries to `*.c2.badc2.example` on a suspiciously regular cadence, interleaved with normal-looking `pool.ntp.org` and `intranet.corp` lookups. The payload is not in the packets — the payload *is* the packets.' },
        { task: 'Load `dns-c2.pcap`.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'load' && e.pcap === 'dns-c2.pcap',
        hints: ['File → Open → dns-c2.pcap.'],
        reveal: 'File → Open → dns-c2.pcap',
        explain: 'Eleven packets, all DNS. The suspicious ones share a subdomain pattern; the benign ones do not. That is your filterable distinction.',
      },
    },
    // §12 — Protocol Hierarchy.
    {
      id: 'protocol-hierarchy',
      title: 'Look at the mix',
      blocks: [
        { h3: 'Statistics → Protocol Hierarchy' },
        { p: 'The Protocol Hierarchy dialog is Wireshark\'s "what proportion of the traffic is what protocol" view. On a healthy host, DNS is a rounding error. On a host that beacons over DNS, it dominates. Read the tree; look for a protocol taking a share it should not.' },
        { task: 'Open Statistics → Protocol Hierarchy.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'action' && e.action === 'Statistics→Protocol Hierarchy',
        hints: [
          'Click the `Statistics ▾` menu in the stage.',
          'Pick `Protocol Hierarchy`.',
        ],
        reveal: 'Statistics → Protocol Hierarchy',
        explain: 'DNS is 100% of the packets in this window — and 72.7% of them are TXT queries to `badc2.example`. That is not a browser resolving a name; that is a channel. The proportion alone is the signal.',
      },
    },
    // §13 — name filter.
    {
      id: 'filter-badc2',
      title: 'Filter the suspicious names',
      blocks: [
        { h3: 'Substring match on query names' },
        { p: 'The `contains` operator is a substring match on the field value. Point it at `dns.qry.name` to keep only queries whose name includes a specific pattern — perfect when you know the C2 domain family but not the exact random subdomain.' },
        { code: 'dns.qry.name contains "badc2"' },
        { task: 'Filter to only the badc2 queries and responses.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'filter' && e.payload?.matched && /^dns\.qry\.name\s+contains\s+"badc2"\s*$/i.test(e.filter),
        hints: [
          'The field is `dns.qry.name`.',
          'The operator is `contains` (no quotes around the operator).',
          'Try `dns.qry.name contains "badc2"`.',
        ],
        reveal: 'dns.qry.name contains "badc2"',
        explain: 'Eight packets — four query/response pairs. Look at the timestamps in the list.',
      },
    },
    // §14 — cadence answer.
    {
      id: 'cadence',
      title: 'Read the cadence',
      blocks: [
        { h3: 'Numbers hide in intervals' },
        { p: 'Beacons rarely hide in payload; they hide in *timing*. Read the timestamps on the four badc2 queries: 0.0000, 60.0044, 120.0055, 180.0038. The gaps are the tell.' },
        { task: 'How many seconds between successive queries?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /\b60\b/,
        hints: ['Subtract the first two timestamps.'],
        reveal: '60',
        explain: 'Sixty-second beacon. A jittered attacker would smear this over ±10s; the fixed cadence here is early-stage tradecraft, and it is why the Protocol Hierarchy view lit up in §12. In production you would page this on a Splunk `| streamstats` sliding-window rule; the pcap is the confirming ground truth.',
      },
    },
    // §15 — swap to smb-lateral.
    {
      id: 'open-smb-lateral',
      title: 'Swap captures',
      blocks: [
        { h2: 'Act IV: SMB lateral movement' },
        { p: 'The 5.55s SSH success in Act I meant the attacker had shell on `web-01`. This capture is what they did with it — pivoted to the file server (`10.0.0.1`, running SMB on 445), enumerated `\\10.0.0.1\\finance`, and pulled a spreadsheet. Source is `10.0.0.9`; the throughline resolves here.' },
        { task: 'Load `smb-lateral.pcap`.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'load' && e.pcap === 'smb-lateral.pcap',
        hints: ['File → Open → smb-lateral.pcap.'],
        reveal: 'File → Open → smb-lateral.pcap',
        explain: 'Fourteen packets: handshake, SMB negotiate + session setup, tree connect to the finance share, a directory list, and a single Read that pulls the whole file.',
      },
    },
    // §16 — SMB filter.
    {
      id: 'filter-smb2',
      title: 'Filter to SMB',
      blocks: [
        { h3: 'Modern SMB is `smb2`' },
        { p: 'SMB1 is legacy and rare in a healthy 2026 network; the Wireshark keyword for the modern dialect (2.x and 3.x) is `smb2`. Use it to strip the handshake and leave only the protocol messages worth reading.' },
        { code: 'smb2' },
        { task: 'Filter to only the SMB2 messages.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'filter' && e.payload?.matched && /^smb2\s*$/i.test(e.filter),
        hints: [
          'The bare keyword is `smb2`.',
          'Just type it in the filter bar.',
        ],
        reveal: 'smb2',
        explain: 'Twelve SMB2 messages remain. Scroll to the Tree Connect on packet 7 — path `\\\\10.0.0.1\\finance`. The attacker knew where to look; a real triage would ask what other shares they touched off-capture.',
      },
    },
    // §17 — Export Objects.
    {
      id: 'export-objects-smb',
      title: 'Export the object',
      blocks: [
        { h3: 'File → Export Objects → SMB' },
        { p: 'When a file traverses SMB, Wireshark can reassemble the Read responses back into the original bytes. `File → Export Objects → SMB` opens a dialog listing every file that crossed the wire in the capture, with size and the option to save. In an investigation this is how you recover what was taken.' },
        { task: 'Open File → Export Objects → SMB.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: (e) => e.type === 'action' && e.action === 'File→Export Objects→SMB',
        hints: [
          'Click the `File ▾` menu in the stage.',
          'Pick `Export Objects → SMB`.',
        ],
        reveal: 'File → Export Objects → SMB',
        explain: 'Three files listed. `payroll.xlsx` (128 kB) is the one that was Read — packets 11–14 pulled it in a single request. This is the exfil. Names, sizes, and file IDs go straight into the incident write-up.',
      },
    },
    // §18 — verdict.
    {
      id: 'verdict',
      title: 'Call it',
      blocks: [
        { h3: 'Is the compromise contained?' },
        { p: 'Zoom out. Act I: brute force succeeded from `10.0.0.9`. Act III: that same host was already beaconing out via DNS on a 60s cadence — so the box was owned before the SSH success, or the attacker persisted immediately after. Act IV: they used that access to pull `payroll.xlsx` from the finance share. Meanwhile Act II is a separate insider mistake by awilliams that also needs work but is unrelated. Two independent problems, both live.' },
        { task: 'Given three acts share the same threat actor and the fourth is a separate insider mistake, is the compromise contained? (yes / no)' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /^\s*n(o)?\s*$/i,
        hints: ['Look at what still has access, and to what.'],
        reveal: 'no',
        explain: 'No. Kill `jsmith`\'s session, block `10.0.0.9` at the perimeter, sinkhole `*.badc2.example` at the resolver, and rotate the credential — those close Act I / III / IV. Force `intranet.corp` to HTTPS, rotate awilliams\'s password, and audit who else uses that portal — that closes Act II. You just triaged four incidents from four flat captures, and the shape of the packet-analysis work is the same every time: load, filter, pivot, follow, export.',
      },
    },
  ],
};

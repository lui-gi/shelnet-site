// src/config/modules/active-reconnaissance.js
// Reference `shell`-stage room. Teaches active reconnaissance — the "loud" part
// of recon that actually touches the target — from ground up (ping sweep, port
// scan, service/version, OS fingerprint) then into advanced tradecraft (NSE,
// UDP, timing/decoy stealth, ARP, alt tools). The story walks the learner
// across a /24 range, narrows to the best-looking host, and hands off to the
// Enumeration room at 10.0.0.5. Lazily imported by moduleRegistry; consumed
// by components/room/Room.jsx. Shell command matchers are whitespace/case
// tolerant; more specific patterns are listed first so a broad `nmap … 10.0.0.5`
// falls through to the base TCP port scan.

const RANGE = '10.0.0.0/24';
const HOST = '10.0.0.5';

export default {
  stageConfig: {
    host: 'kali',
    prompt: 'kali@ops',
    cwd: '~',
    motd: [
      `engagement scope: ${RANGE} (written authorization on file)`,
      'toolkit ready: nmap, arp-scan, masscan, netcat',
      "type a command below; try the task on the left, or `clear`.",
      '',
    ],
    commands: [
      // Host discovery — ping sweep across the /24.
      {
        match: /^nmap\s+-sn\s+10\.0\.0\.0\/24/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.1',
          'Host is up (0.00034s latency).',
          'MAC Address: 00:1C:0E:11:22:33 (Cisco Systems)',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          'MAC Address: 00:0C:29:44:55:66 (VMware)',
          'Nmap scan report for 10.0.0.7',
          'Host is up (0.00050s latency).',
          'MAC Address: 00:50:56:77:88:99 (VMware)',
          'Nmap scan report for 10.0.0.11',
          'Host is up (0.00061s latency).',
          'MAC Address: 00:15:5D:AA:BB:CC (Microsoft)',
          '',
          'Nmap done: 256 IP addresses (4 hosts up) scanned in 3.42 seconds',
        ],
      },
      // ARP scan — LAN-native discovery that bypasses ICMP filtering.
      {
        match: /^arp-scan\s+[^\n]*10\.0\.0\.0\/24/i,
        output: [
          'Interface: eth0, type: EN10MB, MAC: 00:0c:29:aa:bb:cc, IPv4: 10.0.0.100',
          'Starting arp-scan 1.9.7',
          '10.0.0.1        00:1c:0e:11:22:33   Cisco Systems, Inc',
          '10.0.0.5        00:0c:29:44:55:66   VMware, Inc.',
          '10.0.0.7        00:50:56:77:88:99   VMware, Inc.',
          '10.0.0.11       00:15:5d:aa:bb:cc   Microsoft Corporation',
          '',
          '4 packets received by filter, 0 packets dropped by kernel',
          'Ending arp-scan 1.9.7: 256 hosts scanned in 1.84 seconds. 4 responded',
        ],
      },
      // Stealth combo — SYN + slow timing + decoys. Must match ALL three flags.
      {
        match: /^nmap(?=[\s\S]*-sS)(?=[\s\S]*-T[0-3])(?=[\s\S]*-D)[\s\S]*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          '',
          'PORT     STATE SERVICE',
          '22/tcp   open  ssh',
          '139/tcp  open  netbios-ssn',
          '445/tcp  open  microsoft-ds',
          '3306/tcp open  mysql',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 214.55 seconds',
        ],
      },
      // NSE — default scripts (-sC) or an explicit --script selection.
      {
        match: /^nmap\s+[^\n]*(--script\b|-sC\b)[^\n]*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          '',
          'PORT     STATE SERVICE',
          '22/tcp   open  ssh',
          '| ssh-hostkey:',
          '|_  2048 ab:cd:ef:01:23:45 (RSA)',
          '139/tcp  open  netbios-ssn',
          '445/tcp  open  microsoft-ds',
          '| smb-vuln-cve2017-7494:',
          '|   VULNERABLE:',
          '|   Remote code execution in Samba (SambaCry) < 4.6.4',
          '|     State: LIKELY VULNERABLE',
          '|_    References: https://nvd.nist.gov/vuln/detail/CVE-2017-7494',
          '| smb2-security-mode:',
          '|   3.1.1:',
          '|_    Message signing enabled but not required',
          '3306/tcp open  mysql',
          '|_mysql-empty-password: false',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 18.20 seconds',
        ],
      },
      // UDP scan — flag common UDP services (SNMP, NetBIOS name service).
      {
        match: /^nmap\s+[^\n]*-sU\b[^\n]*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Warning: 10.0.0.5 giving up on port because retransmission cap hit (2)',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          'Not shown: 18 closed|filtered udp ports (port-unreach)',
          '',
          'PORT    STATE         SERVICE',
          '137/udp open          netbios-ns',
          '161/udp open|filtered snmp',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 47.11 seconds',
        ],
      },
      // OS fingerprint (-O).
      {
        match: /^nmap\s+[^\n]*-O\b[^\n]*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          '',
          'Device type: general purpose',
          'Running: Linux 5.X',
          'OS CPE: cpe:/o:linux:linux_kernel:5',
          'OS details: Linux 5.4 - 5.15',
          'Network Distance: 1 hop',
          '',
          'OS detection performed. Nmap done: 1 IP address (1 host up).',
        ],
      },
      // Aggressive (-A) — OS + version + default scripts + traceroute rolled up.
      {
        match: /^nmap\s+[^\n]*-A\b[^\n]*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          '',
          'PORT     STATE SERVICE      VERSION',
          '22/tcp   open  ssh          OpenSSH 8.2p1 Ubuntu 4ubuntu0.5',
          '139/tcp  open  netbios-ssn  Samba smbd 4.13.17',
          '445/tcp  open  microsoft-ds Samba smbd 4.13.17',
          '3306/tcp open  mysql        MySQL 8.0.32',
          'Device type: general purpose',
          'OS details: Linux 5.4 - 5.15',
          'Network Distance: 1 hop',
          '',
          'Aggressive scan complete. Nmap done: 1 host up.',
        ],
      },
      // Service / version detection.
      {
        match: /^nmap\s+[^\n]*-sV\b[^\n]*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          '',
          'PORT     STATE SERVICE      VERSION',
          '22/tcp   open  ssh          OpenSSH 8.2p1 Ubuntu',
          '139/tcp  open  netbios-ssn  Samba smbd 4.x',
          '445/tcp  open  microsoft-ds Samba smbd 4.13.17',
          '3306/tcp open  mysql        MySQL 8.0.32',
          '',
          'Service detection performed. Nmap done: 1 host up.',
        ],
      },
      // Base TCP port scan — catches `nmap 10.0.0.5`, `nmap -sS 10.0.0.5`,
      // `nmap -p- 10.0.0.5`, etc., when no more specific matcher above hit.
      {
        match: /^nmap\s+[^\n]*10\.0\.0\.5\s*$/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          'Nmap scan report for 10.0.0.5',
          'Host is up (0.00042s latency).',
          'Not shown: 65531 closed tcp ports (reset)',
          '',
          'PORT     STATE SERVICE',
          '22/tcp   open  ssh',
          '139/tcp  open  netbios-ssn',
          '445/tcp  open  microsoft-ds',
          '3306/tcp open  mysql',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 12.87 seconds',
        ],
      },
      // Banner grab with netcat.
      {
        match: /^nc\s+-v\s+10\.0\.0\.5\s+22/i,
        output: [
          'Connection to 10.0.0.5 22 port [tcp/ssh] succeeded!',
          'SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5',
        ],
      },
      { match: /^whoami$/i, output: ['kali'] },
      { match: /^id$/i, output: ['uid=1000(kali) gid=1000(kali) groups=1000(kali)'] },
    ],
  },

  ceremony: {
    toolkit: ['nmap', 'arp-scan', 'masscan', 'netcat'],
    target: RANGE,
  },

  sections: [
    {
      id: 'what',
      title: 'What is active recon',
      blocks: [
        { h2: 'Active reconnaissance' },
        { p: 'Reconnaissance is the intelligence phase: learn the target before you touch it. **Passive** recon reads what is already public (WHOIS, certificate transparency, GitHub, cached pages) and leaves no trace on the target. **Active** recon sends packets and gets answers — faster, richer, and unmistakably audible on the wire.' },
        { p: 'Active recon is where the engagement starts making noise. Every packet you send is a decision: what to probe, how loudly, and whether it fits your authorization.' },
        { callout: 'Why pros do it: the map you build in the next hour decides the next week. Every misfired scan is either wasted stealth or a support ticket. Precision compounds.' },
        { p: `Scenario: you have written authorization to test the ${RANGE} range. Discover what is alive, map what those hosts run, and pick the best pivot for the enumeration room.` },
      ],
    },
    {
      id: 'authorization',
      title: 'The rules that keep this legal',
      blocks: [
        { h3: 'Scope, timing, contact' },
        { p: 'Every active scan is authorized by scope. Before you touch a range, three things must be true:' },
        {
          list: [
            '**Written scope**: the range, hosts, and services you are allowed to touch — and the ones you are not (production DBs, cloud IAM, third-party services).',
            '**Time window**: the hours during which scanning is permitted. Off-hours is polite; work-hours may be required to observe blue-team response.',
            '**Escalation contact**: a phone number that goes to a human, in case you crash something or trip a real detection during a rehearsed one.',
          ],
        },
        { callout: 'A scan without written authorization is a computer crime in most jurisdictions. There is no clever escape. When in doubt, do not send the packet.' },
      ],
    },
    {
      id: 'staircase',
      title: 'The recon staircase',
      blocks: [
        { h3: 'Discover → ports → services → OS → scripts' },
        { p: 'Active recon runs from cheapest / quietest to most invasive. Each step narrows the scope of the next, so you buy signal at the smallest cost.' },
        {
          list: [
            '**Host discovery** — who is alive in this range? (ping sweep, ARP scan)',
            '**Port scan** — which TCP/UDP ports on each host answer? (SYN, connect, UDP)',
            '**Service / version** — what software and version is on each open port?',
            '**OS fingerprint** — which operating system is that? (kernel family, distro)',
            '**Script / vuln scan** — known misconfigs and CVEs on those services (NSE)',
          ],
        },
        { p: 'You almost never do them all up front. Discovery is universal; the deeper steps get focused on the two or three hosts worth the noise.' },
      ],
    },
    {
      id: 'discovery',
      title: 'Host discovery',
      blocks: [
        { h3: 'Who is alive in the range' },
        { p: 'A `-sn` scan ("no port scan") sends discovery probes only — ICMP, TCP SYN to 443, TCP ACK to 80, ARP on the local segment — and prints hosts that answer any of them. It is the fastest way to shrink a /24 down to a target list.' },
        { task: `Run a host-discovery sweep across the ${RANGE} range with nmap.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap\s+-sn\s+10\.0\.0\.0\/24/i,
        hints: ['nmap has a "no port scan" flag that only does discovery.', `nmap -sn ${RANGE}`],
        reveal: `nmap -sn ${RANGE}`,
        explain: 'Four hosts respond: a Cisco gateway (10.0.0.1), two VMware Linux boxes (10.0.0.5, 10.0.0.7), and a Windows host (10.0.0.11). Everything else in the /24 is dark. Your target list just shrank from 256 to 3.',
      },
    },
    {
      id: 'howmany',
      title: 'Read the numbers',
      blocks: [
        { h3: 'Knowledge check' },
        { p: 'The map is only useful if you actually read it. Look at the discovery output you just pulled.' },
        { task: 'How many hosts are alive on the /24 (including the gateway)?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /\b4\b|four/i,
        hints: ['Count the "Nmap scan report for" lines.', 'The summary line at the bottom also has the count.'],
        reveal: '4',
        explain: '4 responders: the gateway plus three end hosts. From here you would ignore .1 (gateway is out of scope for most engagements) and focus your active scans on .5, .7, and .11.',
      },
    },
    {
      id: 'arp',
      title: 'ARP scan (LAN-only)',
      blocks: [
        { h3: 'When ICMP is filtered' },
        { p: 'On the local segment, ARP is not optional — a host must respond to an ARP request or it cannot be reached at all. `arp-scan` (or `nmap -PR`) sends ARP directly, which bypasses ICMP-blocking host firewalls and is one of the most reliable discovery methods you have.' },
        {
          list: [
            '**Works only on the same L2 segment** — routers do not forward ARP.',
            '**Yields MAC addresses** — the OUI (first three bytes) often names the hardware vendor: Cisco, VMware, Dell, HP, Microsoft.',
            '**Very fast** — a /24 sweep completes in seconds.',
          ],
        },
        { task: `Run arp-scan across the ${RANGE} range.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^arp-scan[\s\S]*10\.0\.0\.0\/24/i,
        hints: ['arp-scan needs an interface and a range.', `arp-scan --interface=eth0 ${RANGE}`, `arp-scan -I eth0 ${RANGE}`],
        reveal: `arp-scan --interface=eth0 ${RANGE}`,
        explain: 'Same four hosts, but now you also have MAC vendors: two VMware VMs and a Microsoft (Hyper-V) VM. That is a hint about the environment: this segment is virtualized, likely a lab or dev subnet.',
      },
    },
    {
      id: 'port-types',
      title: 'Port scan types',
      blocks: [
        { h3: 'SYN, connect, UDP' },
        { p: 'A port scan asks each port on a host whether it will talk. How you ask changes speed, stealth, and whether you even need root.' },
        {
          list: [
            '**`-sS` SYN scan** (default when root): send SYN, watch for SYN-ACK, never complete the three-way handshake. Fast and does not appear in most application logs. Requires raw sockets — root/sudo.',
            '**`-sT` TCP connect** (default without root): full three-way handshake via the OS socket API. Slower and shows up in application logs, but works from any account.',
            '**`-sU` UDP scan**: send a UDP probe; port is open if a valid response comes back, closed if ICMP unreachable, `open|filtered` if nothing does. Slow. Required for DNS (53), SNMP (161), NTP (123), NetBIOS (137).',
            '**`-sA` ACK scan**: does not find open ports; classifies **filtered vs unfiltered** — i.e., discovers a stateful firewall.',
            '**`-sN` / `-sF` / `-sX`** (null / FIN / Xmas): odd flag combinations that some firewalls handle inconsistently — sometimes slip past filters that only inspect SYNs.',
          ],
        },
        { code: 'nmap -sS -p- --min-rate 1000 10.0.0.5   # full 65k SYN scan, fast' },
      ],
    },
    {
      id: 'port-scan',
      title: 'Port-scan the target',
      blocks: [
        { h3: 'What is open on 10.0.0.5' },
        { p: 'The gateway is out of scope. Of the three end hosts, 10.0.0.5 is the closest — pick it first and enumerate its open TCP ports. Default nmap scans the top 1000 ports; `-p-` scans all 65,535.' },
        { task: `Run a TCP port scan against ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap(?![\s\S]*(?:-sV|-sU|-O|--script|-sC|-sn|-A))[\s\S]*10\.0\.0\.5/i,
        hints: [
          'The plainest form scans the top 1000 TCP ports.',
          `nmap ${HOST}`,
          `nmap -sS -p- ${HOST}   # full sweep, all 65,535 ports`,
        ],
        reveal: `nmap -sS -p- ${HOST}`,
        explain: 'Four open ports: 22 ssh, 139 + 445 SMB, 3306 MySQL. You now know the shape of the host without yet knowing which software versions.',
      },
    },
    {
      id: 'service-scan',
      title: 'Fingerprint the services',
      blocks: [
        { h3: 'Get names and versions' },
        { p: 'An open port is a name; a **version** is a lead. `-sV` sends probes tailored to each protocol and reads the banner: "OpenSSH 8.2p1 Ubuntu", "Samba smbd 4.13.17". Version numbers unlock CVE lookups, default-credential lists, and protocol-quirk tricks.' },
        {
          list: [
            '`--version-intensity 0` to `9` — trade thoroughness for speed (default 7).',
            '`--version-light` — quick guess (intensity 2), useful for large sweeps.',
            '`--version-all` — pull out every probe, for stubborn services.',
          ],
        },
        { task: `Run a service/version scan against ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap[\s\S]*-sV\b[\s\S]*10\.0\.0\.5/i,
        hints: ['nmap has a flag that probes service/version info.', `nmap -sV ${HOST}`],
        reveal: `nmap -sV ${HOST}`,
        explain: 'Ubuntu OpenSSH 8.2p1, Samba 4.13.17, MySQL 8.0.32. Samba 4.13 is old enough that CVE lookups will pay off — remember that for the NSE step.',
      },
    },
    {
      id: 'os-fingerprint',
      title: 'OS fingerprint',
      blocks: [
        { h3: 'What is the host running' },
        { p: '`-O` probes TCP/IP stack quirks — window sizes, TCP options ordering, TTL — to guess the operating system family and kernel band. It is a probability score, not a certainty, but it is right often enough to plan around.' },
        { p: 'Knowing the OS narrows every later choice: shell syntax, service defaults, privilege escalation vectors, expected logging.' },
        { task: `Fingerprint the operating system of ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap[\s\S]*-O\b[\s\S]*10\.0\.0\.5/i,
        hints: ['OS detection is a single flag on nmap.', `nmap -O ${HOST}`, 'Needs root for the raw-packet probes.'],
        reveal: `nmap -O ${HOST}`,
        explain: 'Linux kernel 5.4–5.15 — Ubuntu 20.04 LTS territory. That matches the OpenSSH banner (`Ubuntu-4ubuntu0.5`). Two independent probes agree; treat it as confirmed.',
      },
    },
    {
      id: 'target-pick',
      title: 'Pick the pivot',
      blocks: [
        { h3: 'Turn inventory into a target' },
        { p: 'You now know: three in-scope hosts, and specifically that 10.0.0.5 runs Samba plus SSH plus MySQL on an Ubuntu 20.04 box. That combination — writable SMB + service account potential + weak-signing likelihood — is the classic pivot into a shell.' },
        { task: 'Which single host will you hand off to the Enumeration room?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /10\.0\.0\.5/,
        hints: ['It is the Linux host with SMB and SSH exposed.', 'The Enumeration room begins with this same host.'],
        reveal: '10.0.0.5',
        explain: 'Right. The rest of this room adds advanced tradecraft; the actual enumeration of 10.0.0.5 is the next room. Recon earned you a plan, not a shell — yet.',
      },
    },
    {
      id: 'nse',
      title: 'NSE scripts',
      blocks: [
        { h3: 'Automated checks on top of the scan' },
        { p: 'Nmap ships with a scripting engine (**NSE**) and roughly 600 built-in scripts. Each is a small Lua program that runs against a host or a specific port and does a targeted check: known vulns, protocol enumeration, default credential probes, banner extraction.' },
        {
          list: [
            '**`-sC`** — run the **default** script set. Safe, informative, always worth doing.',
            '**`--script vuln`** — run every script in the `vuln` category (CVE checks, misconfig checks).',
            '**`--script "smb-*"`** — glob match by name. Great for a targeted deep-dive.',
            '**`--script "not intrusive"`** — set-theoretic filter by category tag.',
            '**Script arguments**: `--script-args user=admin,pass=admin`.',
          ],
        },
        { p: 'Every script has documentation in `/usr/share/nmap/scripts/*.nse`. Reading a script before running it is how you find out whether it is truly passive.' },
        { task: `Run NSE vulnerability scripts against ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap[\s\S]*(--script|-sC)[\s\S]*10\.0\.0\.5/i,
        hints: [
          '--script takes a category, a name, or a glob.',
          `nmap --script vuln ${HOST}`,
          `nmap -sC ${HOST}   # just the default (safe) scripts`,
        ],
        reveal: `nmap --script vuln ${HOST}`,
        explain: 'SambaCry (CVE-2017-7494) is flagged LIKELY VULNERABLE, and SMB signing is enabled but not required. Those two findings together are the actual pivot: writable share + no signing = the classic SMB relay / RCE chain.',
      },
    },
    {
      id: 'udp',
      title: 'UDP scan',
      blocks: [
        { h3: 'The other half of the port space' },
        { p: 'TCP is where most services live, but the highest-value **misconfigured** services often live on UDP: SNMP (161) with default community strings, TFTP (69) leaking config files, NTP (123), DNS (53) hosting zone transfers, NetBIOS name service (137). Skipping UDP means missing them.' },
        {
          list: [
            'UDP is slow: no per-packet response guarantee, so nmap retransmits and waits.',
            '`--top-ports 20` cuts scan time from hours to minutes by only probing the most common UDP services.',
            '`open|filtered` means nmap could not tell — treat it as "possibly open" for anything you care about.',
          ],
        },
        { task: `Run a UDP scan of the top 20 UDP ports on ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap[\s\S]*-sU[\s\S]*10\.0\.0\.5/i,
        hints: [
          '-sU is a UDP scan; combine it with --top-ports for a fast pass.',
          `nmap -sU --top-ports 20 ${HOST}`,
        ],
        reveal: `nmap -sU --top-ports 20 ${HOST}`,
        explain: 'SNMP is `open|filtered` — worth an `snmpwalk -v2c -c public` follow-up with common community strings. NetBIOS name service on 137 confirms this host will answer name-based SMB requests.',
      },
    },
    {
      id: 'stealth',
      title: 'Stealth and evasion',
      blocks: [
        { h3: 'Turn down the volume' },
        { p: 'IDS/IPS look for aggressive scans: high packet rate, single source, sequential ports. You can dodge many signatures by combining three levers — timing, decoys, and packet shape.' },
        {
          list: [
            '**Timing (`-T0` … `-T5`)** — `-T0` (paranoid) waits ~5 minutes between probes; `-T2` (polite) is a good starting point for stealth; `-T4` (aggressive) is default for red teams that do not care.',
            '**Decoys (`-D RND:10`)** — send probes forged with 10 random source IPs alongside your own, so the true source is one line in a long log.',
            '**Source port (`--source-port 53`)** — pretend to be DNS. Firewalls with lazy rules ("allow all from source port 53") let it through.',
            '**Fragmentation (`-f`, `--mtu 24`)** — split each probe across several IP fragments; naive inspectors miss the reassembled port.',
            '**Data length (`--data-length 25`)** — pad probes so they do not match empty-payload signatures.',
            '**Randomize hosts (`--randomize-hosts`)** — do not scan a range in order.',
          ],
        },
        { callout: 'None of these are magic. A properly tuned IDS will still catch you; they raise the analyst\'s workload, not the ceiling. Stealth is a budget, not a cloak.' },
        { task: `Combine SYN scanning, slow timing, and decoys on ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap(?=[\s\S]*-sS)(?=[\s\S]*-T[0-3])(?=[\s\S]*-D)/i,
        hints: [
          'You need three flags: SYN scan, a slow timing template, and a decoy list.',
          `nmap -sS -T2 -D RND:5 ${HOST}`,
          `nmap -sS -T2 -D RND:10 --source-port 53 ${HOST}`,
        ],
        reveal: `nmap -sS -T2 -D RND:10 --source-port 53 ${HOST}`,
        explain: 'Same open ports, but 200+ seconds instead of 12 and buried among 10 forged sources. Not invisible — but a lot harder to attribute at a glance.',
      },
    },
    {
      id: 'advanced',
      title: 'Advanced techniques (reference)',
      blocks: [
        { h3: 'The rest of the toolkit' },
        { p: '**Output formats (`-oA basename`)** — writes normal, XML, and grepable output at once. XML feeds into every downstream tool (Metasploit `db_import`, Faraday, Dradis); grepable is the friend of `awk`.' },
        { code: 'nmap -sS -sV -oA scans/10.0.0.5 10.0.0.5' },
        { p: '**Faster scanners** — `masscan` and `rustscan` sweep tens of thousands of hosts per second by using their own TCP stack. Use them to *discover* ports, then feed the open ones back to nmap for versioning.' },
        { code: `masscan ${RANGE} -p1-65535 --rate=10000 -oJ discovered.json` },
        { p: '**Banner grabbing** — sometimes the fastest fingerprint is one hand-crafted connection.' },
        { code: `nc -v ${HOST} 22          # SSH banner\ncurl -sI http://${HOST}   # HTTP Server: header` },
        { p: '**DNS recon** — active DNS is part of active recon: reverse lookups on the whole range, brute-forced subdomains, zone transfers where allowed.' },
        {
          list: [
            '`dig @<ns> AXFR example.local` — attempt a zone transfer (usually denied, occasionally jackpot).',
            '`dnsx`, `amass`, `subfinder` — subdomain enumeration at scale.',
            '`nmap --script dns-brute example.local` — the same, via NSE.',
          ],
        },
        { p: '**SNMP** — if UDP 161 answers with `public` or `private`, `snmpwalk -v2c -c public <host>` will dump the entire management tree: interface list, running processes, sometimes usernames.' },
        { p: '**TLS/SSL** — a running HTTPS service leaks: protocol versions, cipher suites, cert SANs (often unlisted internal hostnames), issuer.' },
        { code: `nmap --script ssl-enum-ciphers -p 443 ${HOST}` },
        { p: '**IPv6** — `nmap -6` on the target\'s IPv6 address; discovery uses ICMPv6 rather than ARP. Many hosts have looser filters on v6 than v4.' },
        { p: '**Passive to active handoff** — every domain, IP, and cert you found via crt.sh, Shodan, or Censys becomes an input to this staircase. Passive gives you what to point at; active tells you what is actually there right now.' },
        { callout: 'The command matters less than the reason for the command. Every packet answers a question; know the question before you send it.' },
      ],
    },
    {
      id: 'handoff',
      title: 'Hand off to enumeration',
      blocks: [
        { h3: 'Your report' },
        { p: 'A good recon report is one page and reads in 30 seconds: **what is alive, what is running, what is the plan.**' },
        {
          list: [
            `**Scope**: ${RANGE} (authorized).`,
            '**Live hosts**: 10.0.0.1 (gateway, out of scope), 10.0.0.5, 10.0.0.7, 10.0.0.11.',
            '**10.0.0.5** — Ubuntu 20.04, OpenSSH 8.2p1, Samba 4.13.17 (SambaCry likely), MySQL 8.0.32, SMB signing not required. **Highest-value pivot.**',
            '**Next step**: enumerate SMB shares and RID-cycle for users on 10.0.0.5.',
          ],
        },
        { p: 'That is the exact input the Enumeration room takes. Type `exit` when you are ready to hand it off.' },
      ],
    },
  ],
};

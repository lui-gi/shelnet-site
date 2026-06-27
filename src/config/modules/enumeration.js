// src/config/modules/enumeration.js
// The reference `shell`-stage room. Teaches enumeration from the ground up, then
// guides the learner through scanning, share enumeration, user enumeration, and
// planning a pivot, all against a hand-authored simulated host (no real network).
// Lazily imported by moduleRegistry; consumed by components/room/Room.jsx. The
// `expect` regexes are whitespace/case tolerant and align with the shell stage's
// own command table so the recognized command both prints output and advances.

const HOST = '10.0.0.5';

export default {
  // Stage data: the faux terminal's recognized commands and their canned output.
  stageConfig: {
    host: HOST,
    prompt: 'root@kali',
    cwd: '~',
    motd: [
      `lab target provisioned: ${HOST}`,
      'toolkit ready: nmap, smbclient, enum4linux',
      "type a command below; try the task on the left, or `clear`.",
      '',
    ],
    commands: [
      {
        match: /^nmap\s+-sv\s+\/*10\.0\.0\.5/i,
        output: [
          'Starting Nmap 7.94 ( https://nmap.org )',
          `Nmap scan report for ${HOST}`,
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
      {
        match: /^smbclient\s+-l\s+\/*10\.0\.0\.5/i,
        output: [
          'Anonymous login successful',
          '',
          '        Sharename       Type      Comment',
          '        ---------       ----      -------',
          '        print$          Disk      Printer Drivers',
          '        backups         Disk      Nightly backups (world-writable)',
          '        shared          Disk      Department share',
          '        IPC$            IPC       IPC Service (Samba 4.13.17)',
        ],
      },
      {
        match: /^enum4linux\s+(-u\s+)?\/*10\.0\.0\.5/i,
        output: [
          '[+] Enumerating users via RID cycling',
          '[+] Found 3 users:',
          '    1001  jsmith',
          '    1002  awilliams',
          '    1003  svc_backup',
        ],
      },
      { match: /^whoami$/i, output: ['root'] },
      { match: /^id$/i, output: ['uid=0(root) gid=0(root) groups=0(root)'] },
    ],
  },

  // The "load" ceremony lines for this room.
  ceremony: {
    toolkit: ['nmap', 'smbclient', 'enum4linux'],
    target: HOST,
  },

  sections: [
    {
      id: 'what',
      title: 'What is enumeration',
      blocks: [
        { h2: 'What is enumeration' },
        { p: 'Enumeration is the act of actively cataloguing a target: its open ports, the service and version behind each one, the users, the shares, anything that names a piece of attack surface.' },
        { p: 'It is the step right after discovery. You know the host exists; now you build a precise inventory of what it runs so every later move is informed rather than a guess.' },
        { callout: 'Why pros do it: every service, version, and account is either a way in or a constraint. The team with the better inventory wins; enumeration is how you build it.' },
        { p: 'This room runs against a single lab host, `10.0.0.5`. Work the tasks on the left in the lab stage on the right.' },
      ],
    },
    {
      id: 'scan',
      title: 'Your first scan',
      blocks: [
        { h3: 'Fingerprint the services' },
        { p: 'A bare port scan tells you what is open; a version scan (`-sV`) tells you what is *listening*. Versions drive everything that follows: known CVEs, default creds, protocol quirks.' },
        { task: 'Run a version scan against the target with nmap.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /nmap\s+-sv\s+\/*10\.0\.0\.5/i,
        hints: ['nmap has a flag that probes service/version info.', 'nmap -sV <host>'],
        reveal: `nmap -sV ${HOST}`,
        explain: 'Four services, including Samba on 445 and MySQL on 3306. SMB is almost always the richest enumeration surface; start there.',
      },
    },
    {
      id: 'smb',
      title: 'Enumerate SMB shares',
      blocks: [
        { h3: 'List what SMB exposes' },
        { p: 'SMB (ports 139/445) often allows an anonymous, or "null", session that is enough to list shares. A readable share leaks data; a writable one can be a foothold.' },
        { task: 'List the shares exposed on the host with smbclient (a null session needs no password).' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /smbclient\s+-l\s+\/*10\.0\.0\.5/i,
        hints: ['smbclient can list shares with -L.', 'A null session uses -N (no password).', `smbclient -L ${HOST} -N`],
        reveal: `smbclient -L ${HOST} -N`,
        explain: 'Three disk shares plus IPC$. `backups` is world-writable: note it, that is your most promising lever.',
      },
    },
    {
      id: 'count',
      title: 'Read the output',
      blocks: [
        { h3: 'Knowledge check' },
        { p: 'Enumeration is only useful if you actually read what comes back. Look at the share listing you just pulled.' },
        { task: 'Ignoring IPC$, how many disk shares are exposed?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /\b3\b|three/i,
        hints: ['Count the rows of Type "Disk".', 'print$, backups, shared.'],
        reveal: '3',
        explain: 'Right: print$, backups, and shared. IPC$ is an inter-process channel, not a file share, so it does not count here.',
      },
    },
    {
      id: 'users',
      title: 'Enumerate users',
      blocks: [
        { h3: 'Names are attack surface' },
        { p: 'Valid usernames turn a password attack from guesswork into a targeted one. Samba will often hand them over via RID cycling, which enum4linux automates.' },
        { task: 'Enumerate the user accounts on the target with enum4linux.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /enum4linux\s+(-u\s+)?\/*10\.0\.0\.5/i,
        hints: ['enum4linux wraps the Samba tools for you.', `enum4linux -U ${HOST}`],
        reveal: `enum4linux -U ${HOST}`,
        explain: 'Three users; `svc_backup` stands out. A service account named for the writable `backups` share is rarely a coincidence.',
      },
    },
    {
      id: 'pivot',
      title: 'Plan the pivot',
      blocks: [
        { h3: 'Turn inventory into a plan' },
        { p: 'You now have services, shares, and users. Good enumeration ends with a hypothesis: the single most promising next move, justified by what you found.' },
        { p: 'You saw a writable share and a service account whose name matches it.' },
        { task: 'Which share name is the writable foothold worth targeting next?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /backups?/i,
        hints: ['It was flagged world-writable in the share listing.', 'It shares a name with the svc_ account.'],
        reveal: 'backups',
        explain: 'Exactly. Writable `backups` plus the `svc_backup` account is a classic chain: drop a payload where a backup job or that account will execute it. That is the pivot enumeration earned you.',
      },
    },
  ],
};

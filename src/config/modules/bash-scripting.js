// src/config/modules/bash-scripting.js
// The `shell`-stage room for Bash Scripting. Six sections take the learner from
// simple loops through argument handling and script hardening to a full
// enumeration script. All commands run against a hand-authored simulated host;
// nothing is executed. Lazily imported by moduleRegistry.

const TARGET = '10.0.0.5';

export default {
  stageConfig: {
    host: TARGET,
    prompt: 'root@kali',
    cwd: '~',
    motd: [
      `lab shell ready: ${TARGET}`,
      'toolkit: bash, nmap, awk, grep',
      'type the command shown on the left; try variations that make sense.',
      '',
    ],
    commands: [
      // Section 1: for-loop host sweep
      {
        match: /^for\s+\w+\s+in\s+\$\(seq\s+1\s+10\)\s*;\s*do\s+ping\s+-c\s*1\s+10\.0\.0\.\$\w+/i,
        output: [
          '10.0.0.1 is alive',
          '10.0.0.3 is alive',
          '10.0.0.5 is alive',
          '(7 hosts unreachable)',
        ],
      },
      // Section 2: awk over /etc/passwd
      {
        match: /^awk\s+-F:\s+'\$3\s*>=\s*1000\s*\{\s*print\s+\$1\s*\}'\s+\/etc\/passwd/i,
        output: ['jsmith', 'awilliams', 'svc_backup'],
      },
      // Section 3: nmap piped to awk
      {
        match: /^nmap\s+-oG\s+-\s+10\.0\.0\.\d+(\/\d+)?\s*\|\s*awk\b/i,
        output: [
          '10.0.0.1  22/open/tcp',
          '10.0.0.3  22/open/tcp 80/open/tcp',
          '10.0.0.5  22/open/tcp 445/open/tcp 3306/open/tcp',
        ],
      },
      // Section 4: script invocation with a positional arg
      {
        match: /^\.\/enum\.sh\s+10\.0\.0\.5\s*$/i,
        output: ['argument received: 10.0.0.5', 'starting enumeration...'],
      },
      // Section 5: inspect a hardened script header
      {
        match: /^(head\s+-\s*2\s+enum\.sh|sed\s+-n\s+'1,2p'\s+enum\.sh|cat\s+enum\.sh\s*\|\s*head\s+-\s*2)/i,
        output: [
          '#!/usr/bin/env bash',
          "set -euo pipefail",
        ],
      },
      // Section 6: full run
      {
        match: /^\.\/enum\.sh\s+10\.0\.0\.0\/29\s*$/i,
        output: [
          '[+] scanning 10.0.0.0/29 (6 hosts)',
          '[+] 10.0.0.1 up   :: 22/ssh',
          '[+] 10.0.0.3 up   :: 22/ssh 80/http',
          '[+] 10.0.0.5 up   :: 22/ssh 445/smb 3306/mysql',
          '[+] done in 3.4s',
        ],
      },
      // Handy always-safe commands.
      { match: /^whoami$/i, output: ['root'] },
      { match: /^pwd$/i,    output: ['/root'] },
    ],
  },

  ceremony: {
    toolkit: ['bash', 'nmap', 'awk', 'grep'],
    target: 'lab shell',
  },

  sections: [
    {
      id: 'loops',
      title: 'Loops for host enumeration',
      blocks: [
        { h2: 'Loops for host enumeration' },
        { p: 'A shell loop turns one command into a sweep. Bash for-loops iterate over a list produced by any command in `$(...)`; `seq 1 10` emits 1..10 line-by-line, which the loop binds to a variable.' },
        { code: 'for i in $(seq 1 10); do\n  ping -c1 10.0.0.$i\ndone' },
        { p: 'Try it against the lab subnet.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^for\s+\w+\s+in\s+\$\(seq\s+1\s+10\)\s*;\s*do\s+ping\s+-c\s*1\s+10\.0\.0\.\$\w+/i,
        hints: [
          'the for loop iterates over a list from seq.',
          'use $(seq 1 10) to generate 1..10.',
          'ping -c1 sends exactly one packet per host.',
        ],
        reveal: 'for i in $(seq 1 10); do ping -c1 10.0.0.$i; done',
        explain: 'seq 1 10 produces the loop values; ping -c1 keeps the probe fast.',
      },
    },
    {
      id: 'awk-passwd',
      title: 'Parsing /etc/passwd',
      blocks: [
        { h2: 'Parsing /etc/passwd' },
        { p: '`awk` splits each line on `:` (via `-F:`) into positional fields. Field 1 is the username; field 3 is the UID. On Linux, non-system users start at UID 1000.' },
        { code: "awk -F: '$3 >= 1000 {print $1}' /etc/passwd" },
        { p: 'List every human user on the box.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^awk\s+-F:\s+'\$3\s*>=\s*1000\s*\{\s*print\s+\$1\s*\}'\s+\/etc\/passwd/i,
        hints: [
          '-F: tells awk to split on colons.',
          '$3 is the UID field, $1 is the username field.',
          "the action goes in braces: '{print $1}'.",
        ],
        reveal: "awk -F: '$3 >= 1000 {print $1}' /etc/passwd",
        explain: 'Filter (condition) then action (print field 1) is the awk idiom.',
      },
    },
    {
      id: 'nmap-parse',
      title: 'Automating nmap output',
      blocks: [
        { h2: 'Automating nmap output' },
        { p: 'nmap grepable output (`-oG -`) writes one host per line, with open ports at the end. Pipe it into awk to get just the interesting rows.' },
        { code: 'nmap -oG - 10.0.0.0/29 | awk \'/open/ {print $2, $NF}\'' },
        { p: 'Try it. Match either the exact invocation or any nmap `-oG - <target>` piped into `awk`.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^nmap\s+-oG\s+-\s+10\.0\.0\.\d+(\/\d+)?\s*\|\s*awk\b/i,
        hints: [
          '-oG - writes grepable output to stdout.',
          'pipe into awk to filter and print fields.',
          '$2 is the host, $NF is the last field.',
        ],
        reveal: "nmap -oG - 10.0.0.0/29 | awk '/open/ {print $2, $NF}'",
        explain: 'Grepable output is machine-parseable; awk turns it into a table.',
      },
    },
    {
      id: 'args',
      title: 'Argument handling & quoting',
      blocks: [
        { h2: 'Argument handling & quoting' },
        { p: 'Positional args land in `$1`, `$2`, ... `$#` counts them. Always quote: `"$1"` handles targets with spaces; bare `$1` breaks on them.' },
        { code: '#!/usr/bin/env bash\ntarget="$1"\necho "argument received: $target"\necho "starting enumeration..."' },
        { p: 'Save the snippet above as `enum.sh` and run it against the lab target.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^\.\/enum\.sh\s+10\.0\.0\.5\s*$/i,
        hints: [
          'call the script with a positional argument.',
          'the script is at ./enum.sh in the current directory.',
          'pass the lab target 10.0.0.5.',
        ],
        reveal: './enum.sh 10.0.0.5',
        explain: 'A quoted "$1" is the difference between a robust script and a broken one.',
      },
    },
    {
      id: 'harden',
      title: 'Script hardening',
      blocks: [
        { h2: 'Script hardening' },
        { p: '`set -euo pipefail` fails the script fast: `-e` on any error, `-u` on unset variables, `-o pipefail` on any pipe stage failure. Put it right after the shebang.' },
        { code: '#!/usr/bin/env bash\nset -euo pipefail' },
        { p: 'Inspect the first two lines of `enum.sh` to confirm the safety header is in place.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^(head\s+-\s*2\s+enum\.sh|sed\s+-n\s+'1,2p'\s+enum\.sh|cat\s+enum\.sh\s*\|\s*head\s+-\s*2)/i,
        hints: [
          'you only need the first two lines.',
          'head, sed, or cat piped into head all work.',
          'try `head -2 enum.sh`.',
        ],
        reveal: 'head -2 enum.sh',
        explain: 'A hardening pragma is worthless if you never verify it landed.',
      },
    },
    {
      id: 'together',
      title: 'Putting it together',
      blocks: [
        { h2: 'Putting it together' },
        { p: "Run the full script against a small subnet. It should sweep, parse, and summarise; that's the payoff for the sections above." },
        { code: './enum.sh 10.0.0.0/29' },
        { p: 'Ship it.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^\.\/enum\.sh\s+10\.0\.0\.0\/29\s*$/i,
        hints: [
          'invoke the script with a /29 CIDR.',
          'the target is 10.0.0.0/29.',
        ],
        reveal: './enum.sh 10.0.0.0/29',
        explain: 'The end state: one command, one clean summary.',
      },
    },
  ],
};

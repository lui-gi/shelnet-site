// src/config/modules/log-analysis.js
// The `shell`-stage room for Log Analysis & Threat Intel. Twelve sections take
// the learner through raw log reading, filtering, field extraction, aggregation,
// ranking, success-checking, IOC matching, enrichment, and a final compromise
// verdict — the same jsmith brute-force scenario as splunk-queries.js, but
// worked with plain shell tools. All commands run against a hand-authored fake
// filesystem; nothing is executed. Lazily imported by moduleRegistry.

const HOST = 'web-01';

// Fake /var/log/auth.log lines. Timestamps hit 14:02–14:06; jsmith gets three
// visible failure lines plus a note, awilliams gets a normal success, root gets
// one stray failure. The stage returns the same slice for `less`, `cat`, and
// `tail -n <N>` reads.
const AUTH_LOG = [
  'Jul  3 14:02:11 web-01 sshd[4211]: Failed password for jsmith from 10.0.0.9 port 55432 ssh2',
  'Jul  3 14:02:37 web-01 sshd[4213]: Accepted password for awilliams from 10.0.0.4 port 42118 ssh2',
  'Jul  3 14:03:04 web-01 sshd[4218]: Failed password for jsmith from 10.0.0.9 port 55440 ssh2',
  'Jul  3 14:04:22 web-01 sshd[4229]: Failed password for root from 10.0.0.9 port 55510 ssh2',
  'Jul  3 14:05:08 web-01 sshd[4235]: Failed password for jsmith from 10.0.0.9 port 55552 ssh2',
  'Jul  3 14:06:01 web-01 sshd[4241]: Accepted password for jsmith from 10.0.0.9 port 55603 ssh2',
  '(showing 6 of 51 matching lines)',
];

const IOCS_TXT = [
  '# known-bad source IPs, updated 2026-07-03',
  '10.0.0.9',
  '198.51.100.7',
  '203.0.113.42',
];

const KNOWN_BAD_CSV = [
  'src_ip,tag,first_seen',
  '10.0.0.9,ssh-brute-forcer,2026-06-14',
  '198.51.100.7,cred-stuffer,2026-05-22',
  '203.0.113.42,scanner,2026-04-30',
];

export default {
  stageConfig: {
    host: HOST,
    prompt: 'analyst@soc',
    cwd: '~',
    motd: [
      `analyst shell ready: ${HOST} incident triage`,
      'toolkit: less, tail, grep, awk, cut, sort, uniq, join',
      'files staged: /var/log/auth.log, /etc/iocs.txt, /etc/known_bad.csv',
      '',
    ],
    commands: [
      // Section 2: read the raw auth.log — accept less/cat/tail -n <N>.
      {
        match: /^(less|cat|tail(\s+-n\s*\d+)?)\s+\/var\/log\/auth\.log\s*$/i,
        output: AUTH_LOG,
      },
      // Section 3: grep failed password lines.
      {
        match: /^grep(\s+-[iEv]+)*\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log\s*$/i,
        output: [
          'Jul  3 14:02:11 web-01 sshd[4211]: Failed password for jsmith from 10.0.0.9 port 55432 ssh2',
          'Jul  3 14:03:04 web-01 sshd[4218]: Failed password for jsmith from 10.0.0.9 port 55440 ssh2',
          'Jul  3 14:04:22 web-01 sshd[4229]: Failed password for root from 10.0.0.9 port 55510 ssh2',
          'Jul  3 14:05:08 web-01 sshd[4235]: Failed password for jsmith from 10.0.0.9 port 55552 ssh2',
          '(showing 4 of 51 matching lines)',
        ],
      },
      // Section 4: narrow to the 14:02–14:05 window via awk on $3 (using
      // < "14:06" so 14:05:08 is included — string comparison with a
      // longer LHS sorts higher, so "$3 <= 14:05" would drop it).
      {
        match: /^awk\s+'\$3\s*>=\s*"14:02"\s*&&\s*\$3\s*<\s*"14:06"'\s+\/var\/log\/auth\.log\s*$/i,
        output: [
          'Jul  3 14:02:11 web-01 sshd[4211]: Failed password for jsmith from 10.0.0.9 port 55432 ssh2',
          'Jul  3 14:02:37 web-01 sshd[4213]: Accepted password for awilliams from 10.0.0.4 port 42118 ssh2',
          'Jul  3 14:03:04 web-01 sshd[4218]: Failed password for jsmith from 10.0.0.9 port 55440 ssh2',
          'Jul  3 14:04:22 web-01 sshd[4229]: Failed password for root from 10.0.0.9 port 55510 ssh2',
          'Jul  3 14:05:08 web-01 sshd[4235]: Failed password for jsmith from 10.0.0.9 port 55552 ssh2',
        ],
      },
      // Section 5: extract user (field 9) and src_ip (field 11) for failed
      // jsmith events; accept the grep-then-awk pipeline.
      {
        match: /^grep\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log\s*\|\s*grep\s+jsmith\s*\|\s*awk\s+'\{\s*print\s+\$9\s*,\s*\$11\s*\}'\s*$/i,
        output: [
          'jsmith 10.0.0.9',
          'jsmith 10.0.0.9',
          'jsmith 10.0.0.9',
        ],
      },
      // Section 6: count failures per user via sort | uniq -c.
      {
        match: /^grep\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log\s*\|\s*awk\s+'\{\s*print\s+\$9\s*\}'\s*\|\s*sort\s*\|\s*uniq\s+-c\s*$/i,
        output: [
          '     47 jsmith',
          '      3 admin',
          '      1 root',
        ],
      },
      // Section 8: rank the top source IPs — grep | awk | sort | uniq -c |
      // sort -rn | head -N. Accept head with or without -n.
      {
        match: /^grep\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log\s*\|\s*awk\s+'\{\s*print\s+\$11\s*\}'\s*\|\s*sort\s*\|\s*uniq\s+-c\s*\|\s*sort\s+-rn\s*\|\s*head(\s+-n?\s*3)?\s*$/i,
        output: [
          '     47 10.0.0.9',
          '      3 10.0.0.14',
          '      1 10.0.0.22',
        ],
      },
      // Section 9: did jsmith ever succeed?
      {
        match: /^grep\s+['"]?Accepted password['"]?\s+\/var\/log\/auth\.log\s*\|\s*grep\s+jsmith\s*$/i,
        output: [
          'Jul  3 14:06:01 web-01 sshd[4241]: Accepted password for jsmith from 10.0.0.9 port 55603 ssh2',
        ],
      },
      // Section 10: match log src_ips against /etc/iocs.txt.
      {
        match: /^grep\s+-f\s+\/etc\/iocs\.txt\s+\/var\/log\/auth\.log\s*$/i,
        output: [
          'Jul  3 14:02:11 web-01 sshd[4211]: Failed password for jsmith from 10.0.0.9 port 55432 ssh2',
          'Jul  3 14:03:04 web-01 sshd[4218]: Failed password for jsmith from 10.0.0.9 port 55440 ssh2',
          'Jul  3 14:04:22 web-01 sshd[4229]: Failed password for root from 10.0.0.9 port 55510 ssh2',
          'Jul  3 14:05:08 web-01 sshd[4235]: Failed password for jsmith from 10.0.0.9 port 55552 ssh2',
          'Jul  3 14:06:01 web-01 sshd[4241]: Accepted password for jsmith from 10.0.0.9 port 55603 ssh2',
        ],
      },
      // Section 11: enrich unique offender src_ips with a tag via join.
      {
        match: /^join\s+-t,?\s*-1\s*1\s+-2\s*1\s+<\(.*sort.*\)\s+<\(sort\s+\/etc\/known_bad\.csv\)\s*$/i,
        output: [
          '10.0.0.9,ssh-brute-forcer,2026-06-14',
        ],
      },
      // File reads — support both `cat` and `less` on the two lookup files.
      { match: /^(cat|less)\s+\/etc\/iocs\.txt\s*$/i, output: IOCS_TXT },
      { match: /^(cat|less)\s+\/etc\/known_bad\.csv\s*$/i, output: KNOWN_BAD_CSV },

      // Handy always-safe commands.
      { match: /^whoami$/i, output: ['analyst'] },
      { match: /^pwd$/i,    output: ['/home/analyst'] },
      { match: /^ls\s*$/i,  output: ['(nothing in the home dir; work off /var/log and /etc)'] },
    ],
  },

  ceremony: {
    toolkit: ['grep', 'awk', 'sort', 'uniq'],
    target: HOST,
  },

  sections: [
    {
      id: 'where',
      title: 'Where logs live',
      blocks: [
        { h2: 'Triaging from raw log files' },
        { p: 'On Linux, most services drop their events under `/var/log/`. Authentication events (SSH, sudo, PAM) land in `/var/log/auth.log` on Debian-family systems and in `/var/log/secure` on RHEL-family ones; general system events go to `/var/log/syslog`. Modern systemd hosts also expose a structured journal via `journalctl -u <unit>`, but the shell tools in this room work on any flat file, journal or not.' },
        { callout: 'Why pros do it: every SIEM eventually breaks, gets throttled, or drops a field. Raw log fluency is what lets you triage anyway. If you can grep the file, you can answer the question.' },
        { p: 'Scenario: same alert as the Splunk room. Host `web-01`, one auth log, and a suspicious jsmith failure spike. You will work it with shell tools this time, and the answer will fall out the same shape.' },
      ],
    },
    {
      id: 'read',
      title: 'Read the raw',
      blocks: [
        { h3: 'less, cat, tail' },
        { p: 'Before you filter, look. `less` paginates a file and lets you `/search` inside it (press `n` for next match). `cat` dumps the whole thing to stdout for piping. `tail -f` follows a file live as new lines arrive; `tail -n 100` shows just the last 100 lines.' },
        {
          list: [
            '`less /var/log/auth.log`: page through, `/Failed` to search, `q` to quit.',
            '`tail -n 50 /var/log/auth.log`: last 50 lines, one-shot.',
            '`tail -f /var/log/auth.log`: follow new lines as they land (Ctrl-C to stop).',
          ],
        },
        { task: 'Open the auth log.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^(less|cat|tail(\s+-n\s*\d+)?)\s+\/var\/log\/auth\.log\s*$/i,
        hints: [
          'the file is /var/log/auth.log.',
          'any of less, cat, or tail -n <N> is fine to start.',
          'try `less /var/log/auth.log`.',
        ],
        reveal: 'less /var/log/auth.log',
        explain: 'Six lines spanning 14:02–14:06: several Failed passwords for jsmith and root from 10.0.0.9, plus one Accepted password for jsmith at the tail. That is the shape you will keep narrowing.',
      },
    },
    {
      id: 'grep',
      title: 'Filter with grep',
      blocks: [
        { h3: 'The universal narrowing tool' },
        { p: '`grep <pattern> <file>` prints every matching line. Case-insensitive is `-i`; extended regex is `-E`; invert (keep non-matches) is `-v`. Quote patterns that contain spaces or shell metacharacters.' },
        {
          list: [
            '`grep -i failed /var/log/auth.log`: case-insensitive substring match.',
            "`grep -E 'Failed|Invalid' /var/log/auth.log`: alternation across two words.",
            '`grep -v Accepted /var/log/auth.log`: drop success lines, keep everything else.',
          ],
        },
        { callout: "Rule of thumb: filter first, transform second. Every downstream pipe stage runs on fewer rows, and grep is the cheapest filter you have." },
        { task: "Show only the failed-password lines." },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^grep(\s+-[iEv]+)*\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log\s*$/i,
        hints: [
          'grep the exact phrase "Failed password" out of the auth log.',
          'quote the pattern because it contains a space.',
          "try `grep 'Failed password' /var/log/auth.log`.",
        ],
        reveal: "grep 'Failed password' /var/log/auth.log",
        explain: 'Four failure lines survive. jsmith accounts for three of them, root for one — all from 10.0.0.9. The shape of the incident is already showing.',
      },
    },
    {
      id: 'window',
      title: 'Narrow to a time window',
      blocks: [
        { h3: 'awk on the timestamp column' },
        { p: 'Syslog lines start with `Mon DD HH:MM:SS` — three space-separated fields. `awk` splits each line on whitespace and lets you compare fields directly. Field 3 (`$3`) is the time; a string comparison against `"HH:MM"` is enough when the day is fixed.' },
        { code: "awk '$3 >= \"14:02\" && $3 < \"14:06\"' /var/log/auth.log" },
        { p: 'The upper bound uses `< "14:06"` rather than `<= "14:05"` because string comparison sorts `"14:05:08"` after `"14:05"` (longer strings with a shared prefix are "greater"), so a `<=` bound would drop 14:05:xx events. For date arithmetic across days, reach for `date -d` or Python; when the window fits inside one day, string comparison is the shortest path.' },
        { task: 'Keep only lines from 14:02 through 14:05.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^awk\s+'\$3\s*>=\s*"14:02"\s*&&\s*\$3\s*<\s*"14:06"'\s+\/var\/log\/auth\.log\s*$/i,
        hints: [
          '$3 is the timestamp field.',
          'string comparison works when the window is inside one day — but bound with `< "14:06"`, not `<= "14:05"`, so 14:05:xx events are kept.',
          "try `awk '$3 >= \"14:02\" && $3 < \"14:06\"' /var/log/auth.log`.",
        ],
        reveal: "awk '$3 >= \"14:02\" && $3 < \"14:06\"' /var/log/auth.log",
        explain: 'Five lines land in-window. The Accepted-password success at 14:06 is now cut off — save that pivot for later, once you have the failure story quantified.',
      },
    },
    {
      id: 'fields',
      title: 'Extract fields',
      blocks: [
        { h3: 'awk \'{print $N}\' — the shell \'| fields\'' },
        { p: 'Once every line has the same shape, pull out just the columns you need. In sshd log lines, field 9 is the username and field 11 is the source IP. Chain grep-filters into an awk-print to end up with a two-column view.' },
        { code: "grep 'Failed password' /var/log/auth.log | grep jsmith | awk '{print $9, $11}'" },
        {
          list: [
            '`awk \'{print $1, $2, $3}\'`: pick specific columns.',
            '`cut -d\' \' -f9,11 file`: same idea, no scripting language.',
            '`awk \'{print $NF}\'`: the last field, useful when width varies.',
          ],
        },
        { task: 'Extract user and source IP for failed jsmith logins.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /^grep\s+['"]?Failed password['"]?\s+\/var\/log\/auth\.log\s*\|\s*grep\s+jsmith\s*\|\s*awk\s+'\{\s*print\s+\$9\s*,\s*\$11\s*\}'\s*$/i,
        hints: [
          'chain three stages: grep for Failed password, grep for jsmith, awk for the two fields.',
          'field 9 is the user, field 11 is the source IP.',
          "try `grep 'Failed password' /var/log/auth.log | grep jsmith | awk '{print $9, $11}'`.",
        ],
        reveal: "grep 'Failed password' /var/log/auth.log | grep jsmith | awk '{print $9, $11}'",
        explain: 'Three lines, all `jsmith 10.0.0.9`. Same source every time — this is not fat-fingers across a hallway of workstations, it is one host hammering one account.',
      },
    },
  ],
};

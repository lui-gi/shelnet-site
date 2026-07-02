// src/config/modules/python-scripting.js
// The `editor`-stage room for Python Scripting. Six sections progress from a
// port scanner through argparse, requests, JSON parsing, log parsing, and the
// __main__ guard. Each section has its own script (fill-in-the-blanks) and its
// own canned runOutput; EditorStage reads activeIndex from the Room to swap.

const isMatched = (e) => e.type === 'run' && e.payload?.matched === true;

export default {
  stageConfig: {
    language: 'python',
    scripts: [
      // Section 1: port scanner
      {
        filename: 'portscan.py',
        motd: ['fill the blanks so the port scanner runs.'],
        script: [
          { line: 'import socket, sys' },
          { line: '' },
          { line: 'host = sys.argv[1]' },
          { blank: true, before: 'for port in ', after: ':',
            expect: /^range\(1,\s*1025\)$/, hint: 'iterate ports 1..1024 inclusive' },
          { line: '    s = socket.socket()' },
          { line: '    s.settimeout(0.2)' },
          { blank: true, before: '    if ', after: ' == 0:',
            expect: /^s\.connect_ex\(\(host,\s*port\)\)$/, hint: 'connect_ex returns 0 when the port is open' },
          { line: '        print(port)' },
          { line: '    s.close()' },
        ],
        runOutput: ['22', '80', '443'],
      },
      // Section 2: argparse
      {
        filename: 'cli.py',
        motd: ['argparse turns positional/optional args into a Namespace.'],
        script: [
          { line: 'import argparse' },
          { line: '' },
          { blank: true, before: 'parser = ', after: '',
            expect: /^argparse\.ArgumentParser\(\)$/, hint: 'construct the top-level parser' },
          { blank: true, before: '', after: '',
            expect: /^parser\.add_argument\(['"]--target['"]\)$/, hint: 'register an optional --target flag' },
          { line: 'args = parser.parse_args()' },
          { line: 'print(args)' },
        ],
        runOutput: ["Namespace(target='10.0.0.5')"],
      },
      // Section 3: requests web enum
      {
        filename: 'weburl_scan.py',
        motd: ['requests.get returns a Response; check status_code.'],
        script: [
          { line: 'import requests' },
          { line: '' },
          { line: 'urls = ["/login", "/admin", "/wp-login.php"]' },
          { line: 'for path in urls:' },
          { line: '    url = f"http://10.0.0.5{path}"' },
          { blank: true, before: '    resp = ', after: '',
            expect: /^requests\.get\(url,\s*timeout=3\)$/, hint: 'always pass a timeout on network calls' },
          { blank: true, before: '    print(', after: ', path)',
            expect: /^resp\.status_code$/, hint: 'the numeric HTTP status lives here' },
        ],
        runOutput: ['200 /login', '403 /admin', '404 /wp-login.php'],
      },
      // Section 4: JSON parsing
      {
        filename: 'parse_json.py',
        motd: ['json.loads turns a string into a dict.'],
        script: [
          { line: 'import json' },
          { line: '' },
          { line: 'body = \'{"results":[{"ip":"10.0.0.5"}]}\'' },
          { blank: true, before: 'data = ', after: '',
            expect: /^json\.loads\(body\)$/, hint: 'parse the string into a Python dict' },
          { blank: true, before: 'print(', after: ')',
            expect: /^data\[['"]results['"]\]\[0\]\[['"]ip['"]\]$/, hint: 'drill into results, first entry, ip key' },
        ],
        runOutput: ['10.0.0.5'],
      },
      // Section 5: log parser
      {
        filename: 'log_parse.py',
        motd: ['re.compile a pattern, then findall against each line.'],
        script: [
          { line: 'import re' },
          { line: 'from collections import Counter' },
          { line: '' },
          { line: 'lines = open("auth.log")' },
          { blank: true, before: 'pat = ', after: '',
            expect: /^re\.compile\(r['"]Failed password for \(\\w\+\)['"]\)$/, hint: 'capture the username after "Failed password for "' },
          { line: 'hits = Counter()' },
          { line: 'for line in lines:' },
          { blank: true, before: '    for user in ', after: ':',
            expect: /^pat\.findall\(line\)$/, hint: 'findall returns every capture group match on the line' },
          { line: '        hits[user] += 1' },
          { line: 'for u, n in hits.most_common():' },
          { line: '    print(f"{u}: {n}")' },
        ],
        runOutput: ['jsmith: 4', 'awilliams: 1'],
      },
      // Section 6: __main__ guard
      {
        filename: 'main.py',
        motd: ['the __main__ guard keeps import-time side-effects out.'],
        script: [
          { line: 'def main():' },
          { line: '    print("[+] scan complete")' },
          { line: '' },
          { blank: true, before: '', after: '',
            expect: /^if\s+__name__\s*==\s*['"]__main__['"]:$/, hint: 'the canonical guard line' },
          { line: '    main()' },
        ],
        runOutput: ['[+] scan complete'],
      },
    ],
  },

  ceremony: {
    toolkit: ['python3', 'requests'],
    target: 'lab editor',
  },

  sections: [
    {
      id: 'portscan',
      title: 'Port scanner from scratch',
      blocks: [
        { h2: 'Port scanner from scratch' },
        { p: "Python's stdlib socket module is enough to write a TCP port scanner. `connect_ex` is the non-raising variant of `connect`: it returns an errno (0 on success). That makes it perfect for a scan loop." },
        { p: 'Fill the two blanks so the script sweeps 1..1024 and prints open ports.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: isMatched,
        hints: [
          'the first blank is a range 1..1025 (upper bound exclusive).',
          'connect_ex takes a (host, port) tuple.',
          'a return value of 0 means the port is open.',
        ],
        explain: 'connect_ex + a tight range is the smallest viable scanner.',
      },
    },
    {
      id: 'argparse',
      title: 'Argparse basics',
      blocks: [
        { h2: 'Argparse basics' },
        { p: 'argparse gives you `--flag value` handling for free. Two calls: construct a parser, register each argument. `parse_args()` returns a `Namespace` with attribute-style access.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: isMatched,
        hints: [
          'the parser is constructed with argparse.ArgumentParser().',
          "add_argument takes the flag name as a string, e.g. '--target'.",
        ],
        explain: 'A Namespace is a lightweight object with attributes named after each --flag.',
      },
    },
    {
      id: 'web-enum',
      title: 'Requests-based web enum',
      blocks: [
        { h2: 'Requests-based web enum' },
        { p: '`requests.get` returns a Response. The status_code tells you whether the path exists (200), is forbidden (403), or missing (404). Always pass a timeout — hanging on a slow host is worse than missing it.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: isMatched,
        hints: [
          'requests.get(url, timeout=3) is the safe idiom.',
          'the status number is resp.status_code (an int).',
        ],
        explain: '200 vs 403 vs 404 is the fastest triage over a URL list.',
      },
    },
    {
      id: 'json',
      title: 'Parsing JSON responses',
      blocks: [
        { h2: 'Parsing JSON responses' },
        { p: '`json.loads` turns a JSON string into Python. Once parsed, indexing follows normal dict/list syntax.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: isMatched,
        hints: [
          'json.loads takes the raw string body.',
          "walk the structure: dict['key'] then list[0] then dict['ip'].",
        ],
        explain: 'Chained indexing is the trade-off for parse-once/no-schema flexibility.',
      },
    },
    {
      id: 'logs',
      title: 'Simple log parser',
      blocks: [
        { h2: 'Simple log parser' },
        { p: '`re.compile` builds a pattern once so `findall` is fast in a loop. A capture group `(...)` returns just the matched substring — the username after "Failed password for" in this case.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: isMatched,
        hints: [
          'raw string r"..." saves you from escaping backslashes.',
          '\\w+ matches one or more word characters.',
          'pat.findall(line) yields every match on that line.',
        ],
        explain: 'Compile once, match many. The Counter takes care of tallying.',
      },
    },
    {
      id: 'main-guard',
      title: 'Wiring it up with __main__',
      blocks: [
        { h2: 'Wiring it up with __main__' },
        { p: 'A script that does work at import time hurts everyone who tries to reuse it. The `if __name__ == "__main__":` guard means the body only runs when the file is invoked directly.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: isMatched,
        hints: [
          'the guard line ends with a colon.',
          'the string is exactly "__main__" (double underscores).',
        ],
        explain: 'The guard is the difference between a script and a module.',
      },
    },
  ],
};

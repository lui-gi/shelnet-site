// src/config/modules/splunk-queries.js
// The reference `search`-stage room. Teaches SPL from the ground up — query
// anatomy, boolean/wildcard filtering, time modifiers, field selection, the
// stats family, sort/dedup, eval, timechart, and subsearches — then walks the
// learner through triaging a brute-force alert in a hand-authored auth index
// (no real Splunk). Lazily imported by moduleRegistry; consumed by
// components/room/Room.jsx. Stage query matchers are whitespace/case tolerant;
// the most specific queries are listed first so a broad index search falls
// through to the base result.

export default {
  stageConfig: {
    product: 'Splunk',
    index: 'auth',
    placeholder: 'index=auth sourcetype=linux_secure …',
    queries: [
      {
        // Failed jsmith with an explicit table/fields command — selects columns.
        match: /index\s*=\s*auth[\s\S]*jsmith[\s\S]*(fail|action\s*=\s*failure)[\s\S]*\|\s*(table|fields)\s+/i,
        columns: ['_time', 'src_ip', 'user', 'action'],
        rows: [
          ['14:02', '10.0.0.9', 'jsmith', 'failure'],
          ['14:03', '10.0.0.9', 'jsmith', 'failure'],
          ['14:05', '10.0.0.9', 'jsmith', 'failure'],
        ],
        note: 'showing 3 of 47 matching events — only the columns you asked for.',
      },
      {
        // Unique src_ip values for jsmith (dedup).
        match: /index\s*=\s*auth[\s\S]*jsmith[\s\S]*\|\s*dedup\s+src_ip/i,
        columns: ['src_ip', '_time'],
        rows: [
          ['10.0.0.9', '14:02'],
        ],
        note: '1 unique src_ip for jsmith. every one of the 48 events came from the same host.',
      },
      {
        // Rank source IPs by failure count (stats + sort + head).
        match: /action\s*=\s*failure[\s\S]*\|\s*stats\s+count\s+by\s+src_ip[\s\S]*\|\s*sort[\s\S]*(-\s*count|count\s+desc)[\s\S]*\|\s*head/i,
        columns: ['src_ip', 'count'],
        rows: [
          ['10.0.0.9', '47'],
          ['10.0.0.14', '3'],
          ['10.0.0.22', '1'],
        ],
        note: 'top 3 noisiest source IPs.',
      },
      {
        // eval with if() to label users as brute-force / normal.
        match: /action\s*=\s*failure[\s\S]*\|\s*stats\s+count[\s\S]*by\s+user[\s\S]*\|\s*eval\s+verdict/i,
        columns: ['user', 'fails', 'verdict'],
        rows: [
          ['jsmith', '47', 'brute-force'],
          ['admin', '3', 'normal'],
          ['root', '1', 'normal'],
        ],
        note: 'derived column `verdict` computed per row via eval.',
      },
      {
        // timechart failures per minute, split by user.
        match: /action\s*=\s*failure[\s\S]*\|\s*timechart[\s\S]*count/i,
        columns: ['_time', 'jsmith', 'admin', 'root'],
        rows: [
          ['14:01', '0', '0', '0'],
          ['14:02', '18', '1', '0'],
          ['14:03', '15', '1', '0'],
          ['14:04', '10', '0', '1'],
          ['14:05', '4', '1', '0'],
        ],
        note: 'span=1m — one row per minute, one column per user.',
      },
      {
        // Subsearch: successes from src_ips that had >10 failures.
        match: /index\s*=\s*auth[\s\S]*action\s*=\s*success[\s\S]*\[\s*search[\s\S]*action\s*=\s*failure[\s\S]*\]/i,
        columns: ['_time', 'action', 'user', 'src_ip'],
        rows: [
          ['14:06', 'Accepted password', 'jsmith', '10.0.0.9'],
        ],
        note: 'the inner search returned src_ip=10.0.0.9; the outer search filtered successes to that IP.',
      },
      {
        // Failed SSH logins for jsmith.
        match: /index\s*=\s*auth[\s\S]*jsmith[\s\S]*(fail|action\s*=\s*failure)/i,
        columns: ['_time', 'action', 'user', 'src_ip'],
        rows: [
          ['14:02', 'Failed password', 'jsmith', '10.0.0.9'],
          ['14:03', 'Failed password', 'jsmith', '10.0.0.9'],
          ['14:05', 'Failed password', 'jsmith', '10.0.0.9'],
        ],
        note: 'showing 3 of 47 matching events',
      },
      {
        // Count of failures per user.
        match: /action\s*=\s*failure[\s\S]*\|\s*stats\s+count\s+by\s+user/i,
        columns: ['user', 'count'],
        rows: [
          ['jsmith', '47'],
          ['admin', '3'],
          ['root', '1'],
        ],
      },
      {
        // Successful login for jsmith.
        match: /jsmith[\s\S]*(success|action\s*=\s*success|accepted)/i,
        columns: ['_time', 'action', 'user', 'src_ip'],
        rows: [
          ['14:06', 'Accepted password', 'jsmith', '10.0.0.9'],
        ],
      },
      {
        // Base search: raw events from the index.
        match: /index\s*=\s*auth/i,
        columns: ['_time', 'action', 'user', 'src_ip'],
        rows: [
          ['14:02', 'Failed password', 'jsmith', '10.0.0.9'],
          ['14:02', 'Accepted password', 'awilliams', '10.0.0.4'],
          ['14:03', 'Failed password', 'jsmith', '10.0.0.9'],
          ['14:05', 'Failed password', 'root', '10.0.0.9'],
        ],
        note: 'showing 4 of 1,204 events. add fields to narrow it down.',
      },
    ],
  },

  ceremony: {
    toolkit: ['splunk'],
    target: 'web-01',
  },

  sections: [
    {
      id: 'what',
      title: 'What is SPL',
      blocks: [
        { h2: 'Triaging with Splunk' },
        { p: 'Splunk stores machine data as timestamped events you query with SPL (Search Processing Language). A search starts by naming where to look, then narrows with fields, then optionally transforms the results.' },
        { p: 'The shape is almost always: `index=… sourcetype=…` to scope it, `field=value` to filter, then `| command` to summarize.' },
        { callout: 'Why pros do it: raw logs do not scale to human eyes. SPL turns thousands of lines into the three rows that matter, which is the whole job in a SOC.' },
        { p: 'Scenario: an auth alert fired on host `web-01`. You have one index, `auth` (sourcetype `linux_secure`). You will learn the language first, then triage.' },
      ],
    },
    {
      id: 'anatomy',
      title: 'Anatomy of a search',
      blocks: [
        { h3: 'Search → pipe → command → pipe → command' },
        { p: 'Every SPL query is a chain of stages joined by `|`. The first stage retrieves events; each pipe after that takes the previous stage\'s output and reshapes it.' },
        { code: 'index=auth action=failure | stats count by user | sort -count | head 5' },
        { p: 'Read left-to-right: **retrieve** failure events from the auth index, **aggregate** them into rows per user, **sort** those rows by count descending, **keep** the top 5.' },
        { p: 'The commands you will meet most often fall into four buckets:' },
        {
          list: [
            '**Filter** — narrow events: `search`, `where`, `dedup`',
            '**Shape** — pick or compute fields: `fields`, `table`, `rename`, `eval`, `rex`',
            '**Aggregate** — turn events into rows: `stats`, `top`, `rare`, `chart`, `timechart`',
            '**Enrich** — pull in outside data: `lookup`, `join`, `append`',
          ],
        },
        { callout: 'Rule of thumb: put filters as early as possible. The fewer events survive to the first pipe, the faster (and cheaper) the whole search runs.' },
      ],
    },
    {
      id: 'booleans',
      title: 'Booleans, wildcards, comparisons',
      blocks: [
        { h3: 'Combining terms and matching loosely' },
        { p: 'Before any pipe, the base search is a boolean expression. Terms are joined implicitly by AND; `OR` and `NOT` change that. Parentheses group.' },
        { code: 'index=auth (user=jsmith OR user=admin) NOT action=success' },
        { p: 'Values can wildcard with `*`; phrases with spaces need quotes; `!=` excludes an exact value.' },
        {
          list: [
            'Wildcard field: `user=svc_*` matches any account starting with `svc_`.',
            'Phrase match: `"Failed password"` matches those two words together in `_raw`.',
            'Exclusion: `action!=success` keeps everything that is not a success.',
            'Comparisons in `search` are equality only. Use `| where` for `>`, `<`, `>=`, `<=`, or field-to-field math.',
          ],
        },
        { code: 'index=auth | stats count by user | where count > 10' },
        { callout: 'Note the two ways to filter: base-search filters (before the first pipe) run against the raw index and are fast. `| where` filters run over already-retrieved rows and can compare fields to each other.' },
      ],
    },
    {
      id: 'time',
      title: 'Time modifiers',
      blocks: [
        { h3: 'earliest / latest' },
        { p: 'Every Splunk search has a time window. The picker sets a default, but you can pin the window inline with `earliest=` and `latest=` — the safest way to keep an alert query reproducible.' },
        { code: 'index=auth earliest=-1h latest=now user=jsmith action=failure' },
        {
          list: [
            'Relative units: `s` seconds, `m` minutes, `h` hours, `d` days, `w` weeks, `mon` months, `y` years.',
            'Snap-to with `@`: `-1d@d` means "24 hours ago snapped to the start of that day".',
            'Absolute: `earliest="10/15/2024:14:00:00"` (m/d/y:H:M:S).',
            '`now` and `today` are shortcuts.',
          ],
        },
        { callout: 'A too-wide time range is the number-one cause of slow searches. Pin `earliest` before you pipe anything else.' },
      ],
    },
    {
      id: 'base',
      title: 'Scope the search',
      blocks: [
        { h3: 'Name where to look' },
        { p: 'Every search begins by scoping to an index (and usually a sourcetype). `host=` and `source=` narrow further when you have many senders. Run the unfiltered base search to see what the raw events look like before you filter.' },
        { task: 'Search the auth index for its linux_secure events.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*auth/i,
        hints: ['Scope with index= and sourcetype=.', 'index=auth sourcetype=linux_secure'],
        reveal: 'index=auth sourcetype=linux_secure',
        explain: 'Raw events, both successes and failures, across many users. Now filter to the signal the alert is about.',
      },
    },
    {
      id: 'failed',
      title: 'Filter to the failures',
      blocks: [
        { h3: 'Narrow with fields' },
        { p: 'The alert named a user. Add field filters to keep only failed SSH logins for `jsmith`. Fields you can use: `user`, `action` (with value `failure`).' },
        { task: 'Find failed logins for user jsmith.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*auth[\s\S]*jsmith[\s\S]*(fail|action\s*=\s*failure)/i,
        hints: ['Keep the index scope, then add the user and the failure action.', 'index=auth user=jsmith action=failure'],
        reveal: 'index=auth user=jsmith action=failure',
        explain: 'Repeated failures from a single source IP in a tight window. That pattern says brute force; quantify it next.',
      },
    },
    {
      id: 'select-fields',
      title: 'Pick columns with table',
      blocks: [
        { h3: 'fields vs table' },
        { p: 'By default the results grid shows every field Splunk extracted. When you know what you need — for a screenshot, a ticket, or a downstream pipe — pick the columns explicitly.' },
        {
          list: [
            '`| fields _time src_ip user action` — keeps those fields, drops the rest, preserves the order.',
            '`| fields - password` — keeps everything **except** the listed fields.',
            '`| table _time src_ip user action` — like `fields`, but also formats results as a display table (loses the raw events view).',
          ],
        },
        { task: 'Show only _time, src_ip, user, action for the failed jsmith logins.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*auth[\s\S]*jsmith[\s\S]*(fail|action\s*=\s*failure)[\s\S]*\|\s*(table|fields)\s+/i,
        hints: ['Take your last query and pipe it into `table`.', 'index=auth user=jsmith action=failure | table _time src_ip user action'],
        reveal: 'index=auth user=jsmith action=failure | table _time src_ip user action',
        explain: 'Clean four-column output. This is the shape you paste into a ticket — no noise, just the fields that carry the story.',
      },
    },
    {
      id: 'stats',
      title: 'Summarize with stats',
      blocks: [
        { h3: 'Transform events into rows' },
        { p: 'A transforming command after a pipe turns events into a table. `stats count by user` collapses every failure into one row per account so the loudest source jumps out.' },
        { p: '`stats` takes any number of aggregation functions. The most common:' },
        {
          list: [
            '`count` — number of events (optionally per grouped value).',
            '`dc(field)` — **d**istinct **c**ount of unique values.',
            '`sum(field)` / `avg(field)` / `min(field)` / `max(field)` — arithmetic.',
            '`values(field)` — the sorted-unique list; `list(field)` — the ordered list with duplicates.',
            '`latest(field)` / `earliest(field)` — value at the newest / oldest event in the group.',
          ],
        },
        { code: '| stats count as attempts, dc(src_ip) as sources, values(action) by user' },
        { p: '`as` renames the output column so the table is readable.' },
        { task: 'Count failed logins per user.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /action\s*=\s*failure[\s\S]*\|\s*stats\s+count\s+by\s+user/i,
        hints: ['Filter to failures, then pipe into stats.', 'index=auth action=failure | stats count by user'],
        reveal: 'index=auth action=failure | stats count by user',
        explain: 'jsmith has 47 failures versus a handful for everyone else. This is a targeted attack on one account.',
      },
    },
    {
      id: 'howmany',
      title: 'Read the numbers',
      blocks: [
        { h3: 'Knowledge check' },
        { p: 'Numbers drive the severity you report. Look at the stats table you just produced.' },
        { task: 'How many failed logins did jsmith rack up?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /\b47\b/,
        hints: ['It is the count next to jsmith in the stats table.'],
        reveal: '47',
        explain: '47 failures is well past any fat-finger threshold. The only question left is whether one of them eventually worked.',
      },
    },
    {
      id: 'sort-top',
      title: 'Rank with sort and head',
      blocks: [
        { h3: 'Order the summary, keep the top N' },
        { p: 'Aggregations are unordered until you say otherwise. Pipe into `sort` and `head` (or use `top`) to surface the worst offenders first.' },
        {
          list: [
            '`| sort -count` — descending by count (leading `-` = desc; `+` or nothing = asc).',
            '`| sort 10 -count` — same, capped at 10 rows.',
            '`| head 5` — first 5 rows after sorting.',
            '`| top limit=5 src_ip` — shortcut for count + sort + head + percent, all in one.',
          ],
        },
        { task: 'Find the top 3 source IPs by failure count.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /action\s*=\s*failure[\s\S]*\|\s*stats\s+count\s+by\s+src_ip[\s\S]*\|\s*sort[\s\S]*(-\s*count|count\s+desc)[\s\S]*\|\s*head/i,
        hints: [
          'Aggregate by src_ip, then sort descending on the count, then keep the first 3.',
          'index=auth action=failure | stats count by src_ip | sort -count | head 3',
        ],
        reveal: 'index=auth action=failure | stats count by src_ip | sort -count | head 3',
        explain: '10.0.0.9 owns 47 of the 51 failures. One host is doing almost all the noise.',
      },
    },
    {
      id: 'success',
      title: 'Did it work',
      blocks: [
        { h3: 'Check for a successful login' },
        { p: 'A brute force only matters if it succeeded. Pivot the same user to successful logins and see whether one landed.' },
        { task: 'Show whether any jsmith login finally succeeded.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /jsmith[\s\S]*(success|action\s*=\s*success|accepted)/i,
        hints: ['Same user, but flip the action to success.', 'index=auth user=jsmith action=success'],
        reveal: 'index=auth user=jsmith action=success',
        explain: 'One Accepted password at 14:06, from the same IP as the 47 failures. The brute force worked.',
      },
    },
    {
      id: 'eval',
      title: 'Compute fields with eval',
      blocks: [
        { h3: 'Derive new columns per row' },
        { p: '`eval` creates or overwrites a field using an expression. It runs row-by-row and unlocks conditionals, math, string ops, and time formatting inside a search.' },
        {
          list: [
            'Conditional: `eval verdict = if(fails > 10, "brute-force", "normal")`',
            'Multi-branch: `eval band = case(count<5,"low", count<50,"mid", true(),"high")`',
            'Math: `eval ratio = successes / (successes + fails)`',
            'Time: `eval hour = strftime(_time, "%H")`',
            'Coalesce: `eval owner = coalesce(user, src_user, "unknown")`',
          ],
        },
        { p: 'A common triage pattern: aggregate first, then tag each row with a verdict so the table tells a story on its own.' },
        { task: 'Label each user\'s failure count as "brute-force" if > 10, else "normal".' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /action\s*=\s*failure[\s\S]*\|\s*stats\s+count[\s\S]*by\s+user[\s\S]*\|\s*eval\s+verdict/i,
        hints: [
          'Start from failures grouped by user; rename count with `as fails`; then eval a verdict.',
          'index=auth action=failure | stats count as fails by user | eval verdict = if(fails>10, "brute-force", "normal")',
        ],
        reveal: 'index=auth action=failure | stats count as fails by user | eval verdict = if(fails>10, "brute-force", "normal")',
        explain: 'One glance and the picture is obvious: jsmith is flagged, everyone else is fine. eval let you encode the rule instead of eyeballing.',
      },
    },
    {
      id: 'dedup',
      title: 'Uniqueness with dedup',
      blocks: [
        { h3: 'One row per distinct value' },
        { p: '`dedup` keeps the first event for each value (or combination) of the fields you name. Use it to answer "how many distinct X are there" without an aggregation.' },
        {
          list: [
            '`| dedup src_ip` — one row per unique src_ip.',
            '`| dedup src_ip sortby -_time` — the **most recent** event per src_ip.',
            '`| dedup 3 user` — keep up to 3 events per user (useful for sampling).',
          ],
        },
        { p: 'For a pure count of uniques (no rows), `stats dc(field)` is usually the right tool. Reach for `dedup` when you want to keep the rest of the row too.' },
        { task: 'Show the unique source IPs jsmith connected from.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*auth[\s\S]*jsmith[\s\S]*\|\s*dedup\s+src_ip/i,
        hints: [
          'Filter to jsmith, then dedup by src_ip.',
          'index=auth user=jsmith | dedup src_ip | table src_ip _time',
        ],
        reveal: 'index=auth user=jsmith | dedup src_ip | table src_ip _time',
        explain: 'Every jsmith event — failure or success — came from 10.0.0.9. Same source before and after the compromise; that is a single-attacker story.',
      },
    },
    {
      id: 'timechart',
      title: 'Trend over time',
      blocks: [
        { h3: 'timechart = stats bucketed by _time' },
        { p: '`timechart` produces a time-series table (and, in the UI, a chart) by bucketing events into fixed time slices and aggregating each bucket. It is `stats` with `_time` as the implicit grouping key.' },
        {
          list: [
            '`| timechart span=1m count` — count per one-minute bucket.',
            '`| timechart span=5m count by user` — a column per user, so you can spot the loud one.',
            '`| timechart avg(bytes)` — average bytes per bucket.',
            '`| bin _time span=1h | stats ...` — manual bucketing when you need weirder aggregations.',
          ],
        },
        { task: 'Chart the per-minute failure count, split by user.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /action\s*=\s*failure[\s\S]*\|\s*timechart[\s\S]*count/i,
        hints: [
          'Pipe failures into timechart with a span and a split-by user.',
          'index=auth action=failure | timechart span=1m count by user',
        ],
        reveal: 'index=auth action=failure | timechart span=1m count by user',
        explain: 'jsmith\'s column carries the whole spike from 14:02 to 14:05 — a tight, aggressive burst. Everyone else is background.',
      },
    },
    {
      id: 'subsearch',
      title: 'Feed a search into a search',
      blocks: [
        { h3: 'Subsearches with [ ... ]' },
        { p: 'A subsearch in square brackets runs first; its output is spliced into the outer search as terms. It is the fastest way to say "give me events matching a list I have to compute".' },
        { code: 'index=auth action=success [ search index=auth action=failure | stats count by src_ip | where count > 10 | fields src_ip ]' },
        { p: 'The inner query yields a set of `src_ip` values; the outer query becomes `action=success (src_ip="10.0.0.9" OR src_ip="…")`. In one shot you get: **successful logins from any IP that also had a brute-force count**.' },
        {
          list: [
            'Cap: subsearches are limited to ~10,000 rows and a 60-second runtime by default — keep them small.',
            'Always end the inner search with `| fields <name>` so only the values you need are spliced back in.',
            'For row-level joining (not just filtering), reach for `join` or `lookup` instead.',
          ],
        },
        { task: 'Find successful logins that came from an IP with more than 10 failures.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*auth[\s\S]*action\s*=\s*success[\s\S]*\[\s*search[\s\S]*action\s*=\s*failure[\s\S]*\]/i,
        hints: [
          'Outer search: successful auth events. Inner search: failure counts by src_ip, kept only where count > 10, returning just src_ip.',
          'index=auth action=success [ search index=auth action=failure | stats count by src_ip | where count > 10 | fields src_ip ]',
        ],
        reveal: 'index=auth action=success [ search index=auth action=failure | stats count by src_ip | where count > 10 | fields src_ip ]',
        explain: 'One row: jsmith at 14:06 from 10.0.0.9 — the successful login that followed a brute force. This is the query you paste into the incident.',
      },
    },
    {
      id: 'advanced',
      title: 'Advanced techniques (reference)',
      blocks: [
        { h3: 'Commands you will reach for eventually' },
        { p: '`rex` — extract new fields from `_raw` (or any string field) with a named-capture regex. Great for logs where a parser has not been written yet.' },
        { code: '... | rex field=_raw "from (?<src_ip>\\d+\\.\\d+\\.\\d+\\.\\d+) port (?<src_port>\\d+)"' },
        { p: '`spath` — parse JSON. Point it at a field containing JSON and every key becomes accessible (dot-path for nested).' },
        { code: '... | spath input=_raw | table user, event.action, event.result' },
        { p: '`lookup` — enrich events using a CSV or KV-store table. Match on a key field; add the other columns to every event.' },
        { code: '... | lookup asset_owners host OUTPUT owner, team | stats count by owner' },
        { p: '`join` — SQL-style join between two searches on a shared field. Use sparingly; `stats` with `dc()` or a `lookup` is usually cheaper.' },
        { code: 'index=auth | join user [ search index=hr | fields user, department ] | stats count by department' },
        { p: '`eventstats` / `streamstats` — like `stats`, but write the aggregate back onto every event so you can compare rows to the group (`eventstats`) or to a running window (`streamstats`).' },
        { code: '... | eventstats avg(bytes) as baseline by host | where bytes > 3*baseline' },
        { p: '`transaction` — group related events by a key and time window (session, source_ip). Slow at scale; prefer `stats` when possible.' },
        { p: '`tstats` — like `stats`, but runs over indexed metadata / accelerated data models. Orders of magnitude faster for common counts.' },
        { code: '| tstats count where index=auth by host, sourcetype' },
        { p: '`| makeresults` — synthesizes rows out of nothing. Perfect for testing eval expressions or seeding a subsearch.' },
        { code: '| makeresults count=5 | streamstats count as n | eval doubled = n*2' },
        { callout: 'Splunk Docs is authoritative; the Search Reference page for each command lists every option. Once you know a command exists, the docs finish the sentence.' },
      ],
    },
    {
      id: 'verdict',
      title: 'Call it',
      blocks: [
        { h3: 'Make the call' },
        { p: 'Triage ends with a verdict an analyst can act on: was the account compromised?' },
        { task: 'Given a success right after 47 failures from one IP, is jsmith compromised? (yes / no)' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /^\s*y(es)?\s*$/i,
        hints: ['47 failures then an Accepted password from the same source.'],
        reveal: 'yes',
        explain: 'Yes. Treat jsmith as compromised: disable the account, reset credentials, and hunt for what that session touched after 14:06. You triaged a real intrusion from raw logs — and you now know every SPL command you needed to do it.',
      },
    },
  ],
};

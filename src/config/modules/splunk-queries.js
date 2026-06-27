// src/config/modules/splunk-queries.js
// The reference `search`-stage room (a rewrite of the old guided-walkthrough
// Splunk lesson). Teaches SPL from the ground up, then guides the learner through
// triaging a brute-force alert in a hand-authored auth index (no real Splunk).
// Lazily imported by moduleRegistry; consumed by components/room/Room.jsx. Stage
// query matchers are whitespace/case tolerant; the most specific queries are
// listed first so a broad index search falls through to the base result.

export default {
  stageConfig: {
    product: 'Splunk',
    index: 'auth',
    placeholder: 'index=auth sourcetype=linux_secure …',
    queries: [
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
        { p: 'Scenario: an auth alert fired on host `web-01`. You have one index, `auth` (sourcetype `linux_secure`). Triage it.' },
      ],
    },
    {
      id: 'base',
      title: 'Scope the search',
      blocks: [
        { h3: 'Name where to look' },
        { p: 'Every search begins by scoping to an index (and usually a sourcetype). Run the unfiltered base search to see what the raw events look like before you filter.' },
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
      id: 'stats',
      title: 'Summarize with stats',
      blocks: [
        { h3: 'Transform the results' },
        { p: 'A transforming command after a pipe turns events into a table. `stats count by user` collapses every failure into one row per account so the loudest source jumps out.' },
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
        explain: 'Yes. Treat jsmith as compromised: disable the account, reset credentials, and hunt for what that session touched after 14:06. You triaged a real intrusion from raw logs.',
      },
    },
  ],
};

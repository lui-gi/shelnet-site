// guided-walkthrough definition for the Splunk Queries module. Lazy-loaded by
// moduleRegistry's load(); consumed by components/terminal/kinds/guidedWalkthrough.
// `accept` matchers are whitespace-tolerant; `success` blocks are hand-authored
// results (no real Splunk runs in the browser).
export default {
  intro: [
    'SCENARIO: An auth alert fired on host web-01. Triage the SSH logs in Splunk.',
    'You have one index: `auth` (sourcetype=linux_secure).',
  ],
  steps: [
    {
      prompt: "Find failed SSH logins for user 'jsmith'.",
      hint: 'Filter the index, then add the username and the failure action.',
      accept: /index\s*=\s*auth.*jsmith.*(fail|action\s*=\s*failure)/i,
      success: [
        '+-- 3 events --------------------------------------+',
        '| 14:02  Failed password  jsmith  10.0.0.9  ssh    |',
        '| 14:03  Failed password  jsmith  10.0.0.9  ssh    |',
        '| 14:05  Failed password  jsmith  10.0.0.9  ssh    |',
        '+--------------------------------------------------+',
      ],
      explain: 'Three failures in four minutes from one IP: looks like a brute force.',
    },
    {
      prompt: 'Count failed logins per user to find the loudest source.',
      hint: 'Pipe a failure search into `stats count by user`.',
      accept: /action\s*=\s*failure.*\|\s*stats\s+count\s+by\s+user/i,
      success: [
        '  user      count',
        '  jsmith       47',
        '  admin         3',
        '  root          1',
      ],
      explain: 'jsmith has 47 failures: confirm the account and consider a lock.',
    },
    {
      prompt: 'Show whether any jsmith login finally SUCCEEDED.',
      hint: 'Search the user with action=success.',
      accept: /jsmith.*(success|action\s*=\s*success)/i,
      success: [
        '+-- 1 event ---------------------------------------+',
        '| 14:06  Accepted password  jsmith  10.0.0.9  ssh  |',
        '+--------------------------------------------------+',
      ],
      explain: 'A success at 14:06 after 47 failures: the brute force worked. Escalate.',
    },
  ],
  outro: [
    'Lesson complete: you triaged a brute force from raw auth logs.',
    'Type `exit` to return to the modules shell.',
  ],
};

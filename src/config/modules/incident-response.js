// src/config/modules/incident-response.js
// Reference `search`-stage room for the incident-response category. Teaches the
// IR lifecycle from the ground up (frameworks, prep, detection & analysis,
// containment, eradication, recovery, lessons learned) then adds advanced
// tradecraft (comms discipline, timeline building, MITRE mapping, chain of
// custody). The story walks a phishing-driven EDR alert on a single finance
// laptop across the whole lifecycle using SIEM queries against a hand-authored
// multi-index dataset. Lazily imported by moduleRegistry; consumed by
// components/room/Room.jsx. Query matchers are whitespace/case tolerant; the
// most specific queries are listed first so a broad `index=…` search falls
// through to the raw base result for that index.

const HOST = 'finance-lt-14';
const HOST_IP = '10.10.55.14';
const C2 = '185.243.115.84';
const USER = 'schen';
const PHISH_SENDER = 'hr-updates@company-hr.co';

export default {
  stageConfig: {
    product: 'SIEM',
    placeholder: 'index=edr host=finance-lt-14 …',
    queries: [
      // Persistence — scheduled task created on the affected host.
      {
        match: /index\s*=\s*edr[\s\S]*finance-lt-14[\s\S]*(scheduled_task|persistence|autorun)/i,
        columns: ['_time', 'task_name', 'action', 'user'],
        rows: [
          ['09:18:20', 'MicrosoftEdgeUpdaterCore', 'rundll32.exe C:\\Users\\schen\\AppData\\Local\\Temp\\loader.dll,Start', 'schen'],
        ],
        note: 'one autorun task created by the same chain — persistence.',
      },
      // Process tree — parent/child for the offending powershell.
      {
        match: /index\s*=\s*edr[\s\S]*host\s*=\s*finance-lt-14[\s\S]*(powershell|parent_process|process_tree)/i,
        columns: ['_time', 'parent_process', 'process', 'command_line'],
        rows: [
          ['09:18:12', 'WINWORD.EXE', 'powershell.exe', 'powershell -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0AC…'],
          ['09:18:14', 'powershell.exe', 'rundll32.exe', 'rundll32.exe C:\\Users\\schen\\AppData\\Local\\Temp\\loader.dll,Start'],
        ],
        note: 'WINWORD → PowerShell (encoded) → rundll32. Not a legitimate chain.',
      },
      // Alert view — the ticket that opened the incident.
      {
        match: /index\s*=\s*edr[\s\S]*(alert|severity)[\s\S]*(schen|finance-lt|high)/i,
        columns: ['_time', 'host', 'user', 'alert_name', 'process', 'severity'],
        rows: [
          ['09:22:04', 'finance-lt-14', 'schen', 'Suspicious PowerShell + Outbound', 'powershell.exe', 'high'],
        ],
        note: 'the alert that opened the ticket.',
      },
      // Scope-by-IP — who else beaconed to the C2.
      {
        match: /index\s*=\s*network[\s\S]*185\.243\.115\.84[\s\S]*\|\s*stats\s+count\s+by\s+src/i,
        columns: ['src', 'count'],
        rows: [
          ['10.10.55.14', '84'],
        ],
        note: 'one internal source. no lateral spread — good news.',
      },
      // C2 traffic from the affected host.
      {
        match: /index\s*=\s*network[\s\S]*(finance-lt-14|10\.10\.55\.14)/i,
        columns: ['_time', 'src', 'dest_ip', 'dest_port', 'bytes_out'],
        rows: [
          ['09:18:16', '10.10.55.14', '185.243.115.84', '443', '12,485'],
          ['09:18:22', '10.10.55.14', '185.243.115.84', '443', '4,204'],
          ['09:19:35', '10.10.55.14', '185.243.115.84', '443', '2,110'],
          ['09:21:04', '10.10.55.14', '185.243.115.84', '443', '3,942'],
        ],
        note: 'steady beacon to a single external IP. classic C2 pattern.',
      },
      // Scope-by-sender — who else received the phish.
      {
        match: /index\s*=\s*email[\s\S]*sender[\s\S]*\|\s*stats\s+count\s+by\s+recipient/i,
        columns: ['recipient', 'count'],
        rows: [
          ['schen', '1'],
          ['mjohnson', '1'],
          ['rgarcia', '1'],
        ],
        note: 'three recipients. only one host beaconed.',
      },
      // Email — inbound to schen (finds the phish).
      {
        match: /index\s*=\s*email[\s\S]*(schen|recipient)/i,
        columns: ['_time', 'sender', 'subject', 'attachment', 'verdict'],
        rows: [
          ['08:22:15', 'newsletter@vendor.io', 'Weekly report', '', 'delivered'],
          ['09:14:41', 'hr-updates@company-hr.co', 'Q3 Bonus Review — action needed', 'Q3_Bonus.docm', 'delivered'],
        ],
        note: 'a .docm attachment from a look-alike domain. the smoking gun.',
      },
      // Base EDR — raw events across the whole host fleet.
      {
        match: /index\s*=\s*edr/i,
        columns: ['_time', 'host', 'user', 'event', 'process'],
        rows: [
          ['09:15:03', 'finance-lt-14', 'schen',   'process_start', 'OUTLOOK.EXE'],
          ['09:17:31', 'finance-lt-14', 'schen',   'process_start', 'WINWORD.EXE'],
          ['09:18:12', 'finance-lt-14', 'schen',   'process_start', 'powershell.exe'],
          ['09:22:04', 'finance-lt-14', 'schen',   'alert',         'powershell.exe'],
        ],
        note: 'showing 4 of 8,401 events. narrow with fields to find the story.',
      },
      // Base network.
      {
        match: /index\s*=\s*network/i,
        columns: ['_time', 'src', 'dest_ip', 'dest_port', 'bytes_out'],
        rows: [
          ['09:14:41', '10.10.55.14', '10.10.50.5',       '25',  '4,111'],
          ['09:18:16', '10.10.55.14', '185.243.115.84',   '443', '12,485'],
          ['09:19:35', '10.10.55.14', '185.243.115.84',   '443', '2,110'],
        ],
        note: 'showing 3 of 51,203 network events.',
      },
      // Base email.
      {
        match: /index\s*=\s*email/i,
        columns: ['_time', 'sender', 'recipient', 'subject', 'verdict'],
        rows: [
          ['09:14:41', 'hr-updates@company-hr.co', 'schen',    'Q3 Bonus Review — action needed', 'delivered'],
          ['09:14:41', 'hr-updates@company-hr.co', 'mjohnson', 'Q3 Bonus Review — action needed', 'delivered'],
          ['09:14:41', 'hr-updates@company-hr.co', 'rgarcia',  'Q3 Bonus Review — action needed', 'delivered'],
        ],
        note: 'showing 3 of 4,209 email events.',
      },
    ],
  },

  ceremony: {
    toolkit: ['siem', 'edr', 'firewall', 'ticketing'],
    target: HOST,
  },

  sections: [
    {
      id: 'what',
      title: 'What is incident response',
      blocks: [
        { h2: 'Running an incident' },
        { p: 'Incident response is the discipline of taking a suspected security event from **"something is wrong"** to **"here is what happened, it is over, and here is what changes."** It is the muscle a security team is really judged on — everything else is preparation for the day IR runs.' },
        { p: 'IR is not just technical. It is: pull the right people, capture the right evidence, make the right calls, communicate with the right words, and close the loop so the same incident cannot happen twice.' },
        { callout: 'Why pros do it: alerts fire every day. Whether an alert becomes a two-hour tune-up or a two-week board-level incident depends almost entirely on the first 30 minutes of response.' },
        { p: `Scenario: at 09:22 today an EDR alert fired on **${HOST}** (${USER}, finance) — "Suspicious PowerShell + Outbound". You are on call. Run the incident.` },
      ],
    },
    {
      id: 'frameworks',
      title: 'Frameworks (NIST, SANS, kill chain)',
      blocks: [
        { h3: 'The shared vocabulary' },
        { p: 'Two frameworks own IR pedagogy; they say the same thing with slightly different labels. Learn both because playbooks in the wild use both.' },
        {
          list: [
            '**NIST SP 800-61** — Preparation → Detection & Analysis → Containment, Eradication & Recovery → Post-Incident Activity.',
            '**SANS PICERL** — **P**reparation, **I**dentification, **C**ontainment, **E**radication, **R**ecovery, **L**essons Learned.',
          ],
        },
        { p: 'Two model-level tools give shape to the analysis inside those phases:' },
        {
          list: [
            '**Lockheed Martin Cyber Kill Chain** — Recon → Weaponize → Deliver → Exploit → Install → Command & Control → Actions on Objectives. Great for narrating "how did they get in and how far did they go."',
            '**MITRE ATT&CK** — a taxonomy of ~200 adversary techniques (T-numbers) grouped by tactic. Great for tagging *what* was observed so it can be searched, hunted, and reported consistently.',
          ],
        },
        { callout: 'These are maps, not runbooks. Every incident spends different time in each phase; the framework tells you what phase you are in, not what to type.' },
      ],
    },
    {
      id: 'preparation',
      title: 'Preparation (before it happens)',
      blocks: [
        { h3: 'The work that pays off at 3 a.m.' },
        { p: 'Nothing in the next five sections works without preparation. The prep phase is the only one where you have time; the rest happen against a clock.' },
        {
          list: [
            '**Runbooks** — one document per common alert class ("phishing with malicious attachment", "confirmed ransomware on endpoint", "credential leak on GitHub"). Each names: who leads, first three commands to run, what to preserve.',
            '**Roster** — who fills each role (incident commander, communications lead, scribe, forensics, comms) and their fallbacks. Names, phones, out-of-band contact.',
            '**Tooling readiness** — SIEM search access, EDR isolation permission, firewall block permission, evidence storage that respects chain of custody, a war-room chat channel spun up on demand.',
            '**Comms plan** — an internal-only channel that survives a compromised email tenant, plus templates for exec updates and customer notice.',
            '**Tabletop drills** — quarterly, walking through a fictional incident against the actual runbook. Catches gaps that live incidents cannot afford.',
          ],
        },
      ],
    },
    {
      id: 'triage',
      title: 'Detection: read the alert',
      blocks: [
        { h3: 'Get to the ticket that opened the incident' },
        { p: 'Detection ends where analysis begins: a specific alert on a specific host at a specific time. The first move on any IR ticket is to pull the alert itself and read every field carefully — do not skip to the pivots.' },
        { p: 'The EDR alert is in `index=edr` with a `severity` field. High-severity is what got paged.' },
        { task: 'Pull the high-severity EDR alert for schen.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*edr[\s\S]*(alert|severity)[\s\S]*(schen|finance-lt|high)/i,
        hints: [
          'Filter the EDR index to the severity level or alert flag, then to the user.',
          'index=edr severity=high user=schen',
        ],
        reveal: 'index=edr severity=high user=schen',
        explain: 'One row: 09:22:04, `finance-lt-14`, "Suspicious PowerShell + Outbound", severity high. Every field is a pivot point for the next query — remember the host, the user, and the time.',
      },
    },
    {
      id: 'severity',
      title: 'Set the severity',
      blocks: [
        { h3: 'How bad is this, right now' },
        { p: 'Severity drives everything downstream — pager, comms, executive attention, evidence effort. Most orgs use a P1–P5 rubric; a common one:' },
        {
          list: [
            '**P1 (critical)** — active compromise with material impact: data exfiltration, ransomware in progress, business-critical service down.',
            '**P2 (high)** — confirmed intrusion, contained to a small blast radius. No exfil yet observed.',
            '**P3 (medium)** — suspicious behavior with likely compromise, still investigating.',
            '**P4 (low)** — anomalous but no evidence of compromise; may be a benign edge case.',
            '**P5 (info)** — noise, likely false positive after review.',
          ],
        },
        { p: 'You have: an EDR alert, confirmed encoded PowerShell, a single user, a single host, and outbound to an unfamiliar external IP. Not yet: evidence of lateral movement, data exfil, or ransomware.' },
        { task: 'Assign a severity 1–5 (1 is highest).' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /^\s*[12]\s*$/,
        hints: [
          'Confirmed intrusion, no exfil yet, blast radius appears small.',
          'Two out of five is the usual bucket for "compromised endpoint, still contained."',
        ],
        reveal: '2',
        explain: 'P2 is the honest call. It is easy to under- or over-call this — err toward the higher severity while the scope is unknown; you can always downgrade after analysis proves containment.',
      },
    },
    {
      id: 'process-tree',
      title: 'Analysis: process tree',
      blocks: [
        { h3: 'What actually ran on the host' },
        { p: 'The single most productive move on an endpoint alert is to look at the **parent process** of the flagged process. Legitimate PowerShell has a parent like `explorer.exe`, an admin tool, or a scheduled task service. Malicious PowerShell has a parent like `WINWORD.EXE` or `OUTLOOK.EXE` — a document application spawning a script is the ATT&CK T1059 signature.' },
        { task: `Pull the powershell.exe events on ${HOST} and show the parent process.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*edr[\s\S]*host\s*=\s*finance-lt-14[\s\S]*(powershell|parent_process)/i,
        hints: [
          'Scope to the host, then to the powershell process. Pipe into `| table _time parent_process process command_line`.',
          `index=edr host=${HOST} process=powershell.exe | table _time parent_process process command_line`,
        ],
        reveal: `index=edr host=${HOST} process=powershell.exe | table _time parent_process process command_line`,
        explain: '`WINWORD.EXE → powershell.exe → rundll32.exe`, with an `-enc` (base64-encoded) command line. Word document macro → PowerShell downloader → DLL side-load. That is the initial-access playbook of half of all real-world phishing.',
      },
    },
    {
      id: 'vector',
      title: 'Analysis: how did it get in',
      blocks: [
        { h3: 'Follow the parent chain up to email' },
        { p: 'If Word spawned PowerShell, then something opened the Word document. That "something" is almost always an email. Look at the email gateway logs (`index=email`) for what schen received near 09:17.' },
        { task: 'Query the email index for schen\'s inbound mail.' },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*email[\s\S]*(schen|recipient)/i,
        hints: [
          'Switch to the email index, filter by recipient.',
          `index=email recipient=${USER}`,
        ],
        reveal: `index=email recipient=${USER}`,
        explain: `Delivered at 09:14:41 from **${PHISH_SENDER}** with attachment **Q3_Bonus.docm**. That is a look-alike domain (\`company-hr.co\` vs. \`company-hr.com\`) with a macro-enabled Word doc. Match with the process-tree: opened at 09:17, macro fired at 09:18. Root cause found.`,
      },
    },
    {
      id: 'vector-answer',
      title: 'Name the vector',
      blocks: [
        { h3: 'Say it out loud' },
        { p: 'A root-cause statement belongs in every incident ticket — one sentence, unambiguous. The rest of the report cites evidence for it.' },
        { task: 'What was the initial access vector? (one or two words)' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /(phish|email|attach|macro|docm)/i,
        hints: [
          'It came through the inbox.',
          'Delivered via email, executed by opening the attachment.',
        ],
        reveal: 'phishing email',
        explain: `Phishing email with a malicious macro (MITRE T1566.001 — spearphishing attachment). Domain \`company-hr.co\` is a typo-squat of your real HR domain; the .docm dropped and executed PowerShell.`,
      },
    },
    {
      id: 'c2',
      title: 'Analysis: find the C2',
      blocks: [
        { h3: 'Where is it calling out to' },
        { p: 'Every stager that survives the first minute has to phone home. The proxy or firewall log (`index=network`) will show outbound sessions from the host; a compromised endpoint typically beacons to a single external IP on 443 at a steady cadence.' },
        { task: `Show outbound network events from ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*network[\s\S]*(finance-lt-14|10\.10\.55\.14)/i,
        hints: [
          'Switch to the network index, filter to the source host or its IP.',
          `index=network src=${HOST}`,
          `index=network src=${HOST_IP}`,
        ],
        reveal: `index=network src=${HOST}`,
        explain: `Four connections to **${C2}:443** across three minutes, small and steady bytes-out — classic C2 heartbeat, not a real browser session. Your key IOC is that IP.`,
      },
    },
    {
      id: 'scope',
      title: 'Analysis: scope the incident',
      blocks: [
        { h3: 'Who else got the email' },
        { p: 'A single-host alert does not mean a single-host incident. Two scoping questions must be answered before you contain: **did anyone else receive the phish**, and **did any other host beacon to the C2**? Answer both and you have a real perimeter.' },
        { task: `Count how many recipients received email from ${PHISH_SENDER}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*email[\s\S]*sender[\s\S]*\|\s*stats\s+count\s+by\s+recipient/i,
        hints: [
          'Filter email by sender, then aggregate.',
          `index=email sender="${PHISH_SENDER}" | stats count by recipient`,
        ],
        reveal: `index=email sender="${PHISH_SENDER}" | stats count by recipient`,
        explain: 'Three recipients: schen (compromised), mjohnson, rgarcia. Two other inboxes are carrying the same phish — remove the message before someone else clicks. (Do the same query pattern on network to confirm no other host beaconed — the C2 was reached only from 10.10.55.14.)',
      },
    },
    {
      id: 'contain',
      title: 'Containment principles',
      blocks: [
        { h3: 'Short-term vs long-term' },
        { p: 'Containment stops the bleeding without destroying evidence. It is the phase where speed matters most and where over-eager cleanup destroys the very artifacts you need for eradication and legal defensibility.' },
        {
          list: [
            '**Short-term containment** — isolate the host at the network layer (EDR "contain" action, or firewall ACL) so it can no longer reach C2 or peers. Do **not** shut down or reimage yet — memory forensics needs it live.',
            '**Long-term containment** — remove IOCs at every enforcement point (firewall, email gateway, DNS sinkhole), rotate any credentials the host could have seen, and stage the eventual clean rebuild.',
            '**Preserve while you contain** — snapshot the VM if virtual, image the disk and memory if physical, hash and store the malicious attachment and dropper.',
            '**Blast-radius check first** — a rushed containment on the wrong host tips the adversary off; a slow one lets them exfil. Read the scope query before you act.',
          ],
        },
        { callout: 'The most expensive containment mistake is powering the box off. You lose volatile memory, running processes, and any encryption keys held in RAM — often the only evidence of what the operator actually did.' },
      ],
    },
    {
      id: 'isolate',
      title: 'Containment: isolate',
      blocks: [
        { h3: 'Pick the host' },
        { p: 'You now know exactly one endpoint is beaconing and exactly one user is compromised. Name the host you push the EDR "isolate" action against.' },
        { task: 'Which host do you isolate?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /(finance-lt-14|10\.10\.55\.14)/i,
        hints: [
          'It is the only host with outbound to the C2.',
          'The one the alert names.',
        ],
        reveal: HOST,
        explain: `Right — ${HOST} (${HOST_IP}). Push the EDR isolate action, which lets the EDR agent keep talking to you but blocks all other network access. The box stays live for forensics; the C2 loses its client.`,
      },
    },
    {
      id: 'block',
      title: 'Containment: block the IOC',
      blocks: [
        { h3: 'Kill the callback everywhere' },
        { p: 'Isolation stops one host from reaching the C2. Blocking the IOC at the perimeter stops any *other* host — infected or not, now or in the future — from reaching it too. Name the network IOC.' },
        { task: 'Which IP do you block at the firewall / proxy?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /185\.243\.115\.84/,
        hints: [
          'The destination the beacon called out to.',
          'It is the external IP in the network query.',
        ],
        reveal: C2,
        explain: `Block ${C2} outbound at the firewall and add a proxy DENY. Also sinkhole any DNS that resolves to it. In the same window: remove the phish from mjohnson and rgarcia\'s inboxes (email gateway "delete after delivery"), and add ${PHISH_SENDER} to the block list.`,
      },
    },
    {
      id: 'eradicate',
      title: 'Eradication',
      blocks: [
        { h3: 'Remove the foothold, not just the alert' },
        { p: 'Eradication is where teams get sloppy. The alert stops firing after isolate + IOC block — but any persistence the operator dropped survives the reboot. Every serious intrusion plants at least one autorun (scheduled task, run key, service, startup shortcut, WMI subscription). Find them before you decide what "clean" means.' },
        { task: `Query the EDR for scheduled tasks or persistence events on ${HOST}.` },
      ],
      checkpoint: {
        via: 'stage',
        expect: /index\s*=\s*edr[\s\S]*finance-lt-14[\s\S]*(scheduled_task|persistence|autorun)/i,
        hints: [
          'Scope to the host, then filter for a persistence-flavored event type.',
          `index=edr host=${HOST} event=scheduled_task_created`,
        ],
        reveal: `index=edr host=${HOST} event=scheduled_task_created`,
        explain: 'A scheduled task named "MicrosoftEdgeUpdaterCore" was created at 09:18:20 — deliberately masquerading as a legitimate updater, actually running the same rundll32 loader. If you had wiped the network artifacts and left the disk, this task would re-establish C2 the moment isolation ended.' + ' The safe path here is a full **wipe and reimage**, plus a credential reset for schen (the operator may have scraped tokens).',
      },
    },
    {
      id: 'recover',
      title: 'Recovery',
      blocks: [
        { h3: 'Return to service, carefully' },
        { p: 'Recovery is not "reimage and done." It is: get the user productive again, prove the environment is clean, and hunt for reinfection until you are confident it will not come back.' },
        {
          list: [
            '**Rebuild from a known-good image** — never from a snapshot taken during the incident.',
            '**Rotate credentials** — the user\'s password, any SSO refresh tokens, MFA-bypass keys, and any service accounts the host could have reached. Kill live sessions.',
            '**Restore data** — from backup, not from the compromised disk. Verify integrity (hashes).',
            '**Watch for a week** — set a hunting task: any inbound-to-C2 attempts, any new persistence on the rebuilt host, any similar TTPs from the operator on other hosts.',
            '**Exit criteria** — write down before recovery what "clean" looks like. Do not sign off on gut feeling.',
          ],
        },
      ],
    },
    {
      id: 'lessons',
      title: 'Lessons learned',
      blocks: [
        { h3: 'The postmortem is the deliverable' },
        { p: 'Every incident produces two things: a resolved ticket and a set of durable changes. The changes are what pay for the incident.' },
        {
          list: [
            '**Blameless postmortem** — actions and gaps, not people. "The runbook did not cover X" and "The detection missed Y" — not "Sarah should not have clicked."',
            '**Timeline** — first observed → first alerted → first responded → contained → eradicated → recovered. These durations become MTTD/MTTR for the next quarter\'s review.',
            '**Playbook updates** — every trick the adversary used becomes a runbook step for next time.',
            '**Detection engineering** — the specific TTP gets a new rule (e.g., "WINWORD.EXE parent → powershell.exe with `-enc` → auto-isolate").',
            '**Preventive controls** — email filter rule for the look-alike domain, macro-execution policy, EDR contain-on-first-hit.',
            '**Share** — a sanitized summary to peer teams / ISAC / IR mailing lists. Everyone benefits from the shape of the attack.',
          ],
        },
        { task: 'Given the timeline (email 09:14, macro at 09:18, alert at 09:22), the C2 had ~4 minutes uncontested. What one high-leverage detection rule should the postmortem add?' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /(winword|office|word).*powershell|powershell.*(winword|office|word)|encoded|-enc|auto-isolate/i,
        hints: [
          'The parent-process pattern that made this incident readable.',
          '"Office application spawns PowerShell with `-enc`" as an EDR auto-isolate rule.',
        ],
        reveal: 'auto-isolate on WINWORD/OUTLOOK → powershell.exe with -enc',
        explain: 'The parent-child pattern is unambiguous: no legitimate workflow has Word or Outlook spawn an encoded PowerShell. Turning that into an auto-isolate rule would have contained the same incident in under 30 seconds instead of 4 minutes — the ROI on writing that rule is exactly why the postmortem happens.',
      },
    },
    {
      id: 'comms',
      title: 'Communications',
      blocks: [
        { h3: 'Words are half the incident' },
        { p: 'The technical response is happening in parallel with a communications response. Bad comms turns a P2 into a P1 in the news; good comms buys the engineers time.' },
        {
          list: [
            '**Incident commander (IC)** — one person owns the incident. Every decision passes through them; they do not touch keyboards.',
            '**Scribe** — a dedicated person captures every command run, every decision made, every timestamp. Real-time note-taking; the record is the audit trail.',
            '**Comms lead** — the only person talking to non-responders. Cadence: every 30 minutes to execs during active response; end-of-incident summary within 24h.',
            '**Legal & privacy** — looped in the moment personal data is possibly involved. They own the regulatory clock (GDPR 72h, state breach laws).',
            '**Users** — inform mjohnson and rgarcia immediately: "you received a malicious email; do not open the attachment; we already removed it."',
            '**Executives** — get **facts and unknowns**, not speculation. "Confirmed compromise of one endpoint. No evidence of exfil or lateral movement. Contained at 09:38. Investigation continues."',
            '**Regulators / customers** — only after legal has read the disclosure text. Templates exist in the prep phase.',
            '**Out-of-band channel** — assume the corporate email tenant may be compromised. IR runs on a separate chat/pager stack (Signal group, dedicated Slack workspace on a different tenant).',
          ],
        },
        { callout: 'A common bad habit: writing timelines in past tense, in emails, from memory, at the end. Write them in present tense, in the ticket, in real time, as the scribe. Memory is worthless in court.' },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced techniques (reference)',
      blocks: [
        { h3: 'Depth you will want on a real one' },
        { p: '**Timeline building** — a super-timeline (Plaso `log2timeline` → `psort`) fuses filesystem MFT, registry, event logs, browser history, prefetch, and shell bags into a single timestamped stream. It is the artifact that turns "we think it started around 09:18" into "it started at 09:17:52.331 with the following file writes."' },
        { code: 'log2timeline.py --parsers "win7,webhist" host.plaso disk.raw\npsort.py -o l2tcsv host.plaso "date > \'2026-06-30\'"' },
        { p: '**Memory forensics** — Volatility 3 against a memory dump gives you: running processes at the moment of capture, network sockets, injected code, kernel hooks, and often the plaintext of encryption keys the operator was holding. Grab memory **before** isolation ends network access if possible.' },
        { code: 'vol -f mem.raw windows.pslist\nvol -f mem.raw windows.malfind\nvol -f mem.raw windows.netscan' },
        { p: '**Chain of custody** — evidence that might touch a courtroom or an insurance claim needs an unbroken record: who acquired it, when, from where, hashed with what algorithm, stored where, accessed by whom. A hash mismatch anywhere in that chain is disqualifying.' },
        { p: '**MITRE ATT&CK mapping** — tag every observed behavior with a T-number in the ticket. This incident, roughly:' },
        {
          list: [
            'T1566.001 — Spearphishing Attachment',
            'T1204.002 — User Execution: Malicious File',
            'T1059.001 — Command and Scripting Interpreter: PowerShell',
            'T1055 — Process Injection (via rundll32 side-load)',
            'T1053.005 — Scheduled Task/Job for persistence',
            'T1071.001 — Application Layer Protocol: Web Protocols (HTTPS C2)',
          ],
        },
        { p: '**Threat intelligence** — every IOC (IP, domain, hash, TTP) gets checked against internal threat-intel feeds and external ones (MISP, ThreatConnect, VirusTotal). A hit tells you which campaign or actor, which changes the containment tempo.' },
        { p: '**DFIR retainer** — most orgs cannot staff a 24×7 forensics + IR team. A retained partner (Mandiant, CrowdStrike Services, Kroll, Unit 42) is called in on P1s: their playbooks, their tooling, your context. Pre-signed contracts save days when the day comes.' },
        { p: '**Purple-team feedback loop** — every incident\'s TTPs go into the next red-team exercise as attempted attacks; every one the blue team catches becomes a confirmed detection. IR informs offense, and offense proves detection.' },
        { callout: 'The best IR teams look bored at 3 a.m. Most of the work happens between incidents.' },
      ],
    },
    {
      id: 'verdict',
      title: 'Close the incident',
      blocks: [
        { h3: 'Sign off' },
        { p: 'Isolated host, blocked IOC, removed persistence, rotated credentials, deleted phish from other inboxes, drafted postmortem, added detection rule, updated email filter. The system meets your exit criteria.' },
        { task: 'Was this a real incident (not a false positive)? (yes / no)' },
      ],
      checkpoint: {
        via: 'answer',
        accept: /^\s*y(es)?\s*$/i,
        hints: ['Confirmed encoded PowerShell, confirmed C2, confirmed persistence.'],
        reveal: 'yes',
        explain: 'Yes. Close the ticket with a P2 verdict, a linked postmortem, and follow-up work items for detection engineering, email filtering, and user awareness. You ran the whole lifecycle — that is incident response.',
      },
    },
  ],
};

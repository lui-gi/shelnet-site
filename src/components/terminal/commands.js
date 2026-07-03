// src/components/terminal/commands.js
// The lobby shell's global command parser: help, clear, list, load, exit. Pure
// over the registry + manifest + a progress store (passed in). Returns output
// lines plus an optional action the caller performs: clear the buffer, load a
// module (the caller resolves /modules/<slug>), or navigate (for a
// foundation primer handoff to the visualizations viewer).
import { getModule, getCategoryListing, getFoundation } from '../../config/moduleRegistry';

const line = (text, tone = 'out') => ({ text, tone });

function help() {
  return [
    line('commands:', 'sys'),
    line('  help            show this help'),
    line('  list            list categories and modules'),
    line('  load <module>   open a module room (e.g. load enumeration)'),
    line('  clear           clear the screen'),
    line('  exit            leave a room (when inside one)'),
  ];
}

// Marker + trailing note for a module given its progress entry.
function statusMarks(m, entry) {
  if (m.status === 'soon') return { mark: 'o', note: '  (soon)', tone: 'sys' };
  if (m.status === 'primer') return { mark: 'o', note: '  (primer)', tone: 'sys' };
  if (entry?.status === 'complete') return { mark: '+', note: '  (complete)', tone: 'ok' };
  if (entry?.status === 'in-progress') {
    const frac = entry.total ? ` ${entry.section ?? 0}/${entry.total}` : '';
    return { mark: '>', note: `  (resume${frac})`, tone: 'accent' };
  }
  return { mark: 'o', note: '', tone: 'out' };
}

function list(manifest, store = {}) {
  const out = [line('available modules:', 'sys')];
  getCategoryListing(manifest).forEach((cat) => {
    if (!cat.modules.length) return;
    out.push(line(''));
    out.push(line(`${cat.id}/`, 'accent'));
    cat.modules.forEach((m) => {
      const { mark, note, tone } = statusMarks(m, store[m.slug]);
      out.push(line(`  ${mark} ${m.slug.padEnd(24)} ${m.name}${note}`, tone));
    });
  });
  out.push(line(''));
  out.push(line('open one with:  load <name>   ·   + done   > in progress   o todo', 'sys'));
  return out;
}

export function runCommand(input, manifest, store = {}) {
  const raw = input.trim();
  if (!raw) return { lines: [] };
  const [cmd, ...rest] = raw.split(/\s+/);
  const arg = rest.join(' ');

  switch (cmd) {
    case 'help':
      return { lines: help() };
    case 'clear':
      return { lines: [], action: { type: 'clear' } };
    case 'list':
      return { lines: list(manifest, store) };
    case 'load': {
      if (!arg) return { lines: [line('usage: load <module>   (try `list`)', 'warn')] };
      const mod = getModule(arg);
      if (mod && mod.status === 'live') return { lines: [], action: { type: 'load', module: mod } };
      if (mod && mod.status === 'soon') {
        return { lines: [
          line(`${mod.name} is not yet available.`, 'warn'),
          line(`  ${mod.blurb}`, 'sys'),
        ] };
      }
      const found = getFoundation(manifest, arg);
      if (found) {
        return {
          lines: [line(`opening ${found.title}…`, 'sys')],
          action: { type: 'navigate', to: `/visualizations?m=${found.id}` },
        };
      }
      return { lines: [line(`command not found: load ${arg}   (try \`list\`)`, 'err')] };
    }
    case 'exit':
    case 'back':
      return { lines: [line('not in a room. try `list`.', 'sys')] };
    default:
      return { lines: [line(`command not found: ${cmd}   (try \`help\`)`, 'err')] };
  }
}

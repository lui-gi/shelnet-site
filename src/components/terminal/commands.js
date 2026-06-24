// src/components/terminal/commands.js
// The shell's global command parser: help, clear, list, load, exit. Pure over the
// registry + manifest. Returns output lines plus an optional action the Terminal
// performs (clear the buffer, load a module, or navigate for a foundation).
import { getModule, getTrackListing, getFoundation } from '../../config/moduleRegistry';

const line = (text, tone = 'out') => ({ text, tone });

function help() {
  return [
    line('commands:', 'sys'),
    line('  help            show this help'),
    line('  list            list tracks and modules'),
    line('  load <module>   start a module (e.g. load splunk-queries)'),
    line('  clear           clear the screen'),
    line('  exit            leave a module (when inside one)'),
  ];
}

function list(manifest) {
  const out = [line('available modules:', 'sys')];
  getTrackListing(manifest).forEach((t) => {
    out.push(line(''));
    out.push(line(`${t.label.toLowerCase().replace(/[^a-z]+/g, '-')}/`, 'accent'));
    if (!t.modules.length) { out.push(line('  (loading…)', 'sys')); return; }
    t.modules.forEach((m) => {
      const tag = m.status === 'live' ? '●' : m.status === 'foundation' ? '◆' : '○';
      const note = m.status === 'soon' ? '  (soon)' : '';
      out.push(line(`  ${tag} ${m.slug.padEnd(22)} ${m.name}${note}`, m.status === 'soon' ? 'sys' : 'out'));
    });
  });
  out.push(line(''));
  out.push(line('start one with:  load <name>', 'sys'));
  return out;
}

export function runCommand(input, manifest) {
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
      return { lines: list(manifest) };
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
          action: { type: 'navigate', to: `/resources/visualizations?m=${found.id}` },
        };
      }
      return { lines: [line(`command not found: load ${arg}   (try \`list\`)`, 'err')] };
    }
    case 'exit':
    case 'back':
      return { lines: [line('not in a module. try `list`.', 'sys')] };
    default:
      return { lines: [line(`command not found: ${cmd}   (try \`help\`)`, 'err')] };
  }
}

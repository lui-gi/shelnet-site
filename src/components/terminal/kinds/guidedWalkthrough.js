// Runner for status:'live' modules whose def is a scripted, step-by-step lesson.
// The engine calls init() once when the module loads, then onInput() per submitted
// line. Contract: init(module) -> { lines, state }; onInput(input, state, module)
// -> { lines, state, done? }. module.def is the loaded definition (config/modules/*).
// State shape: { step: number }.

const norm = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();

function stepLines(def, step) {
  const s = def.steps[step];
  return [
    { text: `[${step + 1}/${def.steps.length}] ${s.prompt}`, tone: 'accent' },
    { text: '  (type your answer, or `h` for a hint)', tone: 'sys' },
  ];
}

export function init(module) {
  const def = module.def;
  return {
    state: { step: 0 },
    lines: [
      ...def.intro.map((text) => ({ text, tone: 'out' })),
      { text: '', tone: 'out' },
      ...stepLines(def, 0),
    ],
  };
}

export function onInput(input, state, module) {
  const def = module.def;

  // Lesson already finished: only `exit` (handled by the engine) leaves.
  if (state.step >= def.steps.length) {
    return { state, done: true, lines: [{ text: 'lesson complete; type `exit` to return.', tone: 'sys' }] };
  }

  const step = def.steps[state.step];
  const cmd = norm(input);

  if (cmd === 'h' || cmd === 'hint') {
    return { state, lines: [{ text: `hint: ${step.hint}`, tone: 'sys' }] };
  }

  const ok = step.accept instanceof RegExp ? step.accept.test(input) : norm(step.accept) === cmd;
  if (!ok) {
    return { state, lines: [{ text: 'not quite; try again (h for hint)', tone: 'warn' }] };
  }

  const body = [
    ...step.success.map((text) => ({ text, tone: 'accent' })),
    { text: `ok  ${step.explain}`, tone: 'ok' },
  ];
  const next = state.step + 1;
  if (next >= def.steps.length) {
    return {
      done: true,
      state: { step: next },
      lines: [...body, { text: '', tone: 'out' }, ...def.outro.map((text) => ({ text, tone: 'sys' }))],
    };
  }
  return {
    state: { step: next },
    lines: [...body, { text: '', tone: 'out' }, ...stepLines(def, next)],
  };
}

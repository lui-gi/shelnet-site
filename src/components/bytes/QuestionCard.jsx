// src/components/bytes/QuestionCard.jsx
// Presentational bytes question card: stem, tap-to-answer choices, instant
// reveal coloring, and the explanation. Quiz state is owned by the runner;
// this component is pure props.
import { Panel, Rule } from '../tui/ascii';
import { ACCENTS, SHELL } from '../../config/theme';

const GREEN = SHELL.green;
const CORRECT = SHELL.green;
const WRONG = ACCENTS.red.hex;

const QuestionCard = ({ title, tally, hex, q, answered, selected, onAnswer, onSkip, onNext }) => {
  const isCorrect = (i) => Array.isArray(q.correct) && q.correct.includes(i);
  return (
    <Panel
      hex={hex}
      title={<span className="text-white/80">{title}</span>}
      right={<span className="text-white/50">{tally}</span>}
    >
      <div className="py-1">
        {q.domain && <div className="text-xs uppercase tracking-wide text-white/40">{q.domain}</div>}
        <div className="mt-2 text-white/90">
          <span style={{ color: hex }}>Q. </span>{q.stem}
        </div>

        <div className="mt-3 space-y-1.5">
          {q.choices.map((choice, i) => {
            const picked = selected === i;
            const right = answered && isCorrect(i);
            const wrongPick = answered && picked && !isCorrect(i);
            const color = right ? CORRECT : wrongPick ? WRONG : undefined;
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => onAnswer(i)}
                className={`flex w-full items-start gap-3 rounded px-2 py-2 text-left transition-colors ${answered ? 'cursor-default' : 'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/50'}`}
              >
                <span className="shrink-0" style={{ color: color || GREEN }}>{i + 1}</span>
                <span className="flex-1" style={color ? { color } : undefined}>
                  <span className={color ? '' : 'text-white/85'}>{choice}</span>
                </span>
                {right && <span className="shrink-0 text-xs" style={{ color: CORRECT }}>{'✓'} correct</span>}
                {wrongPick && <span className="shrink-0 text-xs" style={{ color: WRONG }}>{'✗'} you</span>}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-3">
            <Rule hex="rgba(255,255,255,0.18)" />
            <div className="mt-2 text-white/70">
              <span style={{ color: hex }}>{'›'} </span>{q.explanation}
            </div>
          </div>
        )}

        <div className="mt-3 text-white/40">
          {answered ? (
            <button type="button" onClick={onNext} className="hover:text-white">
              <span style={{ color: GREEN }}>{'↵'}</span> next
            </button>
          ) : (
            <button type="button" onClick={onSkip} className="hover:text-white">
              <span style={{ color: GREEN }}>s</span> skip
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
};

export default QuestionCard;

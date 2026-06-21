// src/pages/bytes-quiz.jsx
// bytes endless quiz runner for /bytes/:cert. Fetches the cert's question bank,
// serves a reshuffled stream one question at a time with instant feedback, a
// session-only tally, and a skip. Nothing is persisted.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import QuestionCard from '../components/bytes/QuestionCard';
import { useBytesBank } from '../utils/useBytesBank';
import { useManifest } from '../utils/useManifest';
import { getBytesCerts } from '../utils/manifestService';
import { shuffle } from '../utils/bytesService';
import { ACCENTS, SHELL } from '../config/theme';

const GREEN = SHELL.green;
const hexOf = (accent) => (ACCENTS[accent] || ACCENTS.green).hex;

// Inner runner: receives cert from props so useBytesBank is always called with a
// stable slug. The wrapper below keys this component by cert, giving a fresh
// mount (and fresh hook state) whenever the cert param changes.
const BytesQuizInner = ({ cert }) => {
  const navigate = useNavigate();
  const { bank, loading, error } = useBytesBank(cert);
  const { manifest } = useManifest();

  // Accent comes from the manifest cert metadata; falls back to green.
  const meta = manifest ? getBytesCerts(manifest).find((b) => b.slug === cert) : null;
  const hex = hexOf(meta?.accent);

  const [queue, setQueue] = useState([]);
  const [bankRef, setBankRef] = useState(null);
  const [pos, setPos] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [seen, setSeen] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Build the shuffled queue once the bank arrives. Done at render time to avoid
  // the react-hooks/set-state-in-effect rule (setting state synchronously inside
  // useEffect is flagged by the React-Compiler eslint rules active in this repo).
  if (bank && bank !== bankRef) {
    setBankRef(bank);
    setQueue(shuffle(bank.questions));
    setPos(0); setAnswered(false); setSelected(null); setSeen(0); setCorrect(0);
  }

  const current = queue[pos] || null;

  const answer = useCallback((i) => {
    if (answered || !current) return;
    setSelected(i);
    setAnswered(true);
    setSeen((n) => n + 1);
    if (Array.isArray(current.correct) && current.correct.includes(i)) setCorrect((n) => n + 1);
  }, [answered, current]);

  const advance = useCallback(() => {
    setAnswered(false);
    setSelected(null);
    if (pos + 1 >= queue.length) {
      setQueue(shuffle(queue));
      setPos(0);
    } else {
      setPos(pos + 1);
    }
  }, [pos, queue]);

  // Keyboard: 1-9 answer, s skip, enter/n next, esc back to /bytes.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/bytes'); return; }
      if (!current) return;
      if (!answered && /^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < current.choices.length) { e.preventDefault(); answer(i); }
      } else if (!answered && (e.key === 's' || e.key === 'S')) {
        e.preventDefault(); advance();
      } else if (answered && (e.key === 'Enter' || e.key === 'n' || e.key === 'N')) {
        e.preventDefault(); advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, answered, answer, advance, navigate]);

  if (loading) {
    return <TerminalShell><div className="font-mono text-sm text-white/50">{'…'} fetching questions</div></TerminalShell>;
  }
  if (error || !bank || !bank.questions.length) {
    return (
      <TerminalShell>
        <div className="font-mono text-sm">
          <div className="text-rose-400">! no questions for {'"'}{cert}{'"'}.</div>
          <div className="mt-2 text-white/40">
            <button type="button" onClick={() => window.location.reload()} style={{ color: GREEN }} className="hover:underline">{'↵'} retry</button>
            &nbsp;&middot;&nbsp;
            <button type="button" onClick={() => navigate('/bytes')} style={{ color: GREEN }} className="hover:underline">esc bytes</button>
          </div>
        </div>
      </TerminalShell>
    );
  }
  if (!current) {
    return <TerminalShell><div className="font-mono text-sm text-white/50">{'…'} shuffling</div></TerminalShell>;
  }

  const tally = `${correct}/${seen} ✓`;

  return (
    <TerminalShell maxWidthClass="max-w-2xl">
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/40 mb-4">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~/bytes/{cert}</span>$ ./quiz
        </div>
        <QuestionCard
          title={`bytes/${cert}`}
          tally={tally}
          hex={hex}
          q={current}
          answered={answered}
          selected={selected}
          onAnswer={answer}
          onSkip={advance}
          onNext={advance}
        />
      </div>
    </TerminalShell>
  );
};

// Thin wrapper: sources cert from useParams and keys BytesQuizInner by cert so
// the inner component (and its hooks) remount cleanly on cert changes.
const BytesQuiz = () => {
  const { cert } = useParams();
  return <BytesQuizInner key={cert} cert={cert} />;
};

export default BytesQuiz;

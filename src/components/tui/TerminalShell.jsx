// src/components/tui/TerminalShell.jsx
// The continuous-terminal shell shared by every resource route. Reproduces the
// bottom of the hero (bright glowing figlet -> `shelnet login: guest` -> command
// line -> output -> trailing prompt with a `cd ~` exit) so each page reads as the
// same TTY scrolled forward. The banner + glow-green background match the hero
// exactly. The router stays flat; breadcrumb segments link via resourcePaths.
import { Link, useNavigate } from 'react-router-dom';
import { ASCII_BANNER, SHELL } from '../../config/theme';
import { themeColors } from '../../config/themeColors';
import { routeForSegments } from '../../config/resourcePaths';

/**
 * @param {string[]} cwd            filesystem segments under ~ (e.g. ['resources','pbqs','a-plus']).
 *                                  When non-empty the command line renders `cd /<cwd> && <listCmd>`
 *                                  with earlier segments linked and the last tinted by `accent`.
 * @param {string}   accent         theme color key (cert color of the current location)
 * @param {string}   listCmd        trailing command when cwd is set (default 'ls')
 * @param {string}   command        freeform command when cwd is omitted (e.g. 'cat about.md')
 * @param {string}   maxWidthClass  Tailwind max-width for the content column
 * @param {ReactNode} children      page body (the output)
 */
const TerminalShell = ({
  cwd = [], accent = 'green', listCmd = 'ls', command,
  maxWidthClass = 'max-w-4xl', children,
}) => {
  const navigate = useNavigate();
  const colors = themeColors[accent] || themeColors.green;

  return (
    <div className="min-h-screen px-6 pt-14 pb-16 glow-green">
      <div className={`mx-auto ${maxWidthClass} font-mono text-sm md:text-base`}>
        <pre aria-label="shelnet"
             className="mb-3 whitespace-pre text-[8px] leading-[1.1] sm:text-xs md:text-sm"
             style={{ color: SHELL.green, textShadow: '0 0 8px rgba(52,211,153,.28)' }}>{ASCII_BANNER}</pre>

        <div className="text-white/45">
          shelnet login: <span style={{ color: SHELL.dim }}>guest</span>
        </div>

        <div className="mt-0.5" aria-label="current location">
          <span className="text-white/60">guest@shelnet:~$</span>{' '}
          {cwd.length > 0 ? (
            <>
              <span className="text-white/70">cd /</span>
              {cwd.map((seg, i) => {
                const last = i === cwd.length - 1;
                return (
                  <span key={i}>
                    {i > 0 && <span className="text-white/30">/</span>}
                    {last
                      ? <span className={colors.text}>{seg}</span>
                      : <Link to={routeForSegments(cwd.slice(0, i + 1))}
                              className="text-white/50 hover:text-white">{seg}</Link>}
                  </span>
                );
              })}
              <span className="text-white/70"> &amp;&amp; {listCmd}</span>
            </>
          ) : (
            <span className="text-white/70">{command}</span>
          )}
        </div>

        <div className="mt-3">{children}</div>

        <div className="mt-6 text-white/55">
          <span className="text-white/60">guest@shelnet:~$</span>{' '}
          <button type="button" onClick={() => navigate('/')}
            className="text-white/45 transition-colors hover:text-[#43c08c] focus-visible:text-[#43c08c] focus-visible:outline-none">
            cd ~
          </button>
          <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse reduce-static"
                style={{ backgroundColor: SHELL.green }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default TerminalShell;

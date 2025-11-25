import { useState, useEffect, useRef } from 'react'
import { commands, introText } from '../constants/commands'

function Terminal() {
  const [idx, setIdx] = useState(0)
  const [char, setChar] = useState(0)
  const [phase, setPhase] = useState('type')
  const [cooldown, setCooldown] = useState(0)
  const [typed, setTyped] = useState('')
  const [output, setOutput] = useState('')
  const termBodyRef = useRef(null)
  const terminalRef = useRef(null)
  const stateRef = useRef({ idx: 0, char: 0, phase: 'type', cooldown: 0, frame: 0 })
  const TYPE_EVERY = 3

  // Lock terminal height on mount
  useEffect(() => {
    const term = termBodyRef.current
    if (!term) return

    const probe = term.cloneNode(false)
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    probe.style.pointerEvents = 'none'
    probe.style.height = 'auto'
    probe.style.maxHeight = 'none'
    probe.style.overflow = 'visible'

    const preIntro = document.createElement('pre')
    preIntro.className = 'text-theme-muted'
    preIntro.innerHTML = introText
    probe.appendChild(preIntro)

    const longestCmd = commands.reduce((a, b) => (b.cmd.length > a.length ? b.cmd : a), '')
    const line = document.createElement('div')
    line.innerHTML = `<span class="text-[#cfcfd6]">shelnet@studio</span>:<span class="text-theme-muted">~</span>$ <span class="text-white">${longestCmd.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`
    probe.appendChild(line)

    const longestOut = commands.reduce((a, b) => (b.out && b.out.length > a.length ? b.out : a), '')
    const preOut = document.createElement('pre')
    preOut.className = 'text-theme-muted'
    preOut.style.margin = '10px 0 0 0'
    preOut.textContent = longestOut
    probe.appendChild(preOut)

    document.body.appendChild(probe)
    const needed = Math.ceil(probe.scrollHeight) + 48
    document.body.removeChild(probe)
    term.style.height = Math.max(needed, 340) + 'px'
  }, [])

  // Sync ref with state
  useEffect(() => {
    stateRef.current = { idx, char, phase, cooldown, frame: stateRef.current.frame }
  }, [idx, char, phase, cooldown])

  // Animation loop
  useEffect(() => {
    let animationFrameId

    function tick() {
      const state = stateRef.current
      const current = commands[state.idx]

      if (state.phase === 'type') {
        const newFrame = state.frame + 1
        stateRef.current.frame = newFrame
        if (newFrame % TYPE_EVERY === 0) {
          const newChar = state.char + 1
          setChar(newChar)
          setTyped(current.cmd.slice(0, newChar))
          stateRef.current.char = newChar
        }

        if (state.char >= current.cmd.length) {
          setPhase('wait')
          setCooldown(30)
          stateRef.current.phase = 'wait'
          stateRef.current.cooldown = 30
        }
      } else if (state.phase === 'wait') {
        const newCooldown = state.cooldown - 1
        setCooldown(newCooldown)
        stateRef.current.cooldown = newCooldown
        if (newCooldown <= 0) {
          setPhase('print')
          setOutput('')
          stateRef.current.phase = 'print'
        }
      } else if (state.phase === 'print') {
        setOutput(current.out)
        setPhase('done')
        setCooldown(120)
        stateRef.current.phase = 'done'
        stateRef.current.cooldown = 120
      } else if (state.phase === 'done') {
        const newCooldown = state.cooldown - 1
        setCooldown(newCooldown)
        stateRef.current.cooldown = newCooldown
        if (newCooldown <= 0) {
          const newIdx = (state.idx + 1) % commands.length
          setIdx(newIdx)
          setChar(0)
          setPhase('type')
          setOutput('')
          setTyped('')
          stateRef.current.idx = newIdx
          stateRef.current.char = 0
          stateRef.current.phase = 'type'
          stateRef.current.frame = 0
        }
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Overflow detection
  useEffect(() => {
    const termBody = termBodyRef.current
    const terminal = terminalRef.current
    if (!termBody || !terminal) return

    function checkOverflow() {
      const overflow = termBody.scrollHeight > termBody.clientHeight + 1
      const atTop = termBody.scrollTop <= 0
      const atBottom = termBody.scrollTop + termBody.clientHeight >= termBody.scrollHeight - 1

      terminal.classList.toggle('overflowing', overflow)
      terminal.classList.toggle('at-top', atTop)
      terminal.classList.toggle('at-bottom', atBottom)
      terminal.classList.toggle('show-hint', overflow && atTop)
    }

    termBody.addEventListener('scroll', checkOverflow)
    window.addEventListener('resize', checkOverflow)
    checkOverflow()

    return () => {
      termBody.removeEventListener('scroll', checkOverflow)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [])

  // Auto-scroll on output change
  useEffect(() => {
    if (termBodyRef.current && output) {
      termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight
    }
  }, [output])

  return (
    <div 
      ref={terminalRef}
      className="bg-gradient-to-b from-[#1d1d20] to-[#17171a] border border-theme-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-theme-border bg-[#151518]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c31]"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c31]"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c31]"></span>
        <span className="text-theme-muted ml-2">bash — <span className="text-[#cfcfd6]">shelnet@studio</span></span>
      </div>
      <div 
        ref={termBodyRef}
        className="p-3 overflow-auto text-sm leading-[1.35]"
      >
        <pre 
          className="text-theme-muted"
          dangerouslySetInnerHTML={{ __html: introText }}
        ></pre>
        <div>
          <span className="text-[#cfcfd6]">shelnet@studio</span>:<span className="text-theme-muted">~</span>$ <span className="text-white">{typed}</span>
          <span className="inline-block w-2 h-[1.1em] bg-theme-ink ml-0.5 animate-blink"></span>
        </div>
        {output && (
          <pre className="text-theme-muted mt-2.5 mb-0">{output}</pre>
        )}
      </div>
    </div>
  )
}

export default Terminal


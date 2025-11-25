import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

function PBQs() {
  const [data, setData] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedDomain, setSelectedDomain] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewerTitle, setViewerTitle] = useState('Select a PBQ to begin')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const viewerRef = useRef(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('[PBQs] Component mounted')
    return () => {
      console.log('[PBQs] Component unmounting')
    }
  }, [])

  // Reset and load data when component mounts
  useEffect(() => {
    let isMounted = true
    
    // Reset state
    setIsLoading(true)
    setData([])
    setFiltered([])
    setActiveIndex(-1)
    setSelectedDomain('')
    setViewerTitle('Select a PBQ to begin')
    
    async function loadManifest() {
      try {
        setError(null)
        const res = await fetch('/assets/pbqs.json')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        const json = await res.json()
        
        if (isMounted) {
          if (Array.isArray(json) && json.length > 0) {
            setData(json)
            setFiltered(json)
            setError(null)
          } else {
            throw new Error('PBQs manifest is empty or invalid')
          }
          setIsLoading(false)
        }
      } catch (e) {
        console.error('Failed to load PBQs manifest:', e)
        if (isMounted) {
          setError(e.message || 'Failed to load PBQs')
          setData([])
          setFiltered([])
          setIsLoading(false)
        }
      }
    }
    
    // Small delay to ensure component is mounted
    loadManifest()
    
    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - only run on mount

  // Get unique domains - memoize to avoid recalculation
  const domains = data.length > 0 
    ? Array.from(new Set(data.map(d => d.domain).filter(Boolean))).sort()
    : []

  // Filter PBQs by domain
  useEffect(() => {
    if (!selectedDomain) {
      setFiltered(data)
    } else {
      setFiltered(data.filter(item => item.domain === selectedDomain))
    }
    // Reset active index when filter changes
    setActiveIndex(-1)
    setViewerTitle('Select a PBQ to begin')
    if (viewerRef.current) {
      viewerRef.current.removeAttribute('src')
      viewerRef.current.setAttribute('srcdoc', "<p class='empty'>Nothing loaded yet.</p>")
    }
  }, [selectedDomain, data])

  // Handle hash-based deep linking - only run when data is loaded
  useEffect(() => {
    if (data.length === 0 || isLoading) return

    const hash = decodeURIComponent(location.hash.replace('#', ''))
    if (!hash) {
      return
    }

    const found = data.find(x => x.id === hash)
    if (!found) return

    // If found PBQ is in a different domain, clear filter and wait for update
    if (found.domain && selectedDomain && selectedDomain !== found.domain) {
      setSelectedDomain('')
      // Wait for filtered to update after domain is cleared
      const timeoutId = setTimeout(() => {
        const updatedFiltered = data
        const idx = updatedFiltered.findIndex(x => x.id === hash)
        if (idx !== -1) {
          openByIndex(idx, updatedFiltered)
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }

    // Find index in current filtered list
    const idx = filtered.findIndex(x => x.id === hash)
    if (idx !== -1 && idx !== activeIndex) {
      openByIndex(idx, filtered)
    }
  }, [location.hash, data, filtered, selectedDomain, activeIndex, openByIndex, isLoading])

  const openByIndex = useCallback((index, list = filtered) => {
    if (index < 0 || index >= list.length) return

    setActiveIndex(index)
    const item = list[index]
    setViewerTitle(item.title)
    
    if (viewerRef.current) {
      viewerRef.current.removeAttribute('srcdoc')
      viewerRef.current.src = `/${item.filepath}`
    }

    // Update hash
    navigate(`#${encodeURIComponent(item.id)}`, { replace: true })
  }, [filtered, navigate])

  function openById(id) {
    const index = filtered.findIndex(x => x.id === id)
    if (index !== -1) {
      openByIndex(index)
    }
  }

  function handlePrev() {
    if (activeIndex > 0) {
      openByIndex(activeIndex - 1)
    }
  }

  function handleNext() {
    if (activeIndex < filtered.length - 1) {
      openByIndex(activeIndex + 1)
    }
  }

  function handleExpand() {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c])
  }

  const activeItem = activeIndex >= 0 && activeIndex < filtered.length ? filtered[activeIndex] : null
  const openTabHref = activeItem ? `/${activeItem.filepath}` : null

  // Always render something - show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-theme-muted text-center">
          <div className="mb-2 text-lg">Loading PBQs...</div>
          <div className="text-xs text-theme-muted">Fetching data from /assets/pbqs.json</div>
        </div>
      </div>
    )
  }

  // Show error state if no data and not loading
  if (!isLoading && (data.length === 0 || error)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <div className="text-theme-muted mb-4">
            <div className="mb-2 text-lg font-semibold">Failed to load PBQs</div>
            <div className="text-sm mb-2 text-red-400">{error || 'Unable to fetch /assets/pbqs.json'}</div>
            <div className="text-xs text-theme-muted">Please check the browser console for details.</div>
          </div>
          <button
            onClick={() => {
              setIsLoading(true)
              setError(null)
              // Reload the page to retry
              window.location.reload()
            }}
            className="inline-flex items-center gap-2 border border-theme-navyDim px-3 py-2 rounded-lg bg-theme-navy text-white font-semibold text-sm hover:brightness-110"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-[18px] items-stretch ${isExpanded ? 'grid-cols-1' : 'grid-cols-[340px_1fr]'} max-lg:grid-cols-1`}>
      {/* Rest of the component remains the same */}
      {!isExpanded && (
        <section className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
          <h2 className="m-0 px-4 py-3.5 border-b border-theme-border text-[15px] text-theme-accent bg-[#151518]">PBQ Browser</h2>
          <div className="p-3.5">
            <div className="grid grid-cols-1 gap-2.5 mb-2.5">
              <div className="grid grid-cols-[1fr_auto] gap-2.5">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  aria-label="Filter by domain"
                  className="w-full bg-[#141416] border border-theme-border rounded-lg px-3 py-2.5 text-theme-ink focus:outline-none focus:border-theme-navy"
                >
                  <option value="">All Domains</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedDomain('')}
                  className="inline-flex items-center gap-2 border border-theme-navyDim px-2.5 py-2 rounded-lg bg-theme-navy text-white font-semibold text-sm leading-none hover:brightness-110"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto pr-1" role="listbox" aria-label="PBQ list">
              {filtered.length === 0 ? (
                <div className="p-6 text-theme-muted">No matches. Try clearing filters.</div>
              ) : (
                filtered.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openByIndex(index)}
                    className={`flex flex-col gap-1 border rounded-[10px] px-3 py-2.5 bg-[#1c1c20] transition-all duration-200 hover:bg-[#212126] hover:border-theme-navy hover:-translate-y-0.5 ${
                      index === activeIndex 
                        ? 'border-theme-navy shadow-[0_10px_24px_rgba(0,0,0,0.25)]' 
                        : 'border-theme-border'
                    }`}
                    data-id={item.id}
                  >
                    <div className="text-sm text-white">{escapeHtml(item.title)}</div>
                    <div className="text-xs text-theme-muted">{escapeHtml(item.domain)}</div>
                  </button>
                ))
              )}
            </div>
            <div className="text-xs text-theme-muted mt-2.5" aria-live="polite">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </section>
      )}

      <section className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 border-b border-theme-border bg-[#151518]">
          <h3 className="text-sm text-white m-0">{viewerTitle}</h3>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExpand}
              aria-pressed={isExpanded}
              className="inline-flex items-center gap-2 border border-theme-navyDim px-2.5 py-2 rounded-lg bg-theme-navy text-white font-semibold text-sm leading-none hover:brightness-110"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  Collapse
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  Expand
                </>
              )}
            </button>
            {openTabHref && (
              <a
                href={openTabHref}
                target="_blank"
                rel="noopener"
                aria-label="Open current PBQ in a new tab"
                className="inline-flex items-center gap-2 border border-theme-navyDim px-2.5 py-2 rounded-lg bg-theme-navy text-white font-semibold text-sm leading-none hover:brightness-110"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in new tab
              </a>
            )}
            <button
              onClick={handlePrev}
              disabled={activeIndex <= 0}
              className="inline-flex items-center gap-2 border border-theme-navyDim px-2.5 py-2 rounded-lg bg-theme-navy text-white font-semibold text-sm leading-none hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex < 0 || activeIndex >= filtered.length - 1}
              className="inline-flex items-center gap-2 border border-theme-navyDim px-2.5 py-2 rounded-lg bg-theme-navy text-white font-semibold text-sm leading-none hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <iframe
          ref={viewerRef}
          title="PBQ Viewer"
          className="w-full border-0 bg-[#0f0f11] max-lg:h-[60vh]"
          style={{ height: isExpanded ? 'calc(100dvh - 160px)' : '70vh' }}
          srcdoc="<p class='empty'>Nothing loaded yet.</p>"
        ></iframe>
      </section>
    </div>
  )
}

export default PBQs
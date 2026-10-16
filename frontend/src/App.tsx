import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

type CaptureType = 'Link' | 'Image' | 'Note'
type PreviewCard = 'capture' | 'space' | 'connection'
type Theme = 'light' | 'dark'

function WaveMark() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false"><path fill="currentColor" d="M31 5C17 5 8 14 8 27c0 5 2 8 1 12l-5 7c-1 2 0 4 3 4h5v5c0 4 3 6 7 6h11v-6c2-3 6-5 12-7 11-4 18-12 18-23C60 13 48 5 31 5Z" /><path d="M10 37c6-7 10-7 15 0s9 7 14 0 9-7 15-1" stroke="var(--mark-wave, #fff)" strokeWidth="5" strokeLinecap="round" /><path d="M15 23c5-6 10-6 15 0m2-12c5 4 7 8 7 14m5-14c6 3 9 7 10 13" stroke="var(--mark-wave, #fff)" strokeWidth="3" strokeLinecap="round" /></svg>
}

function ThemeIcon({ theme }: { theme: Theme }) {
  return theme === 'light'
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" /></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
}

const journeyStages = ['Capture', 'Extract', 'Find a space', 'Placed'] as const

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem('wave-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const previewCards: Record<PreviewCard, { eyebrow: string; title: string; description: string }> = {
  capture: {
    eyebrow: '01 / CAPTURE',
    title: 'A place for the things you keep',
    description: 'A link, an image, or your own note starts as an item in your library. The preview shows the shape of that item without using sample source content.',
  },
  space: {
    eyebrow: '02 / SPACE',
    title: 'Related things find a space',
    description: 'A space is an automatically suggested group of related items. Future grouping will need to be tested with real content before Wave can make this claim for a live library.',
  },
  connection: {
    eyebrow: '03 / CONNECTION',
    title: 'Follow an idea back',
    description: 'Open a space to see how saved items relate, then return to the original item when you need it. This interaction previews the intended navigation.',
  },
}

const connectedCards: Record<PreviewCard, PreviewCard[]> = {
  capture: ['space'],
  space: ['capture', 'connection'],
  connection: ['space'],
}

function CapturePreview({ type, onTypeChange, onAdvance }: { type: CaptureType; onTypeChange: (type: CaptureType) => void; onAdvance: () => void }) {
  return (
    <div className="capture-preview">
      <div className="mock-label">Add something to Wave</div>
      <div className="capture-types" role="group" aria-label="Choose a capture type in the preview">
        {(['Link', 'Image', 'Note'] as CaptureType[]).map((option) => (
          <button type="button" key={option} aria-pressed={type === option} className={type === option ? 'capture-type selected' : 'capture-type'} onClick={() => onTypeChange(option)}>
            <span aria-hidden="true">{option === 'Link' ? '↗' : option === 'Image' ? '▧' : '≡'}</span>{option}
          </button>
        ))}
      </div>
      <div className="capture-drop" aria-hidden="true">
        <span className="drop-symbol">{type === 'Link' ? '↗' : type === 'Image' ? '▧' : '✎'}</span>
        <strong>{type === 'Link' ? 'Paste a link' : type === 'Image' ? 'Choose an image' : 'Write a note'}</strong>
        <span>{type === 'Link' ? 'A page worth keeping' : type === 'Image' ? 'A visual you want to remember' : 'An idea in your own words'}</span>
      </div>
      <button type="button" className="mock-action" onClick={onAdvance}>Add to Wave <span aria-hidden="true">→</span></button>
    </div>
  )
}

function ProcessingPreview({ stage, type }: { stage: number; type: CaptureType }) {
  const steps = [
    { title: 'Added to your library', detail: `Your ${type.toLowerCase()} has a place to begin.` },
    { title: 'Extracting available content', detail: 'What Wave can read depends on the source.' },
    { title: 'Assigning a space', detail: 'Looking for related ideas in your library.' },
  ]

  return (
    <div className="processing-preview">
      <div className="mock-label">Making room for your {type.toLowerCase()}</div>
      <ol className="progress-steps">
        {steps.map((step, index) => {
          const activeIndex = stage === 1 ? 1 : 2
          const state = stage === 3 || index < activeIndex ? 'complete' : index === activeIndex ? 'current' : 'waiting'
          return (
            <li className={`progress-step ${state}`} key={step.title}>
              <span className="step-mark" aria-hidden="true">{state === 'complete' ? '✓' : String(index + 1).padStart(2, '0')}</span>
              <div><strong>{step.title}</strong><span>{step.detail}</span></div>
              {state === 'current' && <span className="step-status">In progress</span>}
            </li>
          )
        })}
      </ol>
      {stage === 3 && <div className="placed-state"><span aria-hidden="true">✦</span><strong>Placed in a suggested space</strong><small>Concept preview</small></div>}
    </div>
  )
}

function JourneyWindow() {
  const [stage, setStage] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [type, setType] = useState<CaptureType>('Link')
  const stageButtons = useRef<(HTMLButtonElement | null)[]>([])
  const focusAfterAdvance = useRef(false)

  useEffect(() => {
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setStage((current) => (current + 1) % journeyStages.length), 3500)
    return () => window.clearInterval(timer)
  }, [playing])

  useLayoutEffect(() => {
    if (focusAfterAdvance.current) {
      stageButtons.current[1]?.focus()
      focusAfterAdvance.current = false
    }
  }, [stage])

  return (
    <div className="journey-wrap">
      <div className="journey-window">
        <div className="window-bar"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><span>Wave / Interface preview</span><span className="window-symbol" aria-hidden="true"><WaveMark /></span></div>
        <div className="window-content">
          <div className="window-sidebar" aria-hidden="true"><span className="sidebar-logo"><WaveMark /></span><span className="sidebar-line wide" /><span className="sidebar-line" /><span className="sidebar-line" /><span className="sidebar-line short" /></div>
          <div className="window-main" aria-live="off">
            {stage === 0 ? <CapturePreview type={type} onTypeChange={(nextType) => { setType(nextType); setPlaying(false) }} onAdvance={() => { focusAfterAdvance.current = true; setStage(1); setPlaying(false) }} /> : <ProcessingPreview stage={stage} type={type} />}
          </div>
        </div>
      </div>
      <div className="journey-controls">
        <div className="stage-buttons" role="group" aria-label="Walkthrough stages">
          {journeyStages.map((label, index) => (
            <button type="button" key={label} ref={(element) => { stageButtons.current[index] = element }} className={stage === index ? 'stage-button active' : 'stage-button'} aria-label={`Show ${label} step`} aria-pressed={stage === index} onClick={() => { setStage(index); setPlaying(false) }}>
              <span className="stage-track" /><span>{label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="play-button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}>{playing ? 'Ⅱ' : '▶'}</button>
      </div>
    </div>
  )
}

function AppPreview() {
  const [activeCard, setActiveCard] = useState<PreviewCard>('space')
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const focusNextDetail = useRef(false)
  const detail = previewCards[activeCard]

  useLayoutEffect(() => {
    if (focusNextDetail.current) {
      detailHeading.current?.focus()
      focusNextDetail.current = false
    }
  }, [activeCard])

  return (
    <div className="preview-shell">
      <div className="preview-toolbar"><span className="preview-brand"><span aria-hidden="true"><WaveMark /></span> Wave</span><span>Library / Preview</span><span className="toolbar-dots" aria-hidden="true">···</span></div>
      <div className="preview-content">
        <div className="preview-map" aria-label="Interactive preview of an item, a space, and their connection">
          <div className="map-grid" aria-hidden="true" />
          <div className="connection-line line-one" aria-hidden="true" />
          <div className="connection-line line-two" aria-hidden="true" />
          <button type="button" className={activeCard === 'capture' ? 'map-card capture-card active' : 'map-card capture-card'} aria-pressed={activeCard === 'capture'} onClick={() => setActiveCard('capture')}><span className="card-icon" aria-hidden="true">↗</span><span className="card-text"><small>CAPTURED ITEM</small><strong>What you saved</strong><i /><i /></span></button>
          <button type="button" className={activeCard === 'space' ? 'map-card space-card active' : 'map-card space-card'} aria-pressed={activeCard === 'space'} onClick={() => setActiveCard('space')}><span className="card-icon" aria-hidden="true">✦</span><span className="card-text"><small>SUGGESTED SPACE</small><strong>Related ideas</strong><span className="space-chips"><em>Link</em><em>Note</em><em>Image</em></span></span></button>
          <button type="button" className={activeCard === 'connection' ? 'map-card connection-card active' : 'map-card connection-card'} aria-pressed={activeCard === 'connection'} onClick={() => setActiveCard('connection')}><span className="card-icon" aria-hidden="true">◇</span><span className="card-text"><small>CONNECTION</small><strong>Follow the thread</strong><i /><i /></span></button>
          <span className="map-hint">Select a card to explore</span>
        </div>
        <div className="preview-detail" aria-live="polite">
          <span className="detail-eyebrow">{detail.eyebrow}</span>
          <div className="detail-illustration" aria-hidden="true"><span>{activeCard === 'capture' ? '↗' : activeCard === 'space' ? '✦' : '◇'}</span></div>
          <h3 ref={detailHeading} tabIndex={-1}>{detail.title}</h3>
          <p>{detail.description}</p>
          <div className="related-actions"><span>FOLLOW A CONNECTION</span>{connectedCards[activeCard].map((card) => <button type="button" key={card} onClick={() => { focusNextDetail.current = true; setActiveCard(card) }}>{previewCards[card].title} <span aria-hidden="true">→</span></button>)}</div>
          <span className="detail-footer">Interface concept · No items saved here</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const syncPreference = (event: MediaQueryListEvent) => {
      if (!window.localStorage.getItem('wave-theme')) setTheme(event.matches ? 'dark' : 'light')
    }
    preference.addEventListener('change', syncPreference)
    return () => preference.removeEventListener('change', syncPreference)
  }, [])

  const toggleTheme = (button: HTMLButtonElement) => {
    const next = theme === 'light' ? 'dark' : 'light'
    window.localStorage.setItem('wave-theme', next)
    const transitionDocument = document as Document & { startViewTransition?: (update: () => void) => { ready: Promise<void> } }
    if (!transitionDocument.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next)
      return
    }

    const bounds = button.getBoundingClientRect()
    const x = bounds.left + bounds.width / 2
    const y = bounds.top + bounds.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.documentElement.style.setProperty('--reveal-x', `${x}px`)
    document.documentElement.style.setProperty('--reveal-y', `${y}px`)
    document.documentElement.style.setProperty('--reveal-radius', `${radius}px`)
    transitionDocument.startViewTransition(() => flushSync(() => setTheme(next)))
  }

  return (
    <div className="site-shell">
      <header className="site-header"><a className="brand" href="#top" aria-label="Wave home"><span className="brand-mark" aria-hidden="true"><WaveMark /></span>Wave<span className="brand-dot">.</span></a><nav aria-label="Main navigation"><a href="#journey">How it works</a><button type="button" className="theme-toggle" aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} aria-pressed={theme === 'dark'} onClick={(event) => toggleTheme(event.currentTarget)}><ThemeIcon theme={theme} /></button><a href="#preview"><span className="nav-label">Explore the preview</span><span className="nav-short">Preview</span> <span aria-hidden="true">↗</span></a></nav></header>
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy"><span className="eyebrow"><span className="status-dot" /> A HOME FOR WHAT YOU FIND</span><h1 id="hero-title">Save the thought.<br /><em>Find the thread.</em></h1><p>Wave is being built to help you capture useful things and see how they connect. Take a look at the experience we’re shaping.</p><div className="hero-actions"><a className="primary-link" href="#journey">See how Wave works <span aria-hidden="true">↓</span></a><a className="text-link" href="#preview">Explore the interface →</a></div><span className="hero-note">Product preview · No account or upload needed</span></div>
          <div className="hero-side"><JourneyWindow /><p className="preview-caption">A guided interface preview. Uploads and processing are not active on this page.</p></div>
        </section>
        <section className="story-section" id="journey" aria-labelledby="story-title"><div className="section-intro"><span className="eyebrow">THE JOURNEY</span><h2 id="story-title">From capture to clarity<span>.</span></h2><p>The walkthrough above shows the intended flow. Wave will take in a link, image, or note; extract what it can; then suggest a space for related items. Source support and grouping quality will be tested in later phases.</p></div><div className="story-steps"><div><span>01</span><h3>Bring it in</h3><p>Choose a link, image, or note.</p></div><div><span>02</span><h3>See the progress</h3><p>Follow extraction and space assignment as separate steps.</p></div><div><span>03</span><h3>Return to it</h3><p>Open a space and follow related items back to their source.</p></div></div></section>
        <section className="interactive-section" id="preview" aria-labelledby="preview-title"><div className="section-intro"><span className="eyebrow">EXPLORE THE INTERFACE</span><h2 id="preview-title">A glimpse inside Wave<span>.</span></h2><p>Open the cards to see how an item, its suggested space, and a connection might fit together. These are interface placeholders, not saved sources or live grouping results.</p></div><AppPreview /></section>
        <section className="honesty-note"><span aria-hidden="true">✳</span><div><h2>Built in the open.</h2><p>This page previews Wave’s intended experience. Sign-in, personal saves, source extraction, and automatic grouping are not running here yet. The working app will be built and tested phase by phase.</p></div></section>
      </main>
      <footer className="site-footer"><span className="footer-brand">Wave<span>.</span></span><p>Keep what matters. Find it again.</p><span>Public interface preview</span></footer>
    </div>
  )
}

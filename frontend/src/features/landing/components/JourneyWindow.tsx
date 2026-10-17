import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import WaveMark from '../../../shared/brand/WaveMark'
import { journeyStages, type CaptureType } from '../previewContent'
import CapturePreview from './CapturePreview'
import ProcessingPreview from './ProcessingPreview'

export default function JourneyWindow() {
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
        <div className="window-bar">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span>Wave / Interface preview</span>
          <span className="window-symbol" aria-hidden="true"><WaveMark /></span>
        </div>
        <div className="window-content">
          <div className="window-sidebar" aria-hidden="true">
            <span className="sidebar-logo"><WaveMark /></span>
            <span className="sidebar-line wide" />
            <span className="sidebar-line" />
            <span className="sidebar-line" />
            <span className="sidebar-line short" />
          </div>
          <div className="window-main" aria-live="off">
            {stage === 0 ? (
              <CapturePreview
                type={type}
                onTypeChange={(nextType) => { setType(nextType); setPlaying(false) }}
                onAdvance={() => { focusAfterAdvance.current = true; setStage(1); setPlaying(false) }}
              />
            ) : (
              <ProcessingPreview stage={stage} type={type} />
            )}
          </div>
        </div>
      </div>
      <div className="journey-controls">
        <div className="stage-buttons" role="group" aria-label="Walkthrough stages">
          {journeyStages.map((label, index) => (
            <button
              type="button"
              key={label}
              ref={(element) => { stageButtons.current[index] = element }}
              className={stage === index ? 'stage-button active' : 'stage-button'}
              aria-label={`Show ${label} step`}
              aria-pressed={stage === index}
              onClick={() => { setStage(index); setPlaying(false) }}
            >
              <span className="stage-track" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="play-button"
          onClick={() => setPlaying((current) => !current)}
          aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
        >
          {playing ? 'Ⅱ' : '▶'}
        </button>
      </div>
    </div>
  )
}

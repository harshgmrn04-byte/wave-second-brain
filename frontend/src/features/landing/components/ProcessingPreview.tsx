import type { CaptureType } from '../previewContent'

export default function ProcessingPreview({ stage, type }: { stage: number; type: CaptureType }) {
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
      {stage === 3 && (
        <div className="placed-state">
          <span aria-hidden="true">✦</span>
          <strong>Placed in a suggested space</strong>
          <small>Concept preview</small>
        </div>
      )}
    </div>
  )
}

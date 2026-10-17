import type { CaptureType } from '../previewContent'

type CapturePreviewProps = {
  type: CaptureType
  onTypeChange: (type: CaptureType) => void
  onAdvance: () => void
}

export default function CapturePreview({ type, onTypeChange, onAdvance }: CapturePreviewProps) {
  return (
    <div className="capture-preview">
      <div className="mock-label">Add something to Wave</div>
      <div className="capture-types" role="group" aria-label="Choose a capture type in the preview">
        {(['Link', 'Image', 'Note'] as CaptureType[]).map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={type === option}
            className={type === option ? 'capture-type selected' : 'capture-type'}
            onClick={() => onTypeChange(option)}
          >
            <span aria-hidden="true">{option === 'Link' ? '↗' : option === 'Image' ? '▧' : '≡'}</span>
            {option}
          </button>
        ))}
      </div>
      <div className="capture-drop" aria-hidden="true">
        <span className="drop-symbol">{type === 'Link' ? '↗' : type === 'Image' ? '▧' : '✎'}</span>
        <strong>{type === 'Link' ? 'Paste a link' : type === 'Image' ? 'Choose an image' : 'Write a note'}</strong>
        <span>{type === 'Link' ? 'A page worth keeping' : type === 'Image' ? 'A visual you want to remember' : 'An idea in your own words'}</span>
      </div>
      <button type="button" className="mock-action" onClick={onAdvance}>
        Add to Wave <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import WaveMark from '../../../shared/brand/WaveMark'
import { connectedCards, previewCards, type PreviewCard } from '../previewContent'

export default function AppPreview() {
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
      <div className="preview-toolbar">
        <span className="preview-brand"><span aria-hidden="true"><WaveMark /></span> Wave</span>
        <span>Library / Preview</span>
        <span className="toolbar-dots" aria-hidden="true">···</span>
      </div>
      <div className="preview-content">
        <div className="preview-map" aria-label="Interactive preview of an item, a space, and their connection">
          <div className="map-grid" aria-hidden="true" />
          <div className="connection-line line-one" aria-hidden="true" />
          <div className="connection-line line-two" aria-hidden="true" />
          <button
            type="button"
            className={activeCard === 'capture' ? 'map-card capture-card active' : 'map-card capture-card'}
            aria-pressed={activeCard === 'capture'}
            onClick={() => setActiveCard('capture')}
          >
            <span className="card-icon" aria-hidden="true">↗</span>
            <span className="card-text"><small>CAPTURED ITEM</small><strong>What you saved</strong><i /><i /></span>
          </button>
          <button
            type="button"
            className={activeCard === 'space' ? 'map-card space-card active' : 'map-card space-card'}
            aria-pressed={activeCard === 'space'}
            onClick={() => setActiveCard('space')}
          >
            <span className="card-icon" aria-hidden="true">✦</span>
            <span className="card-text">
              <small>SUGGESTED SPACE</small><strong>Related ideas</strong>
              <span className="space-chips"><em>Link</em><em>Note</em><em>Image</em></span>
            </span>
          </button>
          <button
            type="button"
            className={activeCard === 'connection' ? 'map-card connection-card active' : 'map-card connection-card'}
            aria-pressed={activeCard === 'connection'}
            onClick={() => setActiveCard('connection')}
          >
            <span className="card-icon" aria-hidden="true">◇</span>
            <span className="card-text"><small>CONNECTION</small><strong>Follow the thread</strong><i /><i /></span>
          </button>
          <span className="map-hint">Select a card to explore</span>
        </div>
        <div className="preview-detail" aria-live="polite">
          <span className="detail-eyebrow">{detail.eyebrow}</span>
          <div className="detail-illustration" aria-hidden="true">
            <span>{activeCard === 'capture' ? '↗' : activeCard === 'space' ? '✦' : '◇'}</span>
          </div>
          <h3 ref={detailHeading} tabIndex={-1}>{detail.title}</h3>
          <p>{detail.description}</p>
          <div className="related-actions">
            <span>FOLLOW A CONNECTION</span>
            {connectedCards[activeCard].map((card) => (
              <button
                type="button"
                key={card}
                onClick={() => { focusNextDetail.current = true; setActiveCard(card) }}
              >
                {previewCards[card].title} <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
          <span className="detail-footer">Interface concept · No items saved here</span>
        </div>
      </div>
    </div>
  )
}

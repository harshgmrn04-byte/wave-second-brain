import AppPreview from './AppPreview'

export default function PreviewSection() {
  return (
    <section className="interactive-section" id="preview" aria-labelledby="preview-title">
      <div className="section-intro">
        <span className="eyebrow">EXPLORE THE INTERFACE</span>
        <h2 id="preview-title">A glimpse inside Wave<span>.</span></h2>
        <p>Open the cards to see how an item, its suggested space, and a connection might fit together. These are interface placeholders, not saved sources or live grouping results.</p>
      </div>
      <AppPreview />
    </section>
  )
}

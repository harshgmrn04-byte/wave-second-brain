import JourneyWindow from './JourneyWindow'

export default function LandingHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="eyebrow"><span className="status-dot" /> A HOME FOR WHAT YOU FIND</span>
        <h1 id="hero-title">Save the thought.<br /><em>Find the thread.</em></h1>
        <p>Wave is being built to help you capture useful things and see how they connect. Take a look at the experience we’re shaping.</p>
        <div className="hero-actions">
          <a className="primary-link" href="#journey">See how Wave works <span aria-hidden="true">↓</span></a>
          <a className="text-link" href="#preview">Explore the interface →</a>
        </div>
        <span className="hero-note">Product preview · No account or upload needed</span>
      </div>
      <div className="hero-side">
        <JourneyWindow />
        <p className="preview-caption">A guided interface preview. Uploads and processing are not active on this page.</p>
      </div>
    </section>
  )
}

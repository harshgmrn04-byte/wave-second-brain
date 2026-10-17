export default function JourneyStory() {
  return (
    <section className="story-section" id="journey" aria-labelledby="story-title">
      <div className="section-intro">
        <span className="eyebrow">THE JOURNEY</span>
        <h2 id="story-title">From capture to clarity<span>.</span></h2>
        <p>The walkthrough above shows the intended flow. Wave will take in a link, image, or note; extract what it can; then suggest a space for related items. Source support and grouping quality will be tested in later phases.</p>
      </div>
      <div className="story-steps">
        <div><span>01</span><h3>Bring it in</h3><p>Choose a link, image, or note.</p></div>
        <div><span>02</span><h3>See the progress</h3><p>Follow extraction and space assignment as separate steps.</p></div>
        <div><span>03</span><h3>Return to it</h3><p>Open a space and follow related items back to their source.</p></div>
      </div>
    </section>
  )
}

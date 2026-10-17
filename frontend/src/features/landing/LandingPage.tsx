import SiteHeader from './components/SiteHeader'
import LandingHero from './components/LandingHero'
import JourneyStory from './components/JourneyStory'
import PreviewSection from './components/PreviewSection'
import StatusNote from './components/StatusNote'

export default function LandingPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="top">
        <LandingHero />
        <JourneyStory />
        <PreviewSection />
        <StatusNote />
      </main>
      <footer className="site-footer">
        <span className="footer-brand">Wave<span>.</span></span>
        <p>Keep what matters. Find it again.</p>
        <span>Public interface preview</span>
      </footer>
    </div>
  )
}

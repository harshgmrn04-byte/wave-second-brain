import { authConfigured } from '../../auth/client'

export default function StatusNote() {
  const description = authConfigured
    ? 'This page previews Wave’s intended experience. Google sign-in is available in this build; personal saves, source extraction, and automatic grouping are still being built and tested phase by phase.'
    : 'This page previews Wave’s intended experience. Sign-in, personal saves, source extraction, and automatic grouping are not running here yet. The working app will be built and tested phase by phase.'

  return (
    <section className="honesty-note">
      <span aria-hidden="true">✳</span>
      <div>
        <h2>Built in the open.</h2>
        <p>{description}</p>
      </div>
    </section>
  )
}

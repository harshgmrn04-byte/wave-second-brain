import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('public interface preview', () => {
  it('shows the intended journey and labels its limits without sample sources', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('Save the thought.')
    expect(html).toContain('Choose a capture type in the preview')
    expect(html).toContain('Show Extract step')
    expect(html).toContain('Show Find a space step')
    expect(html).toContain('Switch to dark mode')
    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain('FOLLOW A CONNECTION')
    expect(html).toContain('not saved sources or live grouping results')
    expect(html).not.toContain('Make the first step almost too easy')
  })
})

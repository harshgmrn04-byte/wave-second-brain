import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Wave skeleton without the API', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('<h1>Wave</h1>')
    expect(html).toContain('The local React app is running.')
  })
})

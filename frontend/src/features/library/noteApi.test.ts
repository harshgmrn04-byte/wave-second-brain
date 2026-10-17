import { afterEach, expect, it, vi } from 'vitest'
import { deleteNote, saveNote } from './noteApi'

afterEach(() => vi.unstubAllGlobals())

it('surfaces an API failure without claiming that a note was saved', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({ detail: 'Notes are temporarily unavailable.' }),
  }))

  await expect(saveNote('test-token', 'Draft')).rejects.toThrow('Notes are temporarily unavailable.')
})

it('reports a network failure without claiming success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

  await expect(saveNote('test-token', 'Draft')).rejects.toThrow('Could not reach the note API.')
})

it('surfaces a failed delete so the note can stay visible', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({ detail: 'Notes are temporarily unavailable.' }),
  }))

  await expect(deleteNote('test-token', 'note-id')).rejects.toThrow('Notes are temporarily unavailable.')
})

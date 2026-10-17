import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { deleteNote, listNotes, notesConfigured, saveNote } from './noteApi'
import type { Note } from './noteApi'

export default function NotesSection({ session }: { session: Session }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState('')
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [listError, setListError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!notesConfigured) {
      setLoading(false)
      return
    }
    let active = true
    void listNotes(session.access_token).then((page) => {
      if (!active) return
      setNotes(page.items)
      setNextOffset(page.next_offset)
      setListError('')
    }).catch((cause: unknown) => {
      if (active) setListError(cause instanceof Error ? cause.message : 'Could not load notes.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [session.access_token, session.user.id])

  const refresh = async () => {
    setLoading(true)
    setListError('')
    try {
      const page = await listNotes(session.access_token)
      setNotes(page.items)
      setNextOffset(page.next_offset)
    } catch (cause) {
      setListError(cause instanceof Error ? cause.message : 'Could not load notes.')
    } finally {
      setLoading(false)
    }
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveError('')
    if (!draft.trim()) {
      setSaveError('Write some text before saving.')
      return
    }
    setSaving(true)
    try {
      const note = await saveNote(session.access_token, draft)
      setNotes((current) => [note, ...current])
      setDraft('')
    } catch (cause) {
      setSaveError(`${cause instanceof Error ? cause.message : 'Could not save the note.'} Your draft is still here.`)
    } finally {
      setSaving(false)
    }
  }

  const loadMore = async () => {
    if (nextOffset === null) return
    try {
      const page = await listNotes(session.access_token, nextOffset)
      setNotes((current) => [...current, ...page.items.filter((note) => !current.some((item) => item.id === note.id))])
      setNextOffset(page.next_offset)
      setListError('')
    } catch (cause) {
      setListError(cause instanceof Error ? cause.message : 'Could not load more notes.')
    }
  }

  const remove = async (note: Note) => {
    if (!window.confirm('Delete this note? Wave cannot restore it.')) return
    setDeletingId(note.id)
    setDeleteError('')
    try {
      await deleteNote(session.access_token, note.id)
      setNotes((current) => current.filter((item) => item.id !== note.id))
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : 'Could not delete the note.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!notesConfigured) return <p className="notes-unavailable">The note API is not configured in this build.</p>

  return <section className="notes-section" aria-labelledby="notes-heading">
    <h2 id="notes-heading">Your notes</h2>
    <form onSubmit={save} className="note-form">
      <label htmlFor="note-body">New note</label>
      <textarea id="note-body" value={draft} onChange={(event) => setDraft(event.target.value)}
        maxLength={10000} rows={5} placeholder="Write something you want to keep…" />
      <div className="note-form-footer">
        <span>{draft.length} / 10,000 characters</span>
        <button className="auth-action" type="submit" disabled={saving || !draft.trim()}>
          {saving ? 'Saving…' : 'Save note'}
        </button>
      </div>
      {saveError && <p className="auth-error" role="alert">{saveError} Check the list before retrying if the request timed out.</p>}
    </form>

    <div className="notes-list-heading">
      <h3>Saved notes</h3>
      <button type="button" onClick={refresh} disabled={loading}>Refresh</button>
    </div>
    {loading && <p role="status">Loading your notes…</p>}
    {listError && <p className="auth-error" role="alert">{listError} Previously loaded notes may be stale.</p>}
    {deleteError && <p className="auth-error" role="alert">{deleteError}</p>}
    {!loading && !listError && notes.length === 0 && <p>No notes saved yet.</p>}
    <div className="notes-list">
      {notes.map((note) => <article className="saved-note" key={note.id}>
        <div className="saved-note-header">
          <time dateTime={note.created_at}>{new Date(note.created_at).toLocaleString()}</time>
          <button type="button" onClick={() => { void remove(note) }} disabled={deletingId === note.id}>
            {deletingId === note.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
        <p>{note.body}</p>
      </article>)}
    </div>
    {nextOffset !== null && <button type="button" className="notes-more" onClick={loadMore}>Load more</button>}
  </section>
}

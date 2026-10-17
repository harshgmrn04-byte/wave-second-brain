export type Note = {
  id: string
  body: string
  created_at: string
}

export type NotePage = { items: Note[]; next_offset: number | null }

const apiUrl = import.meta.env.VITE_WAVE_API_URL?.replace(/\/$/, '')

export const notesConfigured = Boolean(apiUrl)

async function request<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
  } catch {
    throw new Error('Could not reach the note API.')
  }

  const data: T & { detail?: string } = await response.json().catch(() => ({} as T))
  if (!response.ok) {
    if (response.status === 401) throw new Error('Your session expired. Sign in again.')
    throw new Error(typeof data.detail === 'string' ? data.detail : 'The note request failed. Please retry.')
  }
  return data
}

export function listNotes(accessToken: string, offset = 0): Promise<NotePage> {
  return request(`/resources/notes?limit=50&offset=${offset}`, accessToken)
}

export function saveNote(accessToken: string, body: string): Promise<Note> {
  return request('/resources/notes', accessToken, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function deleteNote(accessToken: string, id: string): Promise<void> {
  return request(`/resources/notes/${encodeURIComponent(id)}`, accessToken, { method: 'DELETE' })
}

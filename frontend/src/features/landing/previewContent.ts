export type CaptureType = 'Link' | 'Image' | 'Note'
export type PreviewCard = 'capture' | 'space' | 'connection'

export const journeyStages = ['Capture', 'Extract', 'Find a space', 'Placed'] as const

export const previewCards: Record<PreviewCard, { eyebrow: string; title: string; description: string }> = {
  capture: {
    eyebrow: '01 / CAPTURE',
    title: 'A place for the things you keep',
    description: 'A link, an image, or your own note starts as an item in your library. The preview shows the shape of that item without using sample source content.',
  },
  space: {
    eyebrow: '02 / SPACE',
    title: 'Related things find a space',
    description: 'A space is an automatically suggested group of related items. Future grouping will need to be tested with real content before Wave can make this claim for a live library.',
  },
  connection: {
    eyebrow: '03 / CONNECTION',
    title: 'Follow an idea back',
    description: 'Open a space to see how saved items relate, then return to the original item when you need it. This interaction previews the intended navigation.',
  },
}

export const connectedCards: Record<PreviewCard, PreviewCard[]> = {
  capture: ['space'],
  space: ['capture', 'connection'],
  connection: ['space'],
}

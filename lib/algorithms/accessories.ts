import type { FurnitureConfig, Piece } from '@/types'

export interface AccessoriesSummary {
  hinges: number        // bisagras
  handles: number       // agarraderas
  slides: number        // correderas para cajones (par por cajón)
  camLocks: number      // minifix / cam locks
  screws: number        // tornillos (estimado)
}

export function calculateAccessories(
  config: FurnitureConfig,
  pieces: Piece[]
): AccessoriesSummary {
  const { doors, drawers, heightMm } = config

  // Bisagras: 2 por puerta si alto ≤ 1200mm, 3 si alto > 1200mm
  const hingesPerDoor = heightMm > 1200 ? 3 : 2
  const hinges = doors * hingesPerDoor

  // Agarraderas: 1 por puerta + 1 por cajón
  const handles = doors + drawers

  // Correderas: 1 par por cajón
  const slides = drawers

  // Minifix / cam locks: estimado 4 uniones por pieza estructural
  const structuralPieces = pieces.filter(
    (p) =>
      p.label.toLowerCase().includes('lateral') ||
      p.label.toLowerCase().includes('techo') ||
      p.label.toLowerCase().includes('base') ||
      p.label.toLowerCase().includes('repisa') ||
      p.label.toLowerCase().includes('fondo')
  )
  const camLocks = structuralPieces.reduce((acc, p) => acc + p.quantity * 4, 0)

  // Tornillos: 8 por pieza (promedio para ensamble)
  const screws = pieces.reduce((acc, p) => acc + p.quantity * 8, 0)

  return { hinges, handles, slides, camLocks, screws }
}

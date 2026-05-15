import type { CutPiece, PlacedPiece, SheetLayout, CuttingResult } from '@/types'

export const SHEET_W = 2440
export const SHEET_H = 1220
const GAP = 2

interface Shelf {
  y: number
  height: number
  usedWidth: number
}

class SheetBuilder {
  private shelves: Shelf[] = []
  private placedPieces: PlacedPiece[] = []

  tryPlace(piece: CutPiece): boolean {
    // Try both orientations: normal and rotated
    const orientations: Array<{ w: number; h: number; rotated: boolean }> = [
      { w: piece.widthMm, h: piece.heightMm, rotated: false },
      { w: piece.heightMm, h: piece.widthMm, rotated: true },
    ]

    for (const { w, h, rotated } of orientations) {
      // Try to fit on an existing shelf
      for (const shelf of this.shelves) {
        const remaining = SHEET_W - shelf.usedWidth
        if (w + GAP <= remaining && h <= shelf.height) {
          this.placedPieces.push({
            piece,
            x: shelf.usedWidth + GAP,
            y: shelf.y,
            rotated,
          })
          shelf.usedWidth += w + GAP
          return true
        }
      }

      // Try to open a new shelf
      const currentHeight = this.shelves.reduce(
        (acc, s) => acc + s.height + GAP,
        0
      )
      if (currentHeight + h + GAP <= SHEET_H && w + GAP <= SHEET_W) {
        const newShelf: Shelf = {
          y: currentHeight + GAP,
          height: h,
          usedWidth: w + GAP,
        }
        this.shelves.push(newShelf)
        this.placedPieces.push({
          piece,
          x: GAP,
          y: newShelf.y,
          rotated,
        })
        return true
      }
    }

    return false
  }

  build(sheetIndex: number): SheetLayout {
    const sheetArea = SHEET_W * SHEET_H
    const usedArea = this.placedPieces.reduce((acc, pp) => {
      const w = pp.rotated ? pp.piece.heightMm : pp.piece.widthMm
      const h = pp.rotated ? pp.piece.widthMm : pp.piece.heightMm
      return acc + w * h
    }, 0)
    const wastePercent = ((sheetArea - usedArea) / sheetArea) * 100

    return {
      sheetIndex,
      pieces: [...this.placedPieces],
      wastePercent,
    }
  }
}

export function optimize(pieces: CutPiece[]): CuttingResult {
  // Expand by quantity if pieces have a quantity field (from Piece type)
  const expanded: CutPiece[] = pieces.flatMap((p) => {
    const qty = (p as unknown as { quantity?: number }).quantity ?? 1
    return Array.from({ length: qty }, () => ({ ...p }))
  })

  // Sort descending by area
  const sorted = [...expanded].sort(
    (a, b) => b.widthMm * b.heightMm - a.widthMm * a.heightMm
  )

  const sheets: SheetLayout[] = []
  let currentSheet = new SheetBuilder()

  for (const piece of sorted) {
    if (!currentSheet.tryPlace(piece)) {
      sheets.push(currentSheet.build(sheets.length))
      currentSheet = new SheetBuilder()
      currentSheet.tryPlace(piece)
    }
  }

  // Flush last sheet if it has pieces
  const lastSheet = currentSheet.build(sheets.length)
  if (lastSheet.pieces.length > 0) {
    sheets.push(lastSheet)
  }

  const totalWastePercent =
    sheets.length > 0
      ? sheets.reduce((acc, s) => acc + s.wastePercent, 0) / sheets.length
      : 0

  return {
    sheets,
    totalSheets: sheets.length,
    totalWastePercent,
  }
}

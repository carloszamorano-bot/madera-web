import { PdfBuilder } from './pdf-builder'
import type { CuttingResult } from '@/types'

export function generateCuttingPlanPdf(result: CuttingResult, materialName: string): void {
  const pdf = new PdfBuilder()
  const date = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })

  pdf
    .drawHeader('Plan de Corte', date)
    .drawText(`Material: ${materialName}`, { bold: true, size: 11 })
    .spaceY(2)
    .drawText(`${result.totalSheets} plancha${result.totalSheets !== 1 ? 's' : ''} de 2440×1220mm · Desperdicio promedio: ${result.totalWastePercent.toFixed(1)}%`)
    .spaceY(4)
    .drawLine()
    .spaceY(4)

  for (const sheet of result.sheets) {
    pdf.checkPageBreak(30)
    pdf.drawText(`Plancha ${sheet.sheetIndex + 1} — ${sheet.wastePercent.toFixed(1)}% desperdicio`, { bold: true, size: 10 })
    pdf.spaceY(2)

    const rows = sheet.pieces.map((pp) => [
      pp.piece.label,
      `${pp.piece.widthMm}mm`,
      `${pp.piece.heightMm}mm`,
      pp.rotated ? 'Sí' : 'No',
      `(${pp.x}, ${pp.y})`,
    ])

    pdf.drawTable(['Pieza', 'Ancho', 'Alto', 'Rotada', 'Posición (mm)'], rows)
    pdf.spaceY(4)
  }

  pdf.download('plan-de-corte.pdf')
}

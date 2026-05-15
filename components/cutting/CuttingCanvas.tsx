'use client'

import { useRef, useEffect } from 'react'
import { SHEET_W, SHEET_H } from '@/lib/algorithms/ffd-algorithm'
import type { SheetLayout } from '@/types'

const PIECE_COLORS = [
  '#E8401C', '#F5A623', '#4CAF50', '#2196F3',
  '#9C27B0', '#FF5722', '#009688', '#607D8B',
]

interface CuttingCanvasProps {
  sheet: SheetLayout
  width?: number
}

export default function CuttingCanvas({ sheet, width = 600 }: CuttingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scale = width / SHEET_W
  const height = Math.round(SHEET_H * scale)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background (sheet)
    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(0, 0, width, height)

    // Sheet border
    ctx.strokeStyle = '#9E9E9E'
    ctx.lineWidth = 1.5
    ctx.strokeRect(0, 0, width, height)

    // Sheet label
    ctx.fillStyle = '#9E9E9E'
    ctx.font = `bold ${Math.round(12 * scale)}px Inter, sans-serif`
    ctx.fillText(`Plancha ${sheet.sheetIndex + 1}`, 6 * scale, 18 * scale)

    // Pieces
    sheet.pieces.forEach((pp, idx) => {
      const pw = (pp.rotated ? pp.piece.heightMm : pp.piece.widthMm) * scale
      const ph = (pp.rotated ? pp.piece.widthMm : pp.piece.heightMm) * scale
      const px = pp.x * scale
      const py = pp.y * scale

      // Fill
      const color = PIECE_COLORS[idx % PIECE_COLORS.length]
      ctx.fillStyle = color + '33' // 20% opacity
      ctx.fillRect(px, py, pw, ph)

      // Border
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(px, py, pw, ph)

      // Label
      const label = pp.rotated ? `${pp.piece.label}↺` : pp.piece.label
      ctx.fillStyle = color
      ctx.font = `${Math.round(10 * scale)}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const textX = px + pw / 2
      const textY = py + ph / 2
      if (pw > 30 * scale && ph > 12 * scale) {
        ctx.fillText(label, textX, textY - 5 * scale, pw - 4 * scale)
        ctx.fillStyle = '#666'
        ctx.font = `${Math.round(8 * scale)}px Inter, sans-serif`
        ctx.fillText(
          `${pp.piece.widthMm}×${pp.piece.heightMm}`,
          textX,
          textY + 6 * scale,
          pw - 4 * scale
        )
      }
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    })

    // Waste %
    ctx.fillStyle = '#616161'
    ctx.font = `${Math.round(10 * scale)}px Inter, sans-serif`
    ctx.textAlign = 'right'
    ctx.fillText(
      `Desperdicio: ${sheet.wastePercent.toFixed(1)}%`,
      width - 6 * scale,
      height - 6 * scale
    )
    ctx.textAlign = 'left'
  }, [sheet, width, height, scale])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-gray-200 shadow-sm w-full"
      style={{ maxWidth: width }}
    />
  )
}

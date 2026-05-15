'use client'

import { useMemo } from 'react'
import { useDesignStore } from '@/store/design-store'
import { optimize } from '@/lib/algorithms/ffd-algorithm'
import CuttingCanvas from '@/components/cutting/CuttingCanvas'
import CutsSummary from '@/components/cutting/CutsSummary'
import type { CutPiece } from '@/types'

export default function CuttingPage() {
  const { calculatedPieces, selectedType, selectedMaterialId, materials } = useDesignStore()
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)

  const result = useMemo(() => {
    if (!calculatedPieces.length) return null

    const cutPieces: CutPiece[] = calculatedPieces.flatMap((p) =>
      Array.from({ length: p.quantity }, () => ({
        label: p.label,
        widthMm: p.widthMm,
        heightMm: p.heightMm,
        furnitureLabel: selectedType,
      }))
    )

    return optimize(cutPieces)
  }, [calculatedPieces, selectedType])

  if (!result || result.sheets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
        <p className="text-4xl">✂️</p>
        <p className="text-gray-500">
          Configura un mueble y presiona "Plan de corte" para ver las planchas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan de Corte</h1>
        <p className="text-sm text-gray-500">
          {selectedMaterial?.name ?? ''} · {result.totalSheets} plancha{result.totalSheets !== 1 ? 's' : ''} de 2440×1220mm
        </p>
      </div>

      <CutsSummary result={result} />

      {result.sheets.map((sheet) => (
        <div key={sheet.sheetIndex} className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Plancha {sheet.sheetIndex + 1} — {sheet.wastePercent.toFixed(1)}% desperdicio
          </p>
          <CuttingCanvas sheet={sheet} width={700} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sheet.pieces.map((pp, i) => (
              <div key={i} className="flex justify-between text-xs bg-gray-50 rounded px-2 py-1">
                <span className="text-gray-700">{pp.piece.label}{pp.rotated ? ' ↺' : ''}</span>
                <span className="text-gray-500 font-mono">
                  {pp.piece.widthMm}×{pp.piece.heightMm}mm @ ({pp.x},{pp.y})
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

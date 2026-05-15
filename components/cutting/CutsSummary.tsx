'use client'

import type { CuttingResult } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface CutsSummaryProps {
  result: CuttingResult
}

export default function CutsSummary({ result }: CutsSummaryProps) {
  const totalPieces = result.sheets.reduce((acc, s) => acc + s.pieces.length, 0)

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-[#E8401C]">{result.totalSheets}</p>
          <p className="text-xs text-gray-500 mt-0.5">Planchas</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalPieces}</p>
          <p className="text-xs text-gray-500 mt-0.5">Piezas totales</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-[#F5A623]">
            {result.totalWastePercent.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Desperdicio</p>
        </CardContent>
      </Card>
    </div>
  )
}

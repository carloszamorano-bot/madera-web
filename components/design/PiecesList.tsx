'use client'

import type { Piece } from '@/types'

interface PiecesListProps {
  pieces: Piece[]
}

export default function PiecesList({ pieces }: PiecesListProps) {
  if (pieces.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Configura las dimensiones y presiona "Calcular" para ver las piezas.
      </p>
    )
  }

  const totalPieces = pieces.reduce((acc, p) => acc + p.quantity, 0)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 font-medium uppercase tracking-wide px-1">
        <span>Pieza</span>
        <span>W × H (mm)</span>
        <span>Cant.</span>
      </div>
      {pieces.map((piece, i) => (
        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-md px-3 py-2">
          <span className="text-gray-800 font-medium">{piece.label}</span>
          <span className="text-gray-600 font-mono text-xs">
            {piece.widthMm}×{piece.heightMm}
          </span>
          <span className="text-[#E8401C] font-bold w-8 text-center">{piece.quantity}</span>
        </div>
      ))}
      <div className="flex justify-between text-sm font-semibold text-gray-900 border-t pt-2 mt-1 px-1">
        <span>Total piezas</span>
        <span>{totalPieces}</span>
      </div>
    </div>
  )
}

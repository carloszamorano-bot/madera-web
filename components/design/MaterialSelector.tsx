'use client'

import { useDesignStore } from '@/store/design-store'
import type { Material, Color } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MaterialSelectorProps {
  open: boolean
  onClose: () => void
}

export default function MaterialSelector({ open, onClose }: MaterialSelectorProps) {
  const { materials, colors, selectedMaterialId, selectedColorId, setMaterial, setColor } =
    useDesignStore()

  const filteredColors = colors.filter((c) => c.materialId === selectedMaterialId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar material y color</DialogTitle>
        </DialogHeader>

        {/* Materials */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Material</p>
          <div className="grid grid-cols-2 gap-2">
            {materials.map((m) => (
              <button
                key={m.id}
                onClick={() => setMaterial(m.id)}
                className={cn(
                  'text-left rounded-lg border px-3 py-2 text-sm transition-colors',
                  m.id === selectedMaterialId
                    ? 'border-[#E8401C] bg-[#E8401C]/5 text-[#E8401C] font-semibold'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                )}
              >
                <span className="font-medium">{m.name}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{m.thicknessMm}mm</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2 mt-4">
          <p className="text-sm font-semibold text-gray-700">Color</p>
          <div className="grid grid-cols-4 gap-2">
            {filteredColors.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                title={c.name}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all',
                  c.id === selectedColorId
                    ? 'border-[#E8401C] scale-105'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <div
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: c.hexCode }}
                />
                <span className="text-xs text-gray-600 text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

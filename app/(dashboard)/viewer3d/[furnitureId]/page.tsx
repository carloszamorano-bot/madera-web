'use client'

import dynamic from 'next/dynamic'
import { useDesignStore } from '@/store/design-store'

const Viewer3D = dynamic(() => import('@/components/viewer3d/Viewer3D'), { ssr: false })

export default function Viewer3DPage() {
  const {
    selectedType, widthMm, heightMm, depthMm,
    shelves, drawers, doors,
    selectedMaterialId, selectedColorId, selectedEdgeType,
    materials, colors,
  } = useDesignStore()

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
  const selectedColor = colors.find((c) => c.id === selectedColorId)

  if (!selectedMaterial || !selectedColor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
        <p className="text-4xl">🧊</p>
        <p className="text-gray-500">Configura un mueble para ver el visor 3D.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visor 3D</h1>
        <p className="text-sm text-gray-500">
          {selectedType.replace(/_/g, ' ')} · {selectedMaterial.name} · {selectedColor.name}
        </p>
      </div>
      <Viewer3D
        config={{ type: selectedType, widthMm, heightMm, depthMm, shelves, drawers, doors, materialId: selectedMaterialId, colorId: selectedColorId, edgeType: selectedEdgeType }}
        colorHex={selectedColor.hexCode}
        thicknessMm={selectedMaterial.thicknessMm}
      />
    </div>
  )
}

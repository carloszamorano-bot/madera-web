'use client'

import { useRouter } from 'next/navigation'
import { FURNITURE_DISPLAY_INFO } from '@/lib/algorithms/furniture-pieces'
import { useDesignStore } from '@/store/design-store'
import type { FurnitureType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

const FURNITURE_TYPES: FurnitureType[] = [
  'CLOSET_CORRIDO',
  'CLOSET_ESQUINERO',
  'DESPENSERO',
  'RACK_TV',
  'ESCRITORIO',
  'MESA_COMEDOR',
  'COCINA_MODULAR',
  'ESTANTERIA',
  'CAJONERA',
  'VELADOR',
]

export default function FurnitureGallery() {
  const router = useRouter()
  const initForType = useDesignStore((s) => s.initForType)

  const handleSelect = (type: FurnitureType) => {
    initForType(type)
    router.push(`/design/${type.toLowerCase()}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Diseñar Mueble</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {FURNITURE_TYPES.map((type) => {
          const info = FURNITURE_DISPLAY_INFO[type]
          return (
            <Card
              key={type}
              className="cursor-pointer hover:shadow-md hover:border-[#E8401C] transition-all active:scale-95"
              onClick={() => handleSelect(type)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <span className="text-4xl">{info.emoji}</span>
                <p className="font-semibold text-sm text-gray-900 leading-tight">
                  {info.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {info.defaultWidth}×{info.defaultHeight}×{info.defaultDepth}mm
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

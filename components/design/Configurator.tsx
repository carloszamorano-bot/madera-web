'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDesignStore } from '@/store/design-store'
import { FURNITURE_DISPLAY_INFO } from '@/lib/algorithms/furniture-pieces'
import { createClient } from '@/lib/supabase/client'
import CountStepper from './CountStepper'
import PiecesList from './PiecesList'
import MaterialSelector from './MaterialSelector'
import AccessoriesList from './AccessoriesList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Scissors, Box } from 'lucide-react'
import type { Material, Color } from '@/types'
import { calculateAccessories } from '@/lib/algorithms/accessories'

export default function Configurator() {
  const router = useRouter()
  const [materialSelectorOpen, setMaterialSelectorOpen] = useState(false)

  const {
    selectedType, widthMm, heightMm, depthMm,
    shelves, drawers, doors,
    selectedMaterialId, selectedColorId, selectedEdgeType,
    materials, colors, calculatedPieces, errors,
    setWidth, setHeight, setDepth,
    setShelves, setDrawers, setDoors,
    setMaterials, setColors,
    recalculate,
  } = useDesignStore()

  const info = FURNITURE_DISPLAY_INFO[selectedType]
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
  const selectedColor = colors.find((c) => c.id === selectedColorId)

  // Load materials + colors from Supabase
  useEffect(() => {
    const supabase = createClient()
    async function loadCatalog() {
      const [{ data: mats }, { data: cols }] = await Promise.all([
        supabase.from('materials').select('*').order('id'),
        supabase.from('colors').select('*').order('material_id, name'),
      ])
      if (mats) {
        setMaterials(
          mats.map((m) => ({
            id: m.id, name: m.name, thicknessMm: m.thickness_mm, type: m.type,
          }))
        )
      }
      if (cols) {
        setColors(
          cols.map((c) => ({
            id: c.id, materialId: c.material_id, name: c.name, hexCode: c.hex_code,
          }))
        )
      }
    }
    loadCatalog()
  }, [setMaterials, setColors])

  const handleCalculate = () => {
    if (!selectedMaterial) return
    recalculate(selectedMaterial.thicknessMm)
  }

  const handleCuts = () => {
    handleCalculate()
    router.push('/cutting/new')
  }

  const handleViewer3D = () => {
    handleCalculate()
    router.push('/viewer3d/new')
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{info.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{info.displayName}</h1>
          <p className="text-sm text-gray-500">Configurar dimensiones y material</p>
        </div>
      </div>

      {/* Dimensions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dimensiones (mm)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="width" className="text-xs">Ancho</Label>
              <Input
                id="width"
                type="number"
                value={widthMm}
                onChange={(e) => setWidth(Number(e.target.value))}
                className={errors.widthMm ? 'border-red-400' : ''}
              />
              {errors.widthMm && <p className="text-xs text-red-500">{errors.widthMm}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="height" className="text-xs">Alto</Label>
              <Input
                id="height"
                type="number"
                value={heightMm}
                onChange={(e) => setHeight(Number(e.target.value))}
                className={errors.heightMm ? 'border-red-400' : ''}
              />
              {errors.heightMm && <p className="text-xs text-red-500">{errors.heightMm}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="depth" className="text-xs">Profundidad</Label>
              <Input
                id="depth"
                type="number"
                value={depthMm}
                onChange={(e) => setDepth(Number(e.target.value))}
                className={errors.depthMm ? 'border-red-400' : ''}
              />
              {errors.depthMm && <p className="text-xs text-red-500">{errors.depthMm}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counts */}
      {(info.hasShelves || info.hasDrawers || info.hasDoors) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Accesorios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {info.hasShelves && (
              <CountStepper label="Repisas" value={shelves} onChange={setShelves} max={8} />
            )}
            {info.hasDrawers && (
              <CountStepper label="Cajones" value={drawers} onChange={setDrawers} max={8} />
            )}
            {info.hasDoors && (
              <CountStepper label="Puertas" value={doors} onChange={setDoors} max={6} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Material */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Material y color</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setMaterialSelectorOpen(true)}
            className="flex items-center gap-3 w-full text-left rounded-lg border border-gray-200 hover:border-[#E8401C] px-4 py-3 transition-colors"
          >
            {selectedColor && (
              <div
                className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: selectedColor.hexCode }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{selectedMaterial?.name ?? 'Seleccionar...'}</p>
              <p className="text-xs text-gray-500">{selectedColor?.name ?? ''}</p>
            </div>
            <Palette size={18} className="text-gray-400 flex-shrink-0" />
          </button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={handleCalculate}
          disabled={hasErrors}
          variant="outline"
          className="flex-1 min-w-[120px]"
        >
          Calcular piezas
        </Button>
        <Button
          onClick={handleCuts}
          disabled={hasErrors}
          className="flex-1 min-w-[120px] bg-[#E8401C] hover:bg-[#c73518]"
        >
          <Scissors size={16} className="mr-2" />
          Plan de corte
        </Button>
        <Button
          onClick={handleViewer3D}
          disabled={hasErrors}
          variant="outline"
          className="flex-1 min-w-[120px] border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10"
        >
          <Box size={16} className="mr-2" />
          Ver 3D
        </Button>
      </div>

      {/* Pieces + Accessories tabs */}
      {calculatedPieces.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <Tabs defaultValue="pieces">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="pieces" className="flex-1">Piezas</TabsTrigger>
                <TabsTrigger value="accessories" className="flex-1">Herrajes</TabsTrigger>
              </TabsList>
              <TabsContent value="pieces">
                <PiecesList pieces={calculatedPieces} />
              </TabsContent>
              <TabsContent value="accessories">
                <AccessoriesList
                  accessories={calculateAccessories(
                    {
                      type: selectedType,
                      widthMm, heightMm, depthMm,
                      shelves, drawers, doors,
                      materialId: selectedMaterialId,
                      colorId: selectedColorId,
                      edgeType: selectedEdgeType,
                    },
                    calculatedPieces
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <MaterialSelector open={materialSelectorOpen} onClose={() => setMaterialSelectorOpen(false)} />
    </div>
  )
}

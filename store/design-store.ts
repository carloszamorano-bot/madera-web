import { create } from 'zustand'
import type { FurnitureType, EdgeType, Material, Color, Piece } from '@/types'
import { calculatePieces, FURNITURE_DISPLAY_INFO } from '@/lib/algorithms/furniture-pieces'
import { validateDimensions, type DimensionErrors } from '@/lib/validators/dimensions'

interface DesignState {
  // Selection
  selectedType: FurnitureType
  // Dimensions
  widthMm: number
  heightMm: number
  depthMm: number
  // Counts
  shelves: number
  drawers: number
  doors: number
  // Material
  selectedMaterialId: number
  selectedColorId: number
  selectedEdgeType: EdgeType
  // Catalogs
  materials: Material[]
  colors: Color[]
  // Calculated
  calculatedPieces: Piece[]
  // Validation
  errors: DimensionErrors
  // Saved furniture id (after generating cuts or 3D)
  savedFurnitureId: number | null
}

interface DesignActions {
  initForType: (type: FurnitureType) => void
  setWidth: (v: number) => void
  setHeight: (v: number) => void
  setDepth: (v: number) => void
  setShelves: (v: number) => void
  setDrawers: (v: number) => void
  setDoors: (v: number) => void
  setMaterial: (materialId: number) => void
  setColor: (colorId: number) => void
  setEdgeType: (edgeType: EdgeType) => void
  setMaterials: (materials: Material[]) => void
  setColors: (colors: Color[]) => void
  recalculate: (thicknessMm: number) => void
  setSavedFurnitureId: (id: number | null) => void
}

const DEFAULT_TYPE: FurnitureType = 'CLOSET_CORRIDO'
const info = FURNITURE_DISPLAY_INFO[DEFAULT_TYPE]

export const useDesignStore = create<DesignState & DesignActions>((set, get) => ({
  selectedType: DEFAULT_TYPE,
  widthMm: info.defaultWidth,
  heightMm: info.defaultHeight,
  depthMm: info.defaultDepth,
  shelves: 3,
  drawers: 0,
  doors: 2,
  selectedMaterialId: 2, // Melamina 18mm
  selectedColorId: 13,   // Blanco (material 2)
  selectedEdgeType: 'PVC_0_4MM',
  materials: [],
  colors: [],
  calculatedPieces: [],
  errors: {},
  savedFurnitureId: null,

  initForType: (type) => {
    const i = FURNITURE_DISPLAY_INFO[type]
    set({
      selectedType: type,
      widthMm: i.defaultWidth,
      heightMm: i.defaultHeight,
      depthMm: i.defaultDepth,
      shelves: i.hasShelves ? 3 : 0,
      drawers: i.hasDrawers ? 1 : 0,
      doors: i.hasDoors ? 2 : 0,
      errors: {},
      calculatedPieces: [],
      savedFurnitureId: null,
    })
  },

  setWidth: (v) => {
    const { selectedType, heightMm, depthMm } = get()
    const errors = validateDimensions(selectedType, v, heightMm, depthMm)
    set({ widthMm: v, errors })
  },
  setHeight: (v) => {
    const { selectedType, widthMm, depthMm } = get()
    const errors = validateDimensions(selectedType, widthMm, v, depthMm)
    set({ heightMm: v, errors })
  },
  setDepth: (v) => {
    const { selectedType, widthMm, heightMm } = get()
    const errors = validateDimensions(selectedType, widthMm, heightMm, v)
    set({ depthMm: v, errors })
  },
  setShelves: (v) => set({ shelves: Math.max(0, v) }),
  setDrawers: (v) => set({ drawers: Math.max(0, v) }),
  setDoors: (v) => set({ doors: Math.max(0, v) }),
  setMaterial: (materialId) => set({ selectedMaterialId: materialId }),
  setColor: (colorId) => set({ selectedColorId: colorId }),
  setEdgeType: (edgeType) => set({ selectedEdgeType: edgeType }),
  setMaterials: (materials) => set({ materials }),
  setColors: (colors) => set({ colors }),
  setSavedFurnitureId: (id) => set({ savedFurnitureId: id }),

  recalculate: (thicknessMm) => {
    const { selectedType, widthMm, heightMm, depthMm, shelves, drawers, doors, selectedMaterialId, selectedColorId, selectedEdgeType } = get()
    const pieces = calculatePieces(
      { type: selectedType, widthMm, heightMm, depthMm, shelves, drawers, doors, materialId: selectedMaterialId, colorId: selectedColorId, edgeType: selectedEdgeType },
      thicknessMm
    )
    set({ calculatedPieces: pieces })
  },
}))

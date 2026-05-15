// ── Furniture ─────────────────────────────────────────────────────────────────

export type FurnitureType =
  | 'CLOSET_CORRIDO'
  | 'CLOSET_ESQUINERO'
  | 'DESPENSERO'
  | 'RACK_TV'
  | 'ESCRITORIO'
  | 'MESA_COMEDOR'
  | 'COCINA_MODULAR'
  | 'ESTANTERIA'
  | 'CAJONERA'
  | 'VELADOR'

export type EdgeType = 'SIN_CANTO' | 'PVC_0_4MM' | 'PVC_2MM'

export interface FurnitureConfig {
  type: FurnitureType
  widthMm: number
  heightMm: number
  depthMm: number
  shelves: number
  drawers: number
  doors: number
  materialId: number
  colorId: number
  edgeType: EdgeType
}

export interface FurnitureDisplayInfo {
  type: FurnitureType
  displayName: string
  emoji: string
  defaultWidth: number
  defaultHeight: number
  defaultDepth: number
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  minDepth: number
  maxDepth: number
  hasShelves: boolean
  hasDrawers: boolean
  hasDoors: boolean
}

// ── Materials & Colors ────────────────────────────────────────────────────────

export interface Material {
  id: number
  name: string
  thicknessMm: number
  type: 'MELAMINA' | 'MDF' | 'AGLOMERADO'
}

export interface Color {
  id: number
  materialId: number
  name: string
  hexCode: string
}

// ── Pieces ────────────────────────────────────────────────────────────────────

export interface Piece {
  label: string
  widthMm: number
  heightMm: number
  quantity: number
  edgeTop?: boolean
  edgeBottom?: boolean
  edgeLeft?: boolean
  edgeRight?: boolean
}

// ── Cutting ───────────────────────────────────────────────────────────────────

export interface CutPiece {
  label: string
  widthMm: number
  heightMm: number
  furnitureLabel: string
}

export interface PlacedPiece {
  piece: CutPiece
  x: number
  y: number
  rotated: boolean
}

export interface SheetLayout {
  sheetIndex: number
  pieces: PlacedPiece[]
  wastePercent: number
}

export interface CuttingResult {
  sheets: SheetLayout[]
  totalSheets: number
  totalWastePercent: number
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'BORRADOR'
  | 'COTIZADO'
  | 'EN_CONSTRUCCION'
  | 'COMPLETADO'

export interface Project {
  id: number
  userId: string
  name: string
  status: ProjectStatus
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  fullName: string | null
  company: string | null
  phone: string | null
  createdAt: string
}

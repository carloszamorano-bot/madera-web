import type { FurnitureConfig, FurnitureType, Piece } from '@/types'

// ── Display info ──────────────────────────────────────────────────────────────

export interface FurnitureDisplayInfo {
  type: FurnitureType
  displayName: string
  emoji: string
  defaultWidth: number
  defaultHeight: number
  defaultDepth: number
  minWidth: number; maxWidth: number
  minHeight: number; maxHeight: number
  minDepth: number; maxDepth: number
  hasShelves: boolean
  hasDrawers: boolean
  hasDoors: boolean
}

export const FURNITURE_DISPLAY_INFO: Record<FurnitureType, FurnitureDisplayInfo> = {
  CLOSET_CORRIDO: {
    type: 'CLOSET_CORRIDO', displayName: 'Clóset Corrido', emoji: '🚪',
    defaultWidth: 2400, defaultHeight: 2400, defaultDepth: 600,
    minWidth: 600, maxWidth: 3600, minHeight: 1800, maxHeight: 2700,
    minDepth: 400, maxDepth: 800, hasShelves: true, hasDrawers: true, hasDoors: true,
  },
  CLOSET_ESQUINERO: {
    type: 'CLOSET_ESQUINERO', displayName: 'Clóset Esquinero', emoji: '↙️',
    defaultWidth: 1200, defaultHeight: 2400, defaultDepth: 600,
    minWidth: 800, maxWidth: 1800, minHeight: 1800, maxHeight: 2700,
    minDepth: 400, maxDepth: 800, hasShelves: true, hasDrawers: true, hasDoors: true,
  },
  DESPENSERO: {
    type: 'DESPENSERO', displayName: 'Despensero', emoji: '🧹',
    defaultWidth: 600, defaultHeight: 1800, defaultDepth: 400,
    minWidth: 300, maxWidth: 900, minHeight: 1200, maxHeight: 2400,
    minDepth: 300, maxDepth: 600, hasShelves: true, hasDrawers: false, hasDoors: true,
  },
  RACK_TV: {
    type: 'RACK_TV', displayName: 'Rack TV', emoji: '📺',
    defaultWidth: 1800, defaultHeight: 600, defaultDepth: 400,
    minWidth: 900, maxWidth: 2700, minHeight: 300, maxHeight: 1200,
    minDepth: 300, maxDepth: 600, hasShelves: true, hasDrawers: false, hasDoors: false,
  },
  ESCRITORIO: {
    type: 'ESCRITORIO', displayName: 'Escritorio', emoji: '💻',
    defaultWidth: 1400, defaultHeight: 750, defaultDepth: 600,
    minWidth: 800, maxWidth: 2400, minHeight: 600, maxHeight: 900,
    minDepth: 400, maxDepth: 800, hasShelves: false, hasDrawers: true, hasDoors: false,
  },
  MESA_COMEDOR: {
    type: 'MESA_COMEDOR', displayName: 'Mesa Comedor', emoji: '🍽️',
    defaultWidth: 1600, defaultHeight: 750, defaultDepth: 900,
    minWidth: 800, maxWidth: 3000, minHeight: 700, maxHeight: 900,
    minDepth: 700, maxDepth: 1200, hasShelves: false, hasDrawers: false, hasDoors: false,
  },
  COCINA_MODULAR: {
    type: 'COCINA_MODULAR', displayName: 'Cocina Modular', emoji: '🍳',
    defaultWidth: 2400, defaultHeight: 900, defaultDepth: 600,
    minWidth: 600, maxWidth: 3600, minHeight: 600, maxHeight: 1200,
    minDepth: 400, maxDepth: 700, hasShelves: true, hasDrawers: true, hasDoors: true,
  },
  ESTANTERIA: {
    type: 'ESTANTERIA', displayName: 'Estantería', emoji: '📚',
    defaultWidth: 900, defaultHeight: 1800, defaultDepth: 300,
    minWidth: 400, maxWidth: 2400, minHeight: 600, maxHeight: 2400,
    minDepth: 150, maxDepth: 500, hasShelves: true, hasDrawers: false, hasDoors: false,
  },
  CAJONERA: {
    type: 'CAJONERA', displayName: 'Cajonera', emoji: '🗄️',
    defaultWidth: 600, defaultHeight: 900, defaultDepth: 450,
    minWidth: 300, maxWidth: 1200, minHeight: 400, maxHeight: 1500,
    minDepth: 300, maxDepth: 600, hasShelves: false, hasDrawers: true, hasDoors: false,
  },
  VELADOR: {
    type: 'VELADOR', displayName: 'Velador', emoji: '🛏️',
    defaultWidth: 500, defaultHeight: 550, defaultDepth: 400,
    minWidth: 300, maxWidth: 800, minHeight: 400, maxHeight: 800,
    minDepth: 300, maxDepth: 600, hasShelves: true, hasDrawers: true, hasDoors: false,
  },
}

// ── Piece calculation ─────────────────────────────────────────────────────────

export function calculatePieces(config: FurnitureConfig, thicknessMm: number): Piece[] {
  const { type, widthMm: w, heightMm: h, depthMm: d, shelves, drawers, doors } = config
  const t = thicknessMm

  switch (type) {
    case 'CLOSET_CORRIDO':
    case 'CLOSET_ESQUINERO':
    case 'DESPENSERO':
    case 'RACK_TV':
    case 'ESTANTERIA':
      return closetBase(w, h, d, t, shelves, drawers, doors)
    case 'ESCRITORIO':
      return escritorio(w, h, d, t, drawers)
    case 'MESA_COMEDOR':
      return mesaComedor(w, h, d, t)
    case 'COCINA_MODULAR':
      return cocinaModular(w, h, d, t, shelves, drawers, doors)
    case 'CAJONERA':
      return cajonera(w, h, d, t, drawers)
    case 'VELADOR':
      return velador(w, h, d, t, shelves, drawers)
    default:
      return []
  }
}

// ── Helper: piezas de la CAJA de un cajón ─────────────────────────────────────
// Lateral cajón, Base cajón, Fondo cajón (panel trasero de la caja)
function drawerBoxPieces(iw: number, d: number, t: number, dh: number, qty: number): Piece[] {
  const st = Math.max(12, t - 4)           // grosor lateral cajón (más delgado)
  const innerW = iw - 4 - 2 * st          // ancho interior caja
  const boxD = d - t - 30                  // profundidad caja (30mm menos que gabinete)
  return [
    { label: 'Lateral cajón', widthMm: boxD, heightMm: dh - 4, quantity: qty * 2 },
    { label: 'Base cajón',    widthMm: innerW, heightMm: boxD,   quantity: qty },
    { label: 'Fondo cajón',   widthMm: innerW, heightMm: dh - st - 4, quantity: qty },
  ]
}

function closetBase(w: number, h: number, d: number, t: number, shelves: number, drawers: number, doors: number): Piece[] {
  const iw = w - 2 * t
  const ih = h - 2 * t
  const pieces: Piece[] = [
    { label: 'Lateral Izq.', widthMm: d, heightMm: h, quantity: 1, edgeTop: true, edgeBottom: true },
    { label: 'Lateral Der.', widthMm: d, heightMm: h, quantity: 1, edgeTop: true, edgeBottom: true },
    { label: 'Techo',        widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
    { label: 'Base',         widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
    { label: 'Fondo',        widthMm: iw, heightMm: ih, quantity: 1 },
  ]
  if (shelves > 0) {
    pieces.push({ label: 'Repisa', widthMm: iw, heightMm: d, quantity: shelves, edgeLeft: true, edgeRight: true })
  }
  if (drawers > 0) {
    const drawerAreaH = ih * 0.35
    const dh = Math.floor((drawerAreaH - drawers * 4) / drawers)
    pieces.push({ label: 'Frente cajón', widthMm: iw - 4, heightMm: dh, quantity: drawers, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true })
    pieces.push(...drawerBoxPieces(iw, d, t, dh, drawers))
  }
  if (doors > 0) {
    const doorW = Math.floor(iw / doors)
    pieces.push({ label: 'Puerta', widthMm: doorW - 4, heightMm: ih - 4, quantity: doors, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true })
  }
  return pieces
}

function escritorio(w: number, h: number, d: number, t: number, drawers: number): Piece[] {
  const iw = w - 2 * t
  const pieces: Piece[] = [
    { label: 'Tablero', widthMm: w, heightMm: d, quantity: 1, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true },
    { label: 'Lateral Izq.', widthMm: d, heightMm: h - t, quantity: 1, edgeBottom: true },
    { label: 'Lateral Der.', widthMm: d, heightMm: h - t, quantity: 1, edgeBottom: true },
    { label: 'Fondo', widthMm: iw, heightMm: h - t, quantity: 1 },
  ]
  if (drawers > 0) {
    const dh = Math.floor((h - t - 4 * drawers) / drawers)
    pieces.push({ label: 'Frente cajón', widthMm: iw - 4, heightMm: dh, quantity: drawers, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true })
    pieces.push(...drawerBoxPieces(iw, d, t, dh, drawers))
  }
  return pieces
}

function mesaComedor(w: number, h: number, d: number, t: number): Piece[] {
  return [
    { label: 'Tablero', widthMm: w, heightMm: d, quantity: 1, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true },
    { label: 'Pata', widthMm: d - 2 * t, heightMm: h - t, quantity: 4, edgeBottom: true },
    { label: 'Travesaño largo', widthMm: w - 2 * t - 4, heightMm: h - t - 4, quantity: 2 },
    { label: 'Travesaño corto', widthMm: d - 2 * t - 4, heightMm: h - t - 4, quantity: 2 },
  ]
}

function cocinaModular(w: number, h: number, d: number, t: number, shelves: number, drawers: number, doors: number): Piece[] {
  const iw = w - 2 * t
  const ih = h - 2 * t
  const pieces: Piece[] = [
    { label: 'Lateral', widthMm: d, heightMm: h, quantity: 2, edgeTop: true, edgeBottom: true },
    { label: 'Techo', widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
    { label: 'Base', widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
    { label: 'Fondo', widthMm: iw, heightMm: ih, quantity: 1 },
  ]
  if (shelves > 0) {
    pieces.push({ label: 'Repisa', widthMm: iw, heightMm: d, quantity: shelves, edgeLeft: true, edgeRight: true })
  }
  if (drawers > 0) {
    const dh = Math.floor((ih * 0.4) / drawers)
    pieces.push({ label: 'Frente cajón', widthMm: iw - 4, heightMm: dh, quantity: drawers, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true })
    pieces.push(...drawerBoxPieces(iw, d, t, dh, drawers))
  }
  if (doors > 0) {
    const doorW = Math.floor(iw / doors)
    pieces.push({ label: 'Puerta', widthMm: doorW - 4, heightMm: ih - 4, quantity: doors, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true })
  }
  return pieces
}

function cajonera(w: number, h: number, d: number, t: number, drawers: number): Piece[] {
  const iw = w - 2 * t
  const ih = h - 2 * t
  const numDrawers = Math.max(1, drawers)
  const dh = Math.floor((ih - numDrawers * 4) / numDrawers)
  return [
    { label: 'Lateral', widthMm: d, heightMm: h, quantity: 2, edgeTop: true, edgeBottom: true },
    { label: 'Techo', widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
    { label: 'Base', widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
    { label: 'Fondo', widthMm: iw, heightMm: ih, quantity: 1 },
    { label: 'Frente cajón', widthMm: iw - 4, heightMm: dh, quantity: numDrawers, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true },
    ...drawerBoxPieces(iw, d, t, dh, numDrawers),
  ]
}

function velador(w: number, h: number, d: number, t: number, shelves: number, drawers: number): Piece[] {
  const iw = w - 2 * t
  const ih = h - 2 * t
  const pieces: Piece[] = [
    { label: 'Tablero', widthMm: w, heightMm: d, quantity: 1, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true },
    { label: 'Lateral', widthMm: d, heightMm: h - t, quantity: 2, edgeBottom: true },
    { label: 'Fondo', widthMm: iw, heightMm: h - 2 * t, quantity: 1 },
    { label: 'Base', widthMm: iw, heightMm: d, quantity: 1, edgeLeft: true, edgeRight: true },
  ]
  if (shelves > 0) {
    pieces.push({ label: 'Repisa', widthMm: iw, heightMm: d, quantity: shelves, edgeLeft: true, edgeRight: true })
  }
  if (drawers > 0) {
    const dh = Math.floor((ih * 0.35) / drawers)
    pieces.push({ label: 'Frente cajón', widthMm: iw - 4, heightMm: dh, quantity: drawers, edgeTop: true, edgeBottom: true, edgeLeft: true, edgeRight: true })
    pieces.push(...drawerBoxPieces(iw, d, t, dh, drawers))
  }
  return pieces
}

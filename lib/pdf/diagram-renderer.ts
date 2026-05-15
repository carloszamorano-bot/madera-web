/**
 * diagram-renderer.ts
 * Renders HTML5 Canvas assembly step diagrams → base64 PNG
 * Canvas: 500 × 300 px (aspectRatio = 0.6)
 */
import type { FurnitureConfig } from '@/types'

export type DiagramKey = 'cabinet-box' | 'drawer-slide' | 'door-hinge' | 'handle'

const CW = 500
const CH = 300
export const DIAGRAM_ASPECT = CH / CW  // 0.6 — pass to drawImage({ aspectRatio })

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  bg:          '#FAFAFA',
  panel:       '#DEB887',
  panelStroke: '#8B6914',
  panelDark:   '#C4965A',
  interior:    '#F5E6C8',
  metal:       '#B8B8C8',
  metalDark:   '#888898',
  metalLight:  '#D4D4E4',
  screw:       '#808080',
  accent:      '#E8401C',
  accentLight: '#F5A623',
  label:       '#1A1A1A',
  labelGray:   '#555555',
  grid:        '#E8E8E8',
  arrow:       '#E8401C',
  hinge:       '#CC3311',
  dim:         '#888888',
}

// ── Drawing helpers ─────────────────────────────────────────────────────────

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, CW, CH)
  return [canvas, ctx]
}

function rect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string, stroke?: string, lineW = 1.5
) {
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineW
    ctx.stroke()
  }
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  color = C.label, size = 11, bold = false, align: CanvasTextAlign = 'center'
) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px Inter, Arial, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(text, x, y)
  ctx.textAlign = 'left'
}

function arrowRight(ctx: CanvasRenderingContext2D, x: number, y: number, len = 40) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + len, y)
  ctx.strokeStyle = C.arrow
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + len, y)
  ctx.lineTo(x + len - 8, y - 5)
  ctx.lineTo(x + len - 8, y + 5)
  ctx.closePath()
  ctx.fillStyle = C.arrow
  ctx.fill()
}

function arrowDown(ctx: CanvasRenderingContext2D, x: number, y: number, len = 30) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + len)
  ctx.strokeStyle = C.arrow
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y + len)
  ctx.lineTo(x - 5, y + len - 8)
  ctx.lineTo(x + 5, y + len - 8)
  ctx.closePath()
  ctx.fillStyle = C.arrow
  ctx.fill()
}

function minifix(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.arc(x, y, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#FF8800'
  ctx.fill()
  ctx.strokeStyle = '#CC5500'
  ctx.lineWidth = 1
  ctx.stroke()
  // Cross
  ctx.beginPath()
  ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y)
  ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3)
  ctx.strokeStyle = '#CC5500'
  ctx.lineWidth = 1
  ctx.stroke()
}

function screw(ctx: CanvasRenderingContext2D, x: number, y: number, r = 5) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = C.screw
  ctx.fill()
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 0.8
  ctx.stroke()
  // Slot
  ctx.beginPath()
  ctx.moveTo(x - r + 2, y); ctx.lineTo(x + r - 2, y)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1.2
  ctx.stroke()
}

function dimLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y: number, x2: number,
  text: string
) {
  ctx.beginPath()
  ctx.moveTo(x1, y - 6); ctx.lineTo(x1, y + 6)
  ctx.moveTo(x1, y); ctx.lineTo(x2, y)
  ctx.moveTo(x2, y - 6); ctx.lineTo(x2, y + 6)
  ctx.strokeStyle = C.dim
  ctx.lineWidth = 1
  ctx.stroke()
  label(ctx, text, (x1 + x2) / 2, y - 8, C.dim, 10)
}

function titleBar(ctx: CanvasRenderingContext2D, text: string) {
  rect(ctx, 0, 0, CW, 26, C.accent)
  label(ctx, text, CW / 2, 17, '#FFFFFF', 12, true)
}

function badge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = C.accent) {
  const w = ctx.measureText(text).width + 14
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - 11, w, 18, 4)
  ctx.fillStyle = color + '22'
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()
  label(ctx, text, x, y + 1, color, 9, true)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAM 1: Cabinet box assembly (front elevation)
// ═══════════════════════════════════════════════════════════════════════════════

function drawCabinetBox(ctx: CanvasRenderingContext2D, config: FurnitureConfig) {
  titleBar(ctx, 'PASO: ARMAR LA CAJA PRINCIPAL')

  const T = 18  // nominal thickness for diagram
  const fw = 200, fh = 190  // drawn dimensions
  const ox = 80, oy = 45   // origin

  // ── Back panel (dashed, behind) ──
  ctx.setLineDash([4, 3])
  ctx.strokeStyle = C.panelStroke
  ctx.lineWidth = 1
  ctx.strokeRect(ox + T, oy + T, fw - 2 * T, fh - 2 * T)
  ctx.setLineDash([])

  // ── Left lateral ──
  rect(ctx, ox, oy, T, fh, C.panel, C.panelStroke, 1.5)
  // ── Right lateral ──
  rect(ctx, ox + fw - T, oy, T, fh, C.panel, C.panelStroke, 1.5)
  // ── Top (techo) ──
  rect(ctx, ox + T, oy, fw - 2 * T, T, C.panelDark, C.panelStroke, 1.5)
  // ── Bottom (base) ──
  rect(ctx, ox + T, oy + fh - T, fw - 2 * T, T, C.panelDark, C.panelStroke, 1.5)

  // ── Minifix positions (4 corners) ──
  minifix(ctx, ox + T - 2, oy + T + 12)
  minifix(ctx, ox + T + 12, oy + T - 2)
  minifix(ctx, ox + fw - T + 2, oy + T + 12)
  minifix(ctx, ox + fw - T - 12, oy + T - 2)
  minifix(ctx, ox + T - 2, oy + fh - T - 12)
  minifix(ctx, ox + T + 12, oy + fh - T + 2)
  minifix(ctx, ox + fw - T + 2, oy + fh - T - 12)
  minifix(ctx, ox + fw - T - 12, oy + fh - T + 2)

  // ── Assembly arrows ──
  arrowDown(ctx, ox + T / 2, oy - 28, 22)   // left lateral down
  arrowDown(ctx, ox + fw - T / 2, oy - 28, 22)  // right lateral down

  // ── Labels ──
  label(ctx, 'LATERAL', ox - 38, oy + fh / 2, C.labelGray, 10, true, 'center')
  label(ctx, 'LATERAL', ox + fw + 38, oy + fh / 2, C.labelGray, 10, true, 'center')
  label(ctx, 'TECHO', ox + fw / 2, oy - 8, C.labelGray, 10, true)
  label(ctx, 'BASE', ox + fw / 2, oy + fh + 14, C.labelGray, 10, true)
  label(ctx, 'FONDO', ox + fw / 2, oy + fh / 2, C.panelStroke, 10, false)

  // ── Legend ──
  const lx = 330, ly = 60
  label(ctx, 'Leyenda:', lx, ly, C.label, 10, true, 'left')
  minifix(ctx, lx + 8, ly + 20)
  label(ctx, 'Minifix ×8', lx + 22, ly + 24, C.labelGray, 9, false, 'left')

  ctx.setLineDash([4, 3])
  ctx.strokeStyle = C.panelStroke
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(lx, ly + 42); ctx.lineTo(lx + 30, ly + 42); ctx.stroke()
  ctx.setLineDash([])
  label(ctx, 'Fondo', lx + 36, ly + 46, C.labelGray, 9, false, 'left')

  // ── Note ──
  label(ctx, 'Verifica ángulos 90° antes de ajustar minifix', CW / 2, CH - 8, C.dim, 9)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAM 2: Drawer slide cross-section (top view)
// ═══════════════════════════════════════════════════════════════════════════════

function drawDrawerSlide(ctx: CanvasRenderingContext2D, config: FurnitureConfig) {
  titleBar(ctx, 'DETALLE CORREDERA TELESCÓPICA — Vista superior')

  // Cross-section: cabinet opening + drawer box + rails
  const T = 20   // cabinet wall thickness
  const ST = 14  // drawer side thickness
  const totalW = 320
  const h = 100  // section height
  const ox = (CW - totalW) / 2
  const oy = 65

  const cajonW = totalW - 2 * T - 2 * 5  // inner width minus rail gap
  const railW = 5

  // ── Cabinet walls ──
  rect(ctx, ox, oy, T, h, C.panel, C.panelStroke, 1.5)
  rect(ctx, ox + totalW - T, oy, T, h, C.panel, C.panelStroke, 1.5)

  // ── Fixed rails (against cabinet wall inner face) ──
  rect(ctx, ox + T, oy + 10, railW, h - 20, C.metal, C.metalDark, 1.5)
  rect(ctx, ox + totalW - T - railW, oy + 10, railW, h - 20, C.metal, C.metalDark, 1.5)

  // ── Drawer box ──
  rect(ctx, ox + T + railW + 1, oy + (h - 80) / 2, cajonW, 80, C.interior, C.panelStroke, 1)
  // Drawer sides
  rect(ctx, ox + T + railW + 1, oy + (h - 80) / 2, ST, 80, C.panel, C.panelStroke, 1)
  rect(ctx, ox + totalW - T - railW - ST - 1, oy + (h - 80) / 2, ST, 80, C.panel, C.panelStroke, 1)

  // ── Moving rails (against drawer outer face) ──
  const mry = oy + (h - 80) / 2 + 15
  const mrh = 50
  rect(ctx, ox + T + railW + 1, mry, railW - 1, mrh, C.metalLight, C.metalDark, 1)
  rect(ctx, ox + totalW - T - railW - ST - railW + 1, mry, railW - 1, mrh, C.metalLight, C.metalDark, 1)

  // ── Screw dots on fixed rail ──
  screw(ctx, ox + T + railW / 2, oy + 28, 3)
  screw(ctx, ox + T + railW / 2, oy + h - 28, 3)
  screw(ctx, ox + totalW - T - railW / 2, oy + 28, 3)
  screw(ctx, ox + totalW - T - railW / 2, oy + h - 28, 3)

  // ── Screw dots on moving rail ──
  screw(ctx, ox + T + railW + 1 + railW / 2 - 0.5, mry + mrh / 2, 2.5)
  screw(ctx, ox + totalW - T - railW - ST - railW + 1 + (railW - 1) / 2, mry + mrh / 2, 2.5)

  // ── Pull-out arrow ──
  arrowRight(ctx, ox + totalW + 10, oy + h / 2, 50)
  label(ctx, 'Dirección\nextracción', ox + totalW + 36, oy + h / 2 + 18, C.arrow, 8, false, 'center')

  // ── Labels with leaders ──
  // Cabinet wall
  label(ctx, 'Lateral\ngabinete', ox - 10, oy + h / 2, C.labelGray, 9, false, 'right')
  ctx.beginPath(); ctx.moveTo(ox, oy + h / 2 - 5); ctx.lineTo(ox - 5, oy + h / 2 - 5)
  ctx.strokeStyle = C.dim; ctx.lineWidth = 0.8; ctx.stroke()

  // Fixed rail badge
  badge(ctx, 'Riel fijo', ox + T + railW / 2, oy - 12, C.metalDark)
  ctx.beginPath(); ctx.moveTo(ox + T + railW / 2, oy - 4); ctx.lineTo(ox + T + railW / 2, oy + 5)
  ctx.strokeStyle = C.metalDark; ctx.lineWidth = 1; ctx.stroke()

  // Moving rail badge
  badge(ctx, 'Riel móvil', ox + T + railW + 1 + railW / 2, oy + h + 14, C.metal)
  ctx.beginPath(); ctx.moveTo(ox + T + railW + 1 + railW / 2, oy + h + 8); ctx.lineTo(ox + T + railW + 1 + railW / 2, oy + h)
  ctx.strokeStyle = C.metal; ctx.lineWidth = 1; ctx.stroke()

  // Drawer label
  label(ctx, 'CAJÓN', ox + totalW / 2, oy + h / 2 + 4, C.panelStroke, 11, true)

  // ── Instructions below ──
  const iy = CH - 52
  label(ctx, '① Tornilla riel FIJO al lateral del gabinete', 20, iy, C.label, 9, false, 'left')
  label(ctx, '② Tornilla riel MÓVIL al lateral del cajón', 20, iy + 14, C.label, 9, false, 'left')
  label(ctx, '③ Desliza el cajón — debe correr sin esfuerzo', 20, iy + 28, C.label, 9, false, 'left')
  label(ctx, '④ Atornilla el frente del cajón desde adentro', CW / 2 + 10, iy, C.label, 9, false, 'left')
  label(ctx, '⚠ Verifica misma altura en ambos laterales', CW / 2 + 10, iy + 14, '#CC7700', 9, false, 'left')
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAM 3: Door + hinge positions
// ═══════════════════════════════════════════════════════════════════════════════

function drawDoorHinge(ctx: CanvasRenderingContext2D, config: FurnitureConfig) {
  titleBar(ctx, 'INSTALACIÓN DE BISAGRAS — Vista frontal')

  const hingeCount = config.heightMm > 1200 ? 3 : 2
  const dw = 110, dh = 200
  const ox = 80, oy = 45

  // ── Door panel ──
  rect(ctx, ox, oy, dw, dh, C.panel, C.panelStroke, 2)

  // ── Hinge positions (left side of door) ──
  const margin = 22  // 100mm scaled → ~22px
  const positions: number[] = [oy + margin]
  if (hingeCount === 3) positions.push(oy + dh / 2)
  positions.push(oy + dh - margin)

  positions.forEach((hy) => {
    // Hinge cup circle (cazoleta)
    ctx.beginPath()
    ctx.arc(ox + 14, hy, 9, 0, Math.PI * 2)
    ctx.fillStyle = C.hinge + '33'
    ctx.fill()
    ctx.strokeStyle = C.hinge
    ctx.lineWidth = 1.5
    ctx.stroke()
    // Hinge arm rectangle
    rect(ctx, ox + 22, hy - 6, 22, 12, C.metal + '88', C.metalDark, 1)
    // Mounting screws
    screw(ctx, ox + 9, hy - 5, 3)
    screw(ctx, ox + 9, hy + 5, 3)
  })

  // ── Dimension annotations ──
  const dimX = ox + dw + 20
  ctx.strokeStyle = C.dim; ctx.lineWidth = 0.8; ctx.setLineDash([3, 2])
  ctx.beginPath()
  ctx.moveTo(ox + 14, oy + margin); ctx.lineTo(dimX + 10, oy + margin)
  ctx.moveTo(ox + 14, oy + dh - margin); ctx.lineTo(dimX + 10, oy + dh - margin)
  ctx.stroke(); ctx.setLineDash([])

  ctx.beginPath()
  ctx.moveTo(dimX + 10, oy + margin); ctx.lineTo(dimX + 10, oy + dh - margin)
  ctx.strokeStyle = C.dim; ctx.lineWidth = 1; ctx.stroke()

  const tickY = [oy + margin, oy + dh - margin]
  tickY.forEach(y => {
    ctx.beginPath(); ctx.moveTo(dimX + 6, y); ctx.lineTo(dimX + 14, y)
    ctx.strokeStyle = C.dim; ctx.lineWidth = 1; ctx.stroke()
  })

  label(ctx, '100mm', dimX + 28, oy + margin + 6, C.dim, 9, false, 'left')
  label(ctx, '100mm', dimX + 28, oy + dh - margin + 6, C.dim, 9, false, 'left')

  if (hingeCount === 3) {
    ctx.strokeStyle = C.dim; ctx.lineWidth = 0.8; ctx.setLineDash([3, 2])
    ctx.beginPath(); ctx.moveTo(ox + 14, oy + dh / 2); ctx.lineTo(dimX + 10, oy + dh / 2)
    ctx.stroke(); ctx.setLineDash([])
    label(ctx, 'Centro', dimX + 28, oy + dh / 2 + 4, C.dim, 9, false, 'left')
  }

  // ── Legend panel ──
  const lx = 290, ly = 55
  rect(ctx, lx, ly, 195, hingeCount === 3 ? 130 : 110, '#F5F5F5', '#DDDDDD', 1)
  label(ctx, 'BISAGRA DE CAZOLETA 35mm', lx + 100, ly + 14, C.accent, 9, true)

  ctx.beginPath()
  ctx.arc(lx + 20, ly + 35, 9, 0, Math.PI * 2)
  ctx.fillStyle = C.hinge + '33'; ctx.fill()
  ctx.strokeStyle = C.hinge; ctx.lineWidth = 1.5; ctx.stroke()
  label(ctx, 'Rebaje ⌀35mm en la puerta', lx + 38, ly + 39, C.labelGray, 9, false, 'left')

  rect(ctx, lx + 12, ly + 55, 22, 10, C.metal + '88', C.metalDark, 1)
  label(ctx, 'Placa de montaje en mueble', lx + 38, ly + 63, C.labelGray, 9, false, 'left')

  label(ctx, `${hingeCount} bisagras por puerta`, lx + 100, ly + 82, C.label, 10, true)
  if (config.heightMm > 1200) {
    label(ctx, '(puerta alta > 1200mm)', lx + 100, ly + 96, C.dim, 8)
  }

  // ── Note ──
  label(ctx, 'Ajusta profundidad • altura • lateralidad con tornillos de regulación', CW / 2, CH - 8, C.dim, 9)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAM 4: Handle installation detail
// ═══════════════════════════════════════════════════════════════════════════════

function drawHandle(ctx: CanvasRenderingContext2D) {
  titleBar(ctx, 'INSTALACIÓN DE AGARRADERAS')

  // ── Door/drawer panel ──
  const ox = 60, oy = 45, pw = 150, ph = 200
  rect(ctx, ox, oy, pw, ph, C.panel, C.panelStroke, 2)

  // ── Handle position (centered horizontally, 40px from right edge) ──
  const hx = ox + pw - 30
  const hy = oy + ph / 2

  // Handle body
  rect(ctx, hx - 8, hy - 45, 16, 90, C.metal, C.metalDark, 2)
  // End caps
  ctx.beginPath(); ctx.arc(hx, hy - 45, 8, 0, Math.PI * 2)
  ctx.fillStyle = C.metal; ctx.fill(); ctx.strokeStyle = C.metalDark; ctx.lineWidth = 2; ctx.stroke()
  ctx.beginPath(); ctx.arc(hx, hy + 45, 8, 0, Math.PI * 2)
  ctx.fillStyle = C.metal; ctx.fill(); ctx.strokeStyle = C.metalDark; ctx.lineWidth = 2; ctx.stroke()

  // Screw holes (through door)
  screw(ctx, hx, hy - 35, 5)
  screw(ctx, hx, hy + 35, 5)

  // ── Exploded detail (right side) ──
  const ex = 290, ey = 70
  label(ctx, 'Detalle sección', ex + 60, ey - 5, C.label, 10, true)

  // Door section
  rect(ctx, ex, ey, 30, 80, C.panel, C.panelStroke, 1.5)
  // Through hole
  ctx.beginPath(); ctx.arc(ex + 15, ey + 40, 5, 0, Math.PI * 2)
  ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = C.panelStroke; ctx.lineWidth = 1; ctx.stroke()

  // Bolt from front
  ctx.beginPath(); ctx.moveTo(ex + 15, ey - 20); ctx.lineTo(ex + 15, ey)
  ctx.strokeStyle = C.metalDark; ctx.lineWidth = 2; ctx.stroke()
  rect(ctx, ex + 9, ey - 30, 12, 10, C.metal, C.metalDark, 1.5)

  // Nut / screw from back
  ctx.beginPath(); ctx.moveTo(ex + 15, ey + 80); ctx.lineTo(ex + 15, ey + 60)
  ctx.strokeStyle = C.metalDark; ctx.lineWidth = 2; ctx.stroke()
  ctx.beginPath(); ctx.arc(ex + 15, ey + 86, 7, 0, Math.PI * 2)
  ctx.fillStyle = C.metal; ctx.fill(); ctx.strokeStyle = C.metalDark; ctx.lineWidth = 1.5; ctx.stroke()

  // Handle body
  ctx.beginPath(); ctx.arc(ex - 20, ey + 40, 10, 0, Math.PI * 2)
  ctx.fillStyle = C.metal; ctx.fill(); ctx.strokeStyle = C.metalDark; ctx.lineWidth = 1.5; ctx.stroke()

  // Labels
  label(ctx, 'Tornillo M4', ex + 50, ey - 20, C.labelGray, 8, false, 'left')
  label(ctx, 'Puerta (18mm)', ex + 50, ey + 30, C.labelGray, 8, false, 'left')
  label(ctx, '⌀5mm', ex + 50, ey + 45, C.accent, 9, true, 'left')
  label(ctx, 'Tuerca', ex + 50, ey + 90, C.labelGray, 8, false, 'left')
  label(ctx, 'Agarradera', ex - 50, ey + 44, C.labelGray, 8, false, 'right')

  // ── Instructions ──
  const iy = CH - 54
  label(ctx, '① Marca posición centrada en la puerta/cajón', 20, iy, C.label, 9, false, 'left')
  label(ctx, '② Perfora ⌀5mm pasante con broca de madera', 20, iy + 14, C.label, 9, false, 'left')
  label(ctx, '③ Inserta tornillo M4×30mm desde el frente', 20, iy + 28, C.label, 9, false, 'left')
  label(ctx, '④ Ajusta la tuerca con llave desde adentro', CW / 2 + 10, iy, C.label, 9, false, 'left')
  label(ctx, '⑤ No aprietes en exceso — puede rajar la melamina', CW / 2 + 10, iy + 14, '#CC7700', 9, false, 'left')
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public entry point
// ═══════════════════════════════════════════════════════════════════════════════

export function renderDiagram(key: DiagramKey, config: FurnitureConfig): string {
  const [canvas, ctx] = makeCanvas()
  switch (key) {
    case 'cabinet-box':  drawCabinetBox(ctx, config);  break
    case 'drawer-slide': drawDrawerSlide(ctx, config); break
    case 'door-hinge':   drawDoorHinge(ctx, config);   break
    case 'handle':       drawHandle(ctx);              break
  }
  return canvas.toDataURL('image/png')
}

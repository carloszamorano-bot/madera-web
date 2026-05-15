import { PdfBuilder } from './pdf-builder'
import { renderDiagram, DIAGRAM_ASPECT, type DiagramKey } from './diagram-renderer'
import type { FurnitureConfig, Piece } from '@/types'
import { FURNITURE_DISPLAY_INFO } from '@/lib/algorithms/furniture-pieces'
import { calculateAccessories } from '@/lib/algorithms/accessories'

// ── Pasos de armado por tipo de mueble ─────────────────────────────────────

interface AssemblyStep {
  title: string
  instructions: string[]
  note?: string
  /** Clave del diagrama visual a renderizar debajo de las instrucciones */
  diagram?: DiagramKey
}

function getAssemblySteps(config: FurnitureConfig, pieces: Piece[]): AssemblyStep[] {
  const { type, drawers, doors, shelves } = config
  const hasDrawers = drawers > 0
  const hasDoors = doors > 0
  const hasShelves = shelves > 0

  const baseSteps: AssemblyStep[] = [
    {
      title: 'Preparación de piezas',
      instructions: [
        'Verifica que todas las piezas estén cortadas según la lista de cortes.',
        'Marca cada pieza con su etiqueta (Lateral, Techo, Base, etc.).',
        'Lija los bordes cortados que no llevan canto para evitar astillas.',
        'Revisa que los cantos PVC estén correctamente aplicados en los bordes indicados.',
      ],
      note: 'Trabaja sobre una superficie plana y limpia para evitar rayones.',
    },
  ]

  if (type === 'ESCRITORIO') {
    return [
      ...baseSteps,
      {
        title: 'Armar estructura base',
        instructions: [
          'Coloca los dos LATERALES verticales sobre la superficie de trabajo.',
          'Fija el TABLERO encima de los laterales con minifix (2 por lado).',
          'Verifica que los ángulos sean de 90° antes de ajustar los minifix.',
          'Instala el TRAVESAÑO trasero en la parte inferior para rigidizar.',
        ],
      },
      ...(hasShelves ? [{
        title: 'Instalar repisas intermedias',
        instructions: [
          'Marca las posiciones de los soportes a la misma altura en ambos laterales.',
          'Instala los soportes de repisa (o minifix) en los puntos marcados.',
          'Desliza cada REPISA sobre sus soportes y verifica que quede nivelada.',
        ],
      }] : []),
      ...(hasDrawers ? [drawerStep(drawers, config)] : []),
      finishingStep(),
    ]
  }

  if (type === 'MESA_COMEDOR') {
    return [
      ...baseSteps,
      {
        title: 'Armar el bastidor',
        instructions: [
          'Une los LARGUEROS con los TRAVESAÑOS formando un rectángulo.',
          'Usa tornillos de madera 4×40mm + cola de carpintero en cada unión.',
          'Verifica que el bastidor esté escuadrado antes de que seque la cola.',
          'Deja secar al menos 30 minutos antes de continuar.',
        ],
      },
      {
        title: 'Instalar las patas',
        instructions: [
          'Coloca cada PATA en la esquina correspondiente del bastidor.',
          'Fija con tornillos desde dentro del bastidor (2 tornillos por pata).',
          'Añade cola de carpintero para mayor resistencia.',
          'Coloca la mesa boca abajo y verifica que las 4 patas toquen el suelo.',
        ],
        note: 'Usa patas regulables de goma para compensar diferencias de nivel del piso.',
      },
      {
        title: 'Fijar el tablero',
        instructions: [
          'Coloca el TABLERO encima del bastidor boca abajo.',
          'Centra el tablero y fija con tornillos desde adentro del bastidor.',
          'Usa tornillos 4×30mm para no atravesar el tablero.',
        ],
      },
      finishingStep(),
    ]
  }

  // Default: closet / despensero / rack / estantería / cocina / cajonera / velador
  const steps: AssemblyStep[] = [
    ...baseSteps,
    {
      title: 'Armar la caja principal',
      diagram: 'cabinet-box',
      instructions: [
        'Coloca la BASE horizontal sobre la superficie de trabajo.',
        'Fija el LATERAL IZQUIERDO a la base usando minifix (2 unidades por unión).',
        'Fija el LATERAL DERECHO de la misma manera.',
        'Instala el TECHO entre los dos laterales con minifix.',
        'Verifica que todo forme ángulos de 90° con una escuadra.',
      ],
      note: 'Aprieta los minifix con destornillador plano. No uses fuerza excesiva para no rajar la melamina.',
    },
    {
      title: 'Instalar el fondo',
      instructions: [
        'Desliza el FONDO por la ranura trasera de los laterales (si aplica).',
        'Alternativamente, atornilla el fondo a los laterales con tornillos 3.5×16mm cada 200mm.',
        'El fondo rigidiza toda la estructura: asegúrate de que quede perfectamente cuadrado.',
      ],
    },
  ]

  if (hasShelves) {
    steps.push({
      title: 'Instalar repisas',
      instructions: [
        `Marca ${shelves} posición${shelves > 1 ? 'es' : ''} de repisa a la misma altura en ambos laterales.`,
        'Instala los soportes de repisa metálicos (4 por repisa) en los puntos marcados.',
        'Coloca cada REPISA sobre sus soportes.',
        'Verifica que queden horizontales con un nivel de burbuja.',
      ],
    })
  }

  if (hasDrawers) {
    steps.push(drawerStep(drawers, config))
  }

  if (hasDoors) {
    steps.push(doorStep(doors, config))
  }

  steps.push(finishingStep())
  return steps
}

function drawerStep(drawers: number, config: FurnitureConfig): AssemblyStep {
  return {
    title: `Instalar ${drawers} cajón${drawers > 1 ? 'es' : ''}`,
    diagram: 'drawer-slide',
    instructions: [
      '── Armar la CAJA del cajón ──',
      'Une los dos LATERALES CAJÓN con la BASE CAJÓN usando tornillos 3.5×16mm.',
      'Fija el FONDO CAJÓN (panel trasero) entre los laterales.',
      'Verifica que la caja esté cuadrada antes de ajustar los tornillos.',
      '── Instalar correderas telescópicas ──',
      'Marca la altura de las correderas en ambos laterales del mueble (usar nivel).',
      'Atornilla el RIEL FIJO al lateral del gabinete (2 tornillos por lado, M4×12).',
      'Atornilla el RIEL MÓVIL al lateral externo de la caja del cajón (2 tornillos).',
      '── Montar y ajustar ──',
      'Desliza la caja sobre las correderas y verifica que corra sin esfuerzo.',
      'Atornilla el FRENTE CAJÓN a la caja desde adentro con tornillos 3.5×20mm.',
      'Ajusta el frente para que los espacios entre cajones sean uniformes (3–4mm).',
    ],
    note: 'Instala los cajones de abajo hacia arriba. Verifica que ambas correderas estén a la misma altura.',
  }
}

function doorStep(doors: number, config: FurnitureConfig): AssemblyStep {
  const hingesPerDoor = config.heightMm > 1200 ? 3 : 2
  return {
    title: `Instalar ${doors} puerta${doors > 1 ? 's' : ''}`,
    diagram: 'door-hinge',
    instructions: [
      `── Preparar bisagras (${hingesPerDoor} por puerta) ──`,
      'Marca las posiciones de bisagras en cada PUERTA: primera a 100mm del borde, última a 100mm del otro borde.',
      config.heightMm > 1200 ? 'La bisagra central va en el punto medio de la puerta.' : '',
      'Haz el rebaje con broca de 35mm para bisagras de cazoleta.',
      '── Instalar en el mueble ──',
      'Atornilla las placas de montaje en los laterales del mueble.',
      'Engáncha las bisagras en las placas y fija con los tornillos.',
      '── Ajustar ──',
      'Ajusta profundidad (±2mm), altura (±2mm) y lateralidad (±2mm) con los tornillos de regulación.',
      'La puerta debe cerrar sin rozar y con espacio uniforme en todos los bordes.',
    ].filter(Boolean),
    note: 'Usa bisagras de cierre suave (soft-close) para mejor acabado.',
  }
}

function finishingStep(): AssemblyStep {
  return {
    title: 'Revisión final y agarraderas',
    diagram: 'handle',
    instructions: [
      'Instala las AGARRADERAS usando los tornillos incluidos (normalmente M4×30mm).',
      'Haz el agujero pasante con broca de 5mm en la posición deseada.',
      'Verifica que el mueble esté nivelado; usa patas regulables si es necesario.',
      'Comprueba que todas las puertas abran y cierren correctamente.',
      'Ajusta los cajones para que corran sin ruido.',
      'Limpia los restos de cola o aserrín con un paño húmedo.',
    ],
    note: '¡Listo! Documenta el proyecto con una foto y guárdala en la app.',
  }
}

// ── Generador principal ─────────────────────────────────────────────────────

export function generateAssemblyPlanPdf(
  config: FurnitureConfig,
  pieces: Piece[],
  materialName: string,
  colorName: string
): void {
  const pdf = new PdfBuilder()
  const info = FURNITURE_DISPLAY_INFO[config.type]
  const accessories = calculateAccessories(config, pieces)
  const steps = getAssemblySteps(config, pieces)
  const date = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })

  // ── PORTADA ──────────────────────────────────────────────────────────────
  pdf.drawHeader('Plano de Armado', date)
  pdf.spaceY(4)
  pdf.drawText(`${info.emoji}  ${info.displayName}`, { size: 18, bold: true })
  pdf.spaceY(4)
  pdf.drawText(`${config.widthMm} × ${config.heightMm} × ${config.depthMm} mm  ·  ${materialName}  ·  ${colorName}`, { size: 11 })
  pdf.spaceY(6)
  pdf.drawLine()
  pdf.spaceY(6)

  // ── LISTA DE PIEZAS ───────────────────────────────────────────────────────
  pdf.drawText('Lista de cortes', { size: 13, bold: true, color: '#E8401C' })
  pdf.spaceY(4)

  const pieceRows = pieces.map((p, i) => [
    String(i + 1),
    p.label,
    `${p.widthMm} mm`,
    `${p.heightMm} mm`,
    String(p.quantity),
    [
      p.edgeTop ? 'sup' : '',
      p.edgeBottom ? 'inf' : '',
      p.edgeLeft ? 'izq' : '',
      p.edgeRight ? 'der' : '',
    ].filter(Boolean).join(', ') || '—',
  ])

  pdf.drawTable(
    ['#', 'Pieza', 'Ancho', 'Alto', 'Cant.', 'Cantos'],
    pieceRows
  )

  const totalPieces = pieces.reduce((acc, p) => acc + p.quantity, 0)
  pdf.spaceY(2)
  pdf.drawText(`Total: ${totalPieces} piezas · Material: ${materialName}`, { size: 9, color: '#666666' })
  pdf.spaceY(8)

  // ── LISTA DE HERRAJES ─────────────────────────────────────────────────────
  pdf.checkPageBreak(60)
  pdf.drawText('Herrajes necesarios', { size: 13, bold: true, color: '#E8401C' })
  pdf.spaceY(4)

  const hardwareRows: string[][] = []
  if (accessories.hinges > 0)    hardwareRows.push(['Bisagras de cazoleta 35mm',     `${accessories.hinges}`, 'unid.', 'Cierre suave recomendado'])
  if (accessories.handles > 0)   hardwareRows.push(['Agarraderas',                    `${accessories.handles}`, 'unid.', 'A elección del cliente'])
  if (accessories.slides > 0)    hardwareRows.push(['Correderas telescópicas',         `${accessories.slides}`, 'pares', 'Largo según profundidad cajón'])
  if (accessories.camLocks > 0)  hardwareRows.push(['Minifix / Cam locks',             `${accessories.camLocks}`, 'unid.', 'Incluye espárragos M6×12'])
  hardwareRows.push(['Tornillos 3.5×16mm (para fondos)', '1 caja', '—', 'Aprox. 25 unid.'])
  hardwareRows.push(['Tornillos 3.5×20mm (para frentes)', '1 caja', '—', 'Aprox. 20 unid.'])
  hardwareRows.push(['Cola de carpintero', '1', 'frasco', 'Para uniones estructurales'])

  pdf.drawTable(['Material / Herraje', 'Cant.', 'Unidad', 'Observaciones'], hardwareRows)
  pdf.spaceY(8)

  // ── PASOS DE ARMADO ────────────────────────────────────────────────────────
  pdf.checkPageBreak(30)
  pdf.drawText('Instrucciones de armado', { size: 13, bold: true, color: '#E8401C' })
  pdf.spaceY(6)

  steps.forEach((step, idx) => {
    pdf.checkPageBreak(step.diagram ? 100 : 40)
    pdf.drawText(`Paso ${idx + 1}: ${step.title}`, { size: 11, bold: true })
    pdf.spaceY(2)

    step.instructions.forEach((line) => {
      if (!line.startsWith('──')) {
        pdf.drawText(`  • ${line}`, { size: 9 })
      } else {
        pdf.spaceY(2)
        pdf.drawText(line, { size: 9, bold: true, color: '#666666' })
      }
    })

    if (step.note) {
      pdf.spaceY(2)
      pdf.drawText(`  ℹ ${step.note}`, { size: 8, color: '#888888' })
    }

    // ── Diagrama visual ───────────────────────────────────────────────────
    if (step.diagram) {
      pdf.spaceY(4)
      try {
        const imgData = renderDiagram(step.diagram, config)
        pdf.drawImage(imgData, { maxW: 160, centered: true, aspectRatio: DIAGRAM_ASPECT })
      } catch {
        // Ignorar si el canvas no está disponible (SSR)
      }
    }

    pdf.spaceY(6)
    pdf.drawLine('#EEEEEE')
    pdf.spaceY(4)
  })

  // ── PIE DE PÁGINA ─────────────────────────────────────────────────────────
  pdf.spaceY(4)
  pdf.drawText('Generado con MaderaApp  ·  maderaapp.vercel.app', {
    align: 'center', size: 8, color: '#AAAAAA',
  })

  pdf.download(`plano-armado-${info.displayName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

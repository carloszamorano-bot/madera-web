'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { FurnitureConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { RotateCcw, Maximize2, Download } from 'lucide-react'

interface Viewer3DProps {
  config: FurnitureConfig
  colorHex: string
  thicknessMm: number
}

export default function Viewer3D({ config, colorHex, thicknessMm }: Viewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<InstanceType<typeof OrbitControls> | null>(null)
  const meshesRef = useRef<THREE.Mesh[]>([])
  const animFrameRef = useRef<number>(0)
  const explodedRef = useRef(false)
  const originalPositionsRef = useRef<THREE.Vector3[]>([])
  const [exploded, setExploded] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const cw = container.clientWidth
    const ch = container.clientHeight || 500

    // Reset refs
    meshesRef.current = []
    originalPositionsRef.current = []
    explodedRef.current = false

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    scene.fog = new THREE.Fog(0xf5f5f5, 8000, 16000)

    // Camera — positioned from front-right-top
    const camera = new THREE.PerspectiveCamera(40, cw / ch, 1, 20000)
    const maxDim = Math.max(config.widthMm, config.heightMm, config.depthMm)
    camera.position.set(maxDim * 1.4, maxDim * 1.0, maxDim * 1.6)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(cw, ch)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
    dirLight.position.set(maxDim * 1.5, maxDim * 2, maxDim * 1.5)
    dirLight.castShadow = true
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-maxDim, maxDim, -maxDim)
    scene.add(fillLight)

    // Floor grid
    const gridSize = Math.max(maxDim * 3, 3000)
    const grid = new THREE.GridHelper(gridSize, 20, 0xcccccc, 0xe0e0e0)
    grid.position.y = -config.heightMm / 2
    scene.add(grid)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 200
    controls.maxDistance = maxDim * 6
    controlsRef.current = controls

    // Build furniture
    buildFurniture(scene, config, colorHex, thicknessMm, meshesRef, originalPositionsRef)

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      if (!container) return
      const nw = container.clientWidth
      const nh = container.clientHeight || 500
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [config, colorHex, thicknessMm])

  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return
    const maxDim = Math.max(config.widthMm, config.heightMm, config.depthMm)
    cameraRef.current.position.set(maxDim * 1.4, maxDim * 1.0, maxDim * 1.6)
    cameraRef.current.lookAt(0, 0, 0)
    controlsRef.current.reset()
    // Restore if exploded
    if (explodedRef.current) {
      meshesRef.current.forEach((mesh, i) => {
        mesh.position.copy(originalPositionsRef.current[i])
      })
      explodedRef.current = false
      setExploded(false)
    }
  }

  const handleExplode = () => {
    const meshes = meshesRef.current
    const originals = originalPositionsRef.current
    if (!meshes.length) return
    if (!explodedRef.current) {
      meshes.forEach((mesh, i) => {
        const dir = originals[i].clone().normalize()
        if (dir.length() < 0.01) {
          dir.set(
            (Math.random() - 0.5),
            (Math.random() * 0.5 + 0.1),
            (Math.random() - 0.5)
          ).normalize()
        }
        mesh.position.copy(originals[i]).addScaledVector(dir, 300)
      })
    } else {
      meshes.forEach((mesh, i) => mesh.position.copy(originals[i]))
    }
    explodedRef.current = !explodedRef.current
    setExploded(explodedRef.current)
  }

  const handleScreenshot = () => {
    if (!rendererRef.current) return
    const url = rendererRef.current.domElement.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'mueble-3d.png'
    a.click()
  }

  return (
    <div className="space-y-3">
      <div
        ref={mountRef}
        className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm"
        style={{ height: 500 }}
      />
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw size={15} className="mr-1.5" /> Centrar
        </Button>
        <Button variant="outline" size="sm" onClick={handleExplode}>
          <Maximize2 size={15} className="mr-1.5" />
          {exploded ? 'Contraer' : 'Explotar piezas'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleScreenshot}>
          <Download size={15} className="mr-1.5" /> Captura
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Furniture geometry — port directo de furniture_renderer.js con mejoras
// Coordenadas centradas en (0,0,0): X=ancho, Y=alto, Z=profundidad
// Cara frontal en Z = +D/2
// ═══════════════════════════════════════════════════════════════════════════════

interface BuildCtx {
  scene: THREE.Scene
  meshes: THREE.Mesh[]
  originals: THREE.Vector3[]
  panelMat: THREE.Material
  doorMat: THREE.Material
  handleMat: THREE.Material
  hingeMat: THREE.Material
}

function addMesh(
  ctx: BuildCtx,
  w: number, h: number, d: number,
  mat: THREE.Material,
  x: number, y: number, z: number
) {
  const geo = new THREE.BoxGeometry(w, h, d)
  const mesh = new THREE.Mesh(geo, mat)
  // Edge lines for wood panel look
  const edges = new THREE.EdgesGeometry(geo)
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.12,
  })
  mesh.add(new THREE.LineSegments(edges, lineMat))
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  ctx.scene.add(mesh)
  ctx.meshes.push(mesh)
  ctx.originals.push(mesh.position.clone())
}

// Agarradera: barra horizontal centrada en (x,y,z)
function addHandle(ctx: BuildCtx, x: number, y: number, z: number) {
  // Base de montaje
  addMesh(ctx, 20, 12, 8, ctx.handleMat, x - 55, y, z)
  addMesh(ctx, 20, 12, 8, ctx.handleMat, x + 55, y, z)
  // Barra central
  addMesh(ctx, 130, 10, 10, ctx.handleMat, x, y, z + 2)
}

// Bisagra: dos placas (una en la puerta, otra en el lateral)
function addHinge(ctx: BuildCtx, x: number, y: number, z: number) {
  addMesh(ctx, 12, 28, 8, ctx.hingeMat, x, y, z)
  addMesh(ctx, 20, 8, 20, ctx.hingeMat, x - 8, y, z - 10)
}

// ── Estructura base de caja (lateral × 2 + techo + piso + fondo) ──────────────
function addCabinetBox(ctx: BuildCtx, W: number, H: number, D: number, T: number) {
  const iw = W - 2 * T
  const ih = H - 2 * T
  // Laterales
  addMesh(ctx, T, H, D, ctx.panelMat, -(W / 2 - T / 2), 0, 0)
  addMesh(ctx, T, H, D, ctx.panelMat, W / 2 - T / 2, 0, 0)
  // Techo
  addMesh(ctx, iw, T, D, ctx.panelMat, 0, H / 2 - T / 2, 0)
  // Piso
  addMesh(ctx, iw, T, D, ctx.panelMat, 0, -(H / 2 - T / 2), 0)
  // Fondo
  addMesh(ctx, iw, ih, T, ctx.panelMat, 0, 0, -(D / 2 - T / 2))
}

// ── Repisas distribuidas uniformemente ────────────────────────────────────────
function addShelves(ctx: BuildCtx, W: number, H: number, D: number, T: number, count: number) {
  if (count <= 0) return
  const iw = W - 2 * T
  const ih = H - 2 * T
  const step = ih / (count + 1)
  for (let i = 1; i <= count; i++) {
    const y = -(H / 2) + T + step * i
    addMesh(ctx, iw, T, D - T, ctx.panelMat, 0, y, T / 2)
  }
}

// ── Cajones con frentes + agarraderas ─────────────────────────────────────────
function addDrawers(
  ctx: BuildCtx,
  W: number, H: number, D: number, T: number,
  count: number,
  yBottom: number,   // Y base (desde -H/2+T)
  areaH: number      // altura total de la zona de cajones
) {
  if (count <= 0) return
  const iw = W - 2 * T
  const dh = (areaH - count * 4) / count

  for (let i = 0; i < count; i++) {
    const frontY = yBottom + i * (dh + 4) + dh / 2

    // Divisor horizontal (salvo el último)
    if (i < count - 1) {
      addMesh(ctx, iw, T, D * 0.85, ctx.panelMat, 0, yBottom + (i + 1) * (dh + 4) - 4, 0)
    }

    // Frente del cajón (ligeramente saliente)
    addMesh(ctx, iw - 4, dh - 2, T + 4, ctx.doorMat, 0, frontY, D / 2 - T / 2 + T + 2)

    // Agarradera centrada en el frente
    addHandle(ctx, 0, frontY, D / 2 + T + 8)

    // Caja interna del cajón (visible parcialmente)
    addMesh(ctx, iw - 2 * T - 4, T, D - T - 4, ctx.panelMat, 0, frontY - dh / 2 + T / 2, 0) // base cajón
  }
}

// ── Puertas con agarraderas y bisagras ────────────────────────────────────────
function addDoors(
  ctx: BuildCtx,
  W: number, H: number, D: number, T: number,
  count: number,
  yCenter: number,  // centro vertical de la zona de puertas
  doorH: number     // altura de las puertas
) {
  if (count <= 0) return
  const iw = W - 2 * T
  const dw = iw / count
  const doorZ = D / 2 + T / 2 + 2 // overlay: ligeramente por delante

  for (let i = 0; i < count; i++) {
    const doorX = -(iw / 2) + dw * i + dw / 2

    // Panel de puerta
    addMesh(ctx, dw - 4, doorH - 4, T, ctx.doorMat, doorX, yCenter, doorZ)

    // Agarradera: en el lado del centro (puertas que abren hacia afuera)
    const handleSide = i < count / 2 ? dw / 2 - 20 : -(dw / 2 - 20)
    addHandle(ctx, doorX + handleSide, yCenter, doorZ + T / 2 + 6)

    // Bisagras: lado opuesto a la agarradera
    const hingeX = doorX - handleSide + (handleSide > 0 ? -(dw / 2 - 4) : dw / 2 - 4)
    addHinge(ctx, hingeX, yCenter + doorH * 0.3, doorZ - 4)
    addHinge(ctx, hingeX, yCenter - doorH * 0.3, doorZ - 4)
    if (doorH > 1200) {
      addHinge(ctx, hingeX, yCenter, doorZ - 4)
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Renderers por tipo — lógica idéntica a furniture_renderer.js + mejoras
// ══════════════════════════════════════════════════════════════════════════════

function renderCloset(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number, drawers: number, doors: number) {
  addCabinetBox(ctx, W, H, D, T)
  const ih = H - 2 * T
  const yBottom = -(H / 2) + T

  // Si hay cajones, ocupan el 35% inferior
  const drawerAreaH = drawers > 0 ? ih * 0.35 : 0
  const drawerYBottom = yBottom

  addDrawers(ctx, W, H, D, T, drawers, drawerYBottom, drawerAreaH)

  // Repisas en la zona superior (arriba de los cajones)
  if (shelves > 0) {
    const shelfAreaTop = H / 2 - T
    const shelfAreaBottom = yBottom + drawerAreaH
    const shelfAreaH = shelfAreaTop - shelfAreaBottom
    const step = shelfAreaH / (shelves + 1)
    const iw = W - 2 * T
    for (let i = 1; i <= shelves; i++) {
      const y = shelfAreaBottom + step * i
      addMesh(ctx, iw, T, D - T, ctx.panelMat, 0, y, T / 2)
    }
  }

  // Puertas en la zona superior (sobre cajones)
  const doorAreaBottom = yBottom + drawerAreaH
  const doorH = ih - drawerAreaH
  const doorCenterY = doorAreaBottom + doorH / 2
  addDoors(ctx, W, H, D, T, doors, doorCenterY, doorH)
}

function renderDespensero(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number, doors: number) {
  addCabinetBox(ctx, W, H, D, T)
  addShelves(ctx, W, H, D, T, shelves)
  addDoors(ctx, W, H, D, T, doors, 0, H - 2 * T)
}

function renderRackTV(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number) {
  addCabinetBox(ctx, W, H, D, T)
  addShelves(ctx, W, H, D, T, shelves)
}

function renderEstanteria(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number) {
  // Estantería abierta (sin fondo ni puertas)
  const iw = W - 2 * T
  const ih = H - 2 * T
  addMesh(ctx, T, H, D, ctx.panelMat, -(W / 2 - T / 2), 0, 0)  // lateral izq
  addMesh(ctx, T, H, D, ctx.panelMat, W / 2 - T / 2, 0, 0)    // lateral der
  addMesh(ctx, iw, T, D, ctx.panelMat, 0, H / 2 - T / 2, 0)   // techo
  addMesh(ctx, iw, T, D, ctx.panelMat, 0, -(H / 2 - T / 2), 0) // piso
  addShelves(ctx, W, H, D, T, shelves)
}

function renderEscritorio(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number, drawers: number) {
  // Tablero horizontal en la cima
  addMesh(ctx, W, T, D, ctx.panelMat, 0, H / 2 - T / 2, 0)
  // Laterales (patas de tipo panel) — altura = H - T
  addMesh(ctx, T, H - T, D, ctx.panelMat, -(W / 2 - T / 2), -(T / 2), 0)
  addMesh(ctx, T, H - T, D, ctx.panelMat, W / 2 - T / 2, -(T / 2), 0)
  // Travesaño trasero bajo
  const iw = W - 2 * T
  addMesh(ctx, iw, T * 4, T, ctx.panelMat, 0, -(H / 2 - T * 2), -(D / 2 - T))

  // Cajones debajo del tablero (lado derecho, si hay)
  if (drawers > 0) {
    const drawerAreaH = (H - T) * 0.55
    const drawerAreaBottom = -(H / 2 - T)
    addDrawers(ctx, W * 0.4, H, D * 0.9, T, drawers, drawerAreaBottom, drawerAreaH)
  }
}

function renderMesaComedor(ctx: BuildCtx, W: number, H: number, D: number) {
  // Tablero
  addMesh(ctx, W, 18, D, ctx.panelMat, 0, H / 2 - 9, 0)
  // Largueros (front & back)
  addMesh(ctx, W - 200, 80, 18, ctx.panelMat, 0, H / 2 - 58, -(D / 2 - 30))
  addMesh(ctx, W - 200, 80, 18, ctx.panelMat, 0, H / 2 - 58, D / 2 - 30)
  // Travesaños (left & right)
  addMesh(ctx, 18, 80, D - 200, ctx.panelMat, -(W / 2 - 30), H / 2 - 58, 0)
  addMesh(ctx, 18, 80, D - 200, ctx.panelMat, W / 2 - 30, H / 2 - 58, 0)
  // 4 patas
  const legH = H - 18 - 80
  if (legH > 0) {
    const lx = W / 2 - 30, lz = D / 2 - 30
    const ly = H / 2 - 18 - 80 - legH / 2
    addMesh(ctx, 40, legH, 40, ctx.panelMat, -lx, ly, -lz)
    addMesh(ctx, 40, legH, 40, ctx.panelMat, lx, ly, -lz)
    addMesh(ctx, 40, legH, 40, ctx.panelMat, -lx, ly, lz)
    addMesh(ctx, 40, legH, 40, ctx.panelMat, lx, ly, lz)
  }
}

function renderCocinaModular(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number, drawers: number, doors: number) {
  addCabinetBox(ctx, W, H, D, T)
  const ih = H - 2 * T
  const iw = W - 2 * T
  const yBottom = -(H / 2) + T

  // Cajones en la parte superior (40%)
  const drawerAreaH = drawers > 0 ? ih * 0.4 : 0
  const drawerYTop = H / 2 - T
  const drawerYBottom = drawerYTop - drawerAreaH
  if (drawers > 0) {
    const dh = (drawerAreaH - drawers * 4) / drawers
    for (let j = 0; j < drawers; j++) {
      const frontY = drawerYTop - dh * (j + 0.5) - j * 4
      addMesh(ctx, iw - 4, dh - 2, T + 4, ctx.doorMat, 0, frontY, D / 2 - T / 2 + T + 2)
      addHandle(ctx, 0, frontY, D / 2 + T + 8)
    }
  }

  // Repisas
  if (shelves > 0) {
    const step = ih / (shelves + 1)
    for (let i = 1; i <= shelves; i++) {
      addMesh(ctx, iw, T, D - T, ctx.panelMat, 0, yBottom + step * i, T / 2)
    }
  }

  // Puertas en la parte inferior (55%)
  const doorAreaH = ih * 0.55
  const doorCenterY = yBottom + doorAreaH / 2
  addDoors(ctx, W, H, D, T, doors, doorCenterY, doorAreaH)
}

function renderCajonera(ctx: BuildCtx, W: number, H: number, D: number, T: number, drawers: number) {
  addCabinetBox(ctx, W, H, D, T)
  const ih = H - 2 * T
  const yBottom = -(H / 2) + T
  addDrawers(ctx, W, H, D, T, Math.max(1, drawers), yBottom, ih)
}

function renderVelador(ctx: BuildCtx, W: number, H: number, D: number, T: number, shelves: number, drawers: number, doors: number) {
  addCabinetBox(ctx, W, H, D, T)
  const ih = H - 2 * T
  const yBottom = -(H / 2) + T

  const drawerAreaH = drawers > 0 ? ih * 0.35 : 0
  addDrawers(ctx, W, H, D, T, drawers, yBottom, drawerAreaH)

  const doorAreaBottom = yBottom + drawerAreaH
  const doorH = ih - drawerAreaH
  if (shelves > 0 && doors === 0) {
    addShelves(ctx, W, H, D, T, shelves)
  } else if (doors > 0) {
    addDoors(ctx, W, H, D, T, doors, doorAreaBottom + doorH / 2, doorH)
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

function buildFurniture(
  scene: THREE.Scene,
  config: FurnitureConfig,
  colorHex: string,
  T: number,
  meshesRef: React.MutableRefObject<THREE.Mesh[]>,
  originalsRef: React.MutableRefObject<THREE.Vector3[]>
) {
  const { type, widthMm: W, heightMm: H, depthMm: D, shelves, drawers, doors } = config

  // Adjust color: doors slightly darker for contrast
  const panelColor = new THREE.Color(colorHex)
  const doorColor = panelColor.clone().multiplyScalar(0.88)

  const ctx: BuildCtx = {
    scene,
    meshes: meshesRef.current,
    originals: originalsRef.current,
    panelMat: new THREE.MeshLambertMaterial({ color: panelColor }),
    doorMat: new THREE.MeshLambertMaterial({ color: doorColor }),
    handleMat: new THREE.MeshLambertMaterial({ color: 0x888888 }),
    hingeMat: new THREE.MeshLambertMaterial({ color: 0xaaaaaa }),
  }

  switch (type) {
    case 'CLOSET_CORRIDO':
    case 'CLOSET_ESQUINERO':
      renderCloset(ctx, W, H, D, T, shelves, drawers, doors)
      break
    case 'DESPENSERO':
      renderDespensero(ctx, W, H, D, T, shelves, doors)
      break
    case 'RACK_TV':
      renderRackTV(ctx, W, H, D, T, shelves)
      break
    case 'ESTANTERIA':
      renderEstanteria(ctx, W, H, D, T, shelves)
      break
    case 'ESCRITORIO':
      renderEscritorio(ctx, W, H, D, T, shelves, drawers)
      break
    case 'MESA_COMEDOR':
      renderMesaComedor(ctx, W, H, D)
      break
    case 'COCINA_MODULAR':
      renderCocinaModular(ctx, W, H, D, T, shelves, drawers, doors)
      break
    case 'CAJONERA':
      renderCajonera(ctx, W, H, D, T, drawers)
      break
    case 'VELADOR':
      renderVelador(ctx, W, H, D, T, shelves, drawers, doors)
      break
    default:
      renderCloset(ctx, W, H, D, T, shelves, drawers, doors)
  }
}

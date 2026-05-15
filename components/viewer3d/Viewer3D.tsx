'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
// @ts-ignore - OrbitControls not typed as ESM module in some versions
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { FurnitureConfig } from '@/types'
import { FURNITURE_DISPLAY_INFO } from '@/lib/algorithms/furniture-pieces'
import { Button } from '@/components/ui/button'
import { RotateCcw, Maximize2, Download } from 'lucide-react'

interface Viewer3DProps {
  config: FurnitureConfig
  colorHex: string
  thicknessMm: number
}

export default function Viewer3D({ config, colorHex, thicknessMm }: Viewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
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
    const w = container.clientWidth
    const h = container.clientHeight || 400

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f8f8)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
    const maxDim = Math.max(config.widthMm, config.heightMm, config.depthMm)
    camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8)
    dir1.position.set(1, 2, 3)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3)
    dir2.position.set(-2, -1, -1)
    scene.add(dir2)

    // Grid
    const grid = new THREE.GridHelper(3000, 20, 0xcccccc, 0xe8e8e8)
    grid.position.y = -config.heightMm / 2
    scene.add(grid)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controlsRef.current = controls

    // Build furniture geometry
    buildFurniture(scene, config, colorHex, thicknessMm, meshesRef, originalPositionsRef)

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      if (!container) return
      const nw = container.clientWidth
      const nh = container.clientHeight || 400
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [config, colorHex, thicknessMm])

  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return
    const maxDim = Math.max(config.widthMm, config.heightMm, config.depthMm)
    cameraRef.current.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
    cameraRef.current.lookAt(0, 0, 0)
    controlsRef.current.reset()
  }

  const handleExplode = () => {
    const meshes = meshesRef.current
    const originals = originalPositionsRef.current
    if (!meshes.length) return

    if (!explodedRef.current) {
      // Explode: move each piece away from center
      meshes.forEach((mesh, i) => {
        const dir = originals[i].clone().normalize()
        if (dir.length() < 0.01) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
        mesh.position.copy(originals[i]).addScaledVector(dir, 200)
      })
    } else {
      // Restore
      meshes.forEach((mesh, i) => {
        mesh.position.copy(originals[i])
      })
    }
    explodedRef.current = !explodedRef.current
    setExploded(explodedRef.current)
  }

  const handleScreenshot = () => {
    if (!rendererRef.current) return
    const canvas = rendererRef.current.domElement
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'mueble-3d.png'
    a.click()
  }

  return (
    <div className="space-y-3">
      <div ref={mountRef} className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm" />
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw size={15} className="mr-1.5" /> Centrar
        </Button>
        <Button variant="outline" size="sm" onClick={handleExplode}>
          <Maximize2 size={15} className="mr-1.5" />
          {exploded ? 'Contraer' : 'Explotar'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleScreenshot}>
          <Download size={15} className="mr-1.5" /> Captura
        </Button>
      </div>
    </div>
  )
}

// ── Furniture geometry builder ────────────────────────────────────────────────

function buildFurniture(
  scene: THREE.Scene,
  config: FurnitureConfig,
  colorHex: string,
  t: number,
  meshesRef: React.MutableRefObject<THREE.Mesh[]>,
  originalsRef: React.MutableRefObject<THREE.Vector3[]>
) {
  const { widthMm: w, heightMm: h, depthMm: d } = config
  const color = new THREE.Color(colorHex)
  const mat = new THREE.MeshLambertMaterial({ color })
  const edgeMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(colorHex).multiplyScalar(0.7) })

  const addBox = (bw: number, bh: number, bd: number, x: number, y: number, z: number) => {
    const geo = new THREE.BoxGeometry(bw, bh, bd)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    meshesRef.current.push(mesh)
    originalsRef.current.push(mesh.position.clone())
  }

  // Shared closet/shelf base: 2 laterals + top + bottom + back + shelves
  const iw = w - 2 * t

  // Laterals
  addBox(t, h, d, -iw / 2 - t / 2, 0, 0)
  addBox(t, h, d, iw / 2 + t / 2, 0, 0)
  // Top
  addBox(iw, t, d, 0, h / 2 - t / 2, 0)
  // Bottom
  addBox(iw, t, d, 0, -h / 2 + t / 2, 0)
  // Back
  addBox(iw, h - 2 * t, t, 0, 0, -d / 2 + t / 2)

  // Shelves
  const s = config.shelves
  if (s > 0) {
    const ih = h - 2 * t
    const step = ih / (s + 1)
    for (let i = 1; i <= s; i++) {
      const y = -h / 2 + t + step * i
      addBox(iw, t, d - t, 0, y, t / 2)
    }
  }
}

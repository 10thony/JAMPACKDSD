import { Suspense, useMemo, useRef, type MutableRefObject, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, Stars, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

const SUN_R = 9
const ECLIPTIC_TILT: [number, number, number] = [0.03, 0, -0.08]
const HUMANOID_MODEL_URL = new URL("../../humanoid_from_blend.glb", import.meta.url).href
const HUMANOID_SILHOUETTE = "#f4f5f7"
const HUMANOID_BASE_Y_ROT = 0

type TextureKind = "rocky" | "cloud" | "jovian" | "ice" | "sun" | "ring"

function makeCanvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (ctx) draw(ctx, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function drawNoise(ctx: CanvasRenderingContext2D, size: number, opacity = 0.18, step = 2) {
  const image = ctx.getImageData(0, 0, size, size)
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const i = (y * size + x) * 4
      const v = 120 + Math.random() * 135
      image.data[i] = v
      image.data[i + 1] = v
      image.data[i + 2] = v
      image.data[i + 3] = 255 * opacity
    }
  }
  ctx.putImageData(image, 0, 0)
}

function makePlanetTexture(kind: TextureKind, color: THREE.ColorRepresentation, orbitIndex: number) {
  return makeCanvasTexture(512, (ctx, size) => {
    const base = new THREE.Color(color)
    const dark = base.clone().offsetHSL(0, -0.08, -0.18).getStyle()
    const light = base.clone().offsetHSL(0.02, 0.08, 0.16).getStyle()
    const mid = base.getStyle()

    const bg = ctx.createLinearGradient(0, 0, size, size)
    bg.addColorStop(0, light)
    bg.addColorStop(0.46, mid)
    bg.addColorStop(1, dark)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, size, size)

    ctx.globalCompositeOperation = "multiply"
    drawNoise(ctx, size, kind === "ice" ? 0.07 : 0.14, kind === "jovian" ? 3 : 2)
    ctx.globalCompositeOperation = "source-over"

    if (kind === "jovian" || kind === "cloud" || orbitIndex >= 4) {
      for (let band = 0; band < 16; band++) {
        const y = (band / 16) * size + Math.sin(band * 1.6 + orbitIndex) * 14
        const h = 10 + ((band + orbitIndex) % 5) * 5
        ctx.fillStyle = band % 2 === 0 ? `${light}66` : `${dark}55`
        ctx.beginPath()
        ctx.ellipse(size * 0.5, y, size * 0.62, h, Math.sin(band) * 0.05, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (kind === "rocky") {
      for (let i = 0; i < 44; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const r = 5 + Math.random() * 23
        const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r)
        g.addColorStop(0, "rgba(255,255,255,0.12)")
        g.addColorStop(0.55, "rgba(0,0,0,0.08)")
        g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (orbitIndex === 2) {
      ctx.globalCompositeOperation = "screen"
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = "rgba(230,248,255,0.2)"
        ctx.beginPath()
        ctx.ellipse(Math.random() * size, Math.random() * size, 26 + Math.random() * 42, 5 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = "source-over"
    }
  })
}

function makeBumpTexture(orbitIndex: number) {
  return makeCanvasTexture(256, (ctx, size) => {
    ctx.fillStyle = orbitIndex >= 4 ? "#8f8f8f" : "#777777"
    ctx.fillRect(0, 0, size, size)
    drawNoise(ctx, size, orbitIndex >= 4 ? 0.08 : 0.22, 1)
  })
}

function makeRingTexture(ringColor: string) {
  return makeCanvasTexture(512, (ctx, size) => {
    const color = new THREE.Color(ringColor)
    const center = size / 2
    const max = size * 0.48
    for (let r = 0; r < max; r++) {
      const t = r / max
      const a = t < 0.42 || t > 0.95 ? 0 : 0.06 + Math.sin(t * 58) * 0.035 + Math.random() * 0.05
      ctx.strokeStyle = `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},${Math.max(0, a)})`
      ctx.beginPath()
      ctx.arc(center, center, r, 0, Math.PI * 2)
      ctx.stroke()
    }
  })
}

function disableMeshRaycast(mesh: THREE.Object3D) {
  // Disable picking on decorative / duplicate shells so the invisible hit target wins consistently.
  ;(mesh as THREE.Mesh).raycast = () => {}
}

function spinRateFromId(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return 0.18 + (Math.abs(h) % 180) / 500
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function planetVisualProfile(orbitRadius: number, baseColor: string) {
  // Near-sun planets are dense, rocky, and darker; farther planets get smoother and glowier.
  const t = clamp01((orbitRadius - 64) / 190)
  const rocky = 1 - t
  const cold = t
  const color = new THREE.Color(baseColor)
  const litColor = color.clone().lerp(new THREE.Color("#d6c7aa"), rocky * 0.35)
  const coolGlow = color.clone().lerp(new THREE.Color("#9ec8ff"), cold * 0.22)

  return {
    color: litColor,
    emissive: coolGlow,
    metalness: THREE.MathUtils.lerp(0.16, 0.38, t),
    roughness: THREE.MathUtils.lerp(0.86, 0.38, t),
    envMapIntensity: THREE.MathUtils.lerp(0.06, 0.42, t),
    atmosphereOpacity: THREE.MathUtils.lerp(0.08, 0.35, t),
    atmosphereScale: THREE.MathUtils.lerp(1.015, 1.075, t),
    bumpScale: THREE.MathUtils.lerp(0.22, 0.05, t),
    emissiveBoost: THREE.MathUtils.lerp(0.22, 0.42, t),
  }
}

function orbitIndexFromRadius(orbitRadius: number) {
  return Math.max(0, Math.round((orbitRadius - 64) / 26))
}

function realisticBaseColor(orbitIndex: number) {
  // Approximate visible-light palette inspired by NASA planet color references.
  const palette = ["#9a8f84", "#d7b38c", "#4f78b8", "#b35d45", "#cda47b", "#dbcaa7", "#9fd5de", "#4f73bb"]
  return palette[Math.min(orbitIndex, palette.length - 1)]
}

function realisticRingColor(orbitIndex: number) {
  if (orbitIndex === 5) return "#d9c7a8" // saturn-like broad pale rings
  if (orbitIndex === 6) return "#9ed7dd" // uranus-like subtle cyan rings
  return null
}

function planetTextureKind(orbitIndex: number): TextureKind {
  if (orbitIndex <= 3) return "rocky"
  if (orbitIndex <= 5) return "jovian"
  return "ice"
}

function OrbitGuide({ radius, selected }: { radius: number; selected: boolean }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={-2} onUpdate={disableMeshRaycast}>
      <ringGeometry args={[radius - 0.035, radius + 0.035, 192]} />
      <meshBasicMaterial
        color={selected ? "#f5d49a" : "#6f88b7"}
        transparent
        opacity={selected ? 0.34 : 0.11}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function AsteroidBelt({ pausedRef }: { pausedRef: RefObject<boolean> }) {
  const belt = useRef<THREE.InstancedMesh>(null)
  const dust = useRef<THREE.Group>(null)
  const count = 180
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D()
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.sin(i * 9.7) * 0.04
      const radius = 35 + Math.sin(i * 4.91) * 1.8 + (i % 7) * 0.26
      dummy.position.set(Math.cos(angle) * radius, Math.sin(i * 2.1) * 0.34, Math.sin(angle) * radius)
      const scale = 0.05 + ((i * 17) % 13) / 130
      dummy.scale.setScalar(scale)
      dummy.rotation.set(i * 0.31, i * 1.11, i * 0.73)
      dummy.updateMatrix()
      return dummy.matrix.clone()
    })
  }, [])

  useFrame((_, delta) => {
    if (pausedRef.current) return
    if (belt.current) belt.current.rotation.y += delta * 0.018
    if (dust.current) dust.current.rotation.y -= delta * 0.01
  })

  return (
    <group rotation={ECLIPTIC_TILT}>
      <group ref={dust}>
        <mesh rotation={[Math.PI / 2, 0, 0]} onUpdate={disableMeshRaycast}>
          <ringGeometry args={[32, 39, 220]} />
          <meshBasicMaterial
            color="#d8b98a"
            transparent
            opacity={0.055}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      <instancedMesh
        ref={belt}
        args={[undefined, undefined, count]}
        onUpdate={(mesh) => {
          matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
          mesh.instanceMatrix.needsUpdate = true
        }}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#b99b72" roughness={0.95} metalness={0.08} />
      </instancedMesh>
    </group>
  )
}

function NebulaVeil() {
  return (
    <group>
      <mesh position={[-90, -34, -190]} scale={[78, 24, 1]} onUpdate={disableMeshRaycast}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial color="#6140b5" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[120, 46, -230]} scale={[86, 32, 1]} rotation={[0, 0, -0.18]} onUpdate={disableMeshRaycast}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial color="#1d7fb8" transparent opacity={0.055} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[20, -76, -180]} scale={[120, 38, 1]} rotation={[0, 0, 0.22]} onUpdate={disableMeshRaycast}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial color="#b16028" transparent opacity={0.045} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function GradientStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 320 }, (_, i) => {
        // Fill a large scene volume so stars read across the entire canvas, not only near the center.
        const x = THREE.MathUtils.randFloatSpread(1200)
        const y = THREE.MathUtils.randFloatSpread(760)
        const z = THREE.MathUtils.randFloatSpread(1100)
        const hue = 26 + Math.random() * 210
        const color = new THREE.Color().setHSL(hue / 360, 0.75, 0.66)
        return {
          key: `star-${i}`,
          position: [x, y, z] as [number, number, number],
          scale: 0.26 + Math.random() * 0.9,
          opacity: 0.35 + Math.random() * 0.55,
          color,
        }
      }),
    [],
  )

  return (
    <group>
      {stars.map((star) => (
        <mesh key={star.key} position={star.position} scale={star.scale} onUpdate={disableMeshRaycast}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color={star.color} transparent opacity={star.opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function PlanetSurfaceDetail({
  pr,
  orbitIndex,
  baseColor,
}: {
  pr: number
  orbitIndex: number
  baseColor: THREE.ColorRepresentation
}) {
  const tint = useMemo(() => new THREE.Color(baseColor), [baseColor])
  const bright = useMemo(() => tint.clone().offsetHSL(0, 0.06, 0.1), [tint])
  const dark = useMemo(() => tint.clone().offsetHSL(0, -0.03, -0.16), [tint])

  // Distinct planet signatures by orbit index (Mercury -> Neptune).
  switch (orbitIndex) {
    case 0: // Mercury: dark rocky mottling / cratered feel
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} rotation={[0.8, 0.22, 0.1]}>
            <torusGeometry args={[pr * 0.62, pr * 0.05, 6, 46]} />
            <meshBasicMaterial color={dark} transparent opacity={0.24} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} position={[pr * 0.22, -pr * 0.08, pr * 0.42]}>
            <sphereGeometry args={[pr * 0.18, 16, 16]} />
            <meshBasicMaterial color="#b8afa6" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        </>
      )
    case 1: // Venus: thick pale haze
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} scale={1.018}>
            <sphereGeometry args={[pr, 22, 22]} />
            <meshBasicMaterial color="#f1d5a8" transparent opacity={0.17} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.12, 0.03]}>
            <torusGeometry args={[pr * 0.56, pr * 0.034, 8, 52]} />
            <meshBasicMaterial color="#cfa781" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        </>
      )
    case 2: // Earth: cloud belt + ocean highlight
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.08, 0]}>
            <torusGeometry args={[pr * 0.6, pr * 0.028, 8, 56]} />
            <meshBasicMaterial color="#cfe7ff" transparent opacity={0.21} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} position={[pr * 0.28, pr * 0.14, pr * 0.44]} scale={[1, 0.8, 1]}>
            <sphereGeometry args={[pr * 0.2, 16, 16]} />
            <meshBasicMaterial color="#9fd6ff" transparent opacity={0.16} depthWrite={false} />
          </mesh>
        </>
      )
    case 3: // Mars: rusty dust bands + darker basin
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.25, 0.04]}>
            <torusGeometry args={[pr * 0.66, pr * 0.04, 8, 50]} />
            <meshBasicMaterial color="#8f4634" transparent opacity={0.26} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} position={[-pr * 0.2, -pr * 0.16, pr * 0.3]}>
            <sphereGeometry args={[pr * 0.15, 14, 14]} />
            <meshBasicMaterial color="#d57d58" transparent opacity={0.17} depthWrite={false} />
          </mesh>
        </>
      )
    case 4: // Jupiter: strong alternating cloud bands + red storm hint
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[pr * 0.72, pr * 0.046, 8, 64]} />
            <meshBasicMaterial color={bright} transparent opacity={0.22} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.22, 0]}>
            <torusGeometry args={[pr * 0.47, pr * 0.036, 8, 56]} />
            <meshBasicMaterial color={dark} transparent opacity={0.2} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} position={[pr * 0.32, -pr * 0.1, pr * 0.48]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[pr * 0.16, 14, 14]} />
            <meshBasicMaterial color="#c07a5a" transparent opacity={0.26} depthWrite={false} />
          </mesh>
        </>
      )
    case 5: // Saturn: subdued creamy bands
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.04, 0]}>
            <torusGeometry args={[pr * 0.68, pr * 0.034, 8, 58]} />
            <meshBasicMaterial color="#f0dfc0" transparent opacity={0.2} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.26, 0]}>
            <torusGeometry args={[pr * 0.43, pr * 0.026, 8, 48]} />
            <meshBasicMaterial color="#b89a74" transparent opacity={0.17} depthWrite={false} />
          </mesh>
        </>
      )
    case 6: // Uranus: smoother cyan atmosphere
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} scale={1.026}>
            <sphereGeometry args={[pr, 20, 20]} />
            <meshBasicMaterial color="#c4f1f6" transparent opacity={0.12} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.2, 0]}>
            <torusGeometry args={[pr * 0.55, pr * 0.024, 8, 52]} />
            <meshBasicMaterial color="#7dbec6" transparent opacity={0.14} depthWrite={false} />
          </mesh>
        </>
      )
    default: // Neptune: deeper blue with storm accent
      return (
        <>
          <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0.2, 0]}>
            <torusGeometry args={[pr * 0.64, pr * 0.03, 8, 58]} />
            <meshBasicMaterial color="#7ea5e8" transparent opacity={0.2} depthWrite={false} />
          </mesh>
          <mesh onUpdate={disableMeshRaycast} position={[-pr * 0.25, -pr * 0.02, pr * 0.45]} scale={[1, 0.78, 1]}>
            <sphereGeometry args={[pr * 0.17, 16, 16]} />
            <meshBasicMaterial color="#2f4f9f" transparent opacity={0.26} depthWrite={false} />
          </mesh>
        </>
      )
  }
}


export const SUN_FOCUS_ID = "__solar_sun__"

const FOCUS_ZOOM_SEC = 0.55
const FOCUS_ZOOM_OUT_DIST = 50
/** Orbit target at origin; matches default camera distance (~sqrt(y²+z²) from position below) */
const SUN_FOCUS_OUT_DIST = 108
const TARGET_SMOOTH = 9

/** Subset of portfolio planet data used by the WebGL scene */
export type SolarSystemPlanet = {
  id: string
  name: string
  color: string
  ring?: string
  radius: number
  speed: number
  offset: number
  size: number
}

type SceneContentProps = {
  planets: SolarSystemPlanet[]
  paused: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

const SUN_TARGET = new THREE.Vector3(0, 0, 0)

function worldOrbitRadius(screenRadius: number) {
  return screenRadius / 4
}

function worldPlanetRadius(size: number) {
  return Math.max(0.75, size / 9)
}

const HIT_PAD = 3.2

function PlanetRings({
  pr,
  ringColor,
  pausedRef,
}: {
  pr: number
  ringColor: string
  pausedRef: RefObject<boolean>
}) {
  const ringBelt = useRef<THREE.Group>(null)
  const ringFine = useRef<THREE.Group>(null)
  const ringDust = useRef<THREE.Group>(null)
  const ringShadow = useRef<THREE.Group>(null)

  const ringTexture = useMemo(() => makeRingTexture(ringColor), [ringColor])
  const rot = useMemo(() => [Math.PI / 2.35, 0.35, 0.2] as [number, number, number], [])

  useFrame((_, d) => {
    if (pausedRef.current) return
    if (ringBelt.current) ringBelt.current.rotation.z += d * 0.55
    if (ringFine.current) ringFine.current.rotation.z -= d * 0.42
    if (ringDust.current) ringDust.current.rotation.z += d * 0.2
    if (ringShadow.current) ringShadow.current.rotation.z -= d * 0.18
  })

  return (
    <group rotation={rot}>
      <group ref={ringBelt}>
        <mesh onUpdate={disableMeshRaycast}>
          <ringGeometry args={[pr * 1.42, pr * 2.28, 160]} />
          <meshBasicMaterial
            map={ringTexture}
            color={ringColor}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      <group ref={ringShadow}>
        <mesh onUpdate={disableMeshRaycast}>
          <ringGeometry args={[pr * 1.16, pr * 1.48, 128]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={ringFine}>
        <mesh onUpdate={disableMeshRaycast}>
          <ringGeometry args={[pr * 2.36, pr * 2.42, 160]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={ringDust}>
        <mesh onUpdate={disableMeshRaycast}>
          <ringGeometry args={[pr * 1.18, pr * 2.62, 160]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}

function SunNode({
  pausedRef,
  onSelect,
}: {
  pausedRef: RefObject<boolean>
  onSelect: () => void
}) {
  const vis = useRef<THREE.Group>(null)
  const particleHalo = useRef<THREE.Group>(null)
  const glowPulse = useRef(0)
  const gltf = useGLTF(HUMANOID_MODEL_URL)
  const humanoid = useMemo(() => {
    const root = gltf.scene.clone(true)
    const silhouetteMaterial = new THREE.MeshStandardMaterial({
      color: HUMANOID_SILHOUETTE,
      roughness: 0.94,
      metalness: 0,
      emissive: "#101015",
      emissiveIntensity: 0.04,
    })
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const fitHeight = SUN_R * 1.48
    const scale = fitHeight / Math.max(size.y, 0.001)

    root.position.sub(center)
    root.position.y += size.y * 0.5
    root.scale.setScalar(scale)
    root.rotation.y = HUMANOID_BASE_Y_ROT
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = false
        obj.receiveShadow = false
        obj.material = silhouetteMaterial
      }
    })
    return root
  }, [gltf.scene])

  useFrame((_, d) => {
    if (pausedRef.current) return
    if (vis.current) {
      vis.current.rotation.y += d * 0.022
    }
    if (particleHalo.current) {
      particleHalo.current.rotation.y -= d * 0.11
      particleHalo.current.rotation.x += d * 0.03
    }
    glowPulse.current += d
  })

  return (
    <group>
      <mesh
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        renderOrder={2}
      >
        <sphereGeometry args={[SUN_R, 36, 36]} />
        <meshBasicMaterial transparent depthWrite={false} opacity={0} />
      </mesh>
      <group ref={vis}>
        <primitive object={humanoid} />

        <mesh onUpdate={disableMeshRaycast} renderOrder={0} scale={[1.5, 1.65, 1.5]}>
          <sphereGeometry args={[SUN_R, 36, 36]} />
          <meshBasicMaterial
            color="#ff653f"
            transparent
            opacity={0.08}
            side={THREE.FrontSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} renderOrder={0} scale={[1.95, 2.08, 1.95]}>
          <sphereGeometry args={[SUN_R, 28, 28]} />
          <meshBasicMaterial
            color="#b145ff"
            transparent
            opacity={0.045}
            side={THREE.FrontSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <group ref={particleHalo}>
          {Array.from({ length: 28 }, (_, i) => {
            const t = (i / 28) * Math.PI * 2
            const r = SUN_R * (1.05 + (i % 5) * 0.07)
            const y = Math.sin(i * 1.1) * 4.2
            return (
              <mesh key={`core-particle-${i}`} position={[Math.cos(t) * r, y, Math.sin(t) * r]} onUpdate={disableMeshRaycast}>
                <sphereGeometry args={[0.19 + (i % 3) * 0.05, 8, 8]} />
                <meshBasicMaterial
                  color={i % 4 === 0 ? "#8ec9ff" : i % 2 === 0 ? "#ff6b49" : "#ffbb83"}
                  transparent
                  opacity={0.7}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )
          })}
        </group>
      </group>
    </group>
  )
}

function PlanetNode({
  planet,
  timeMs,
  pausedRef,
  posById,
  selected,
  onSelect,
}: {
  planet: SolarSystemPlanet
  timeMs: MutableRefObject<number>
  pausedRef: RefObject<boolean>
  posById: RefObject<Map<string, THREE.Vector3>>
  selected: boolean
  onSelect: (id: string) => void
}) {
  const group = useRef<THREE.Group>(null)
  const bodySpin = useRef<THREE.Group>(null)
  const pr = worldPlanetRadius(planet.size)
  const R = worldOrbitRadius(planet.radius)
  const orbitSpeed = planet.speed * (120 / Math.max(planet.radius, 24))
  const hitR = pr * HIT_PAD
  const spinR = spinRateFromId(planet.id)
  const orbitIndex = useMemo(() => orbitIndexFromRadius(planet.radius), [planet.radius])
  const sceneBaseColor = useMemo(() => realisticBaseColor(orbitIndex), [orbitIndex])
  const ringColor = useMemo(() => realisticRingColor(orbitIndex), [orbitIndex])
  const detail = useMemo(() => planetVisualProfile(planet.radius, sceneBaseColor), [planet.radius, sceneBaseColor])
  const textureKind = useMemo(() => planetTextureKind(orbitIndex), [orbitIndex])
  const planetTexture = useMemo(() => makePlanetTexture(textureKind, detail.color, orbitIndex), [textureKind, detail.color, orbitIndex])
  const bumpTexture = useMemo(() => makeBumpTexture(orbitIndex), [orbitIndex])
  const craterColor = useMemo(() => new THREE.Color(detail.color).offsetHSL(0, -0.03, -0.2), [detail.color])
  const highlightColor = useMemo(() => new THREE.Color(detail.color).offsetHSL(0, 0.08, 0.22), [detail.color])
  const inclination = useMemo(() => (orbitIndex % 2 === 0 ? 0.018 : -0.024) + orbitIndex * 0.002, [orbitIndex])

  useFrame((_, d) => {
    const g = group.current
    if (g) {
      const t = timeMs.current * orbitSpeed + planet.offset
      g.position.set(Math.cos(t) * R, Math.sin(t * 0.7 + planet.offset) * R * inclination, Math.sin(t) * R)
      const map = posById.current
      let slot = map.get(planet.id)
      if (!slot) {
        slot = new THREE.Vector3()
        map.set(planet.id, slot)
      }
      g.getWorldPosition(slot)
    }

    if (!pausedRef.current) {
      const s = bodySpin.current
      if (s) {
        s.rotation.y += d * spinR * (selected ? 0.4 : 1.15)
        s.rotation.x += d * 0.03 * Math.sin(spinR * 0.3)
      }
    }
  })

  return (
    <group ref={group}>
      {/* Invisible target so thin visuals / orbit rings don’t block picking; stopPropagation tames OrbitControls drag vs click */}
      <mesh
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(planet.id)
        }}
        renderOrder={1}
      >
        <sphereGeometry args={[hitR, 28, 28]} />
        <meshBasicMaterial transparent depthWrite={false} opacity={0} />
      </mesh>
      <group ref={bodySpin}>
        <mesh onUpdate={disableMeshRaycast} renderOrder={0}>
          <sphereGeometry args={[pr, 72, 72]} />
          <meshPhysicalMaterial
            map={planetTexture}
            bumpMap={bumpTexture}
            color={detail.color}
            emissive={detail.emissive}
            emissiveIntensity={selected ? detail.emissiveBoost + 0.42 : detail.emissiveBoost}
            metalness={detail.metalness}
            roughness={detail.roughness}
            envMapIntensity={detail.envMapIntensity}
            clearcoat={0.06}
            clearcoatRoughness={0.85}
            sheen={0.12}
            sheenRoughness={0.8}
            bumpScale={detail.bumpScale}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} scale={selected ? 1.18 : 1.1}>
          <sphereGeometry args={[pr, 40, 40]} />
          <meshBasicMaterial
            color={selected ? "#f8d797" : detail.emissive}
            transparent
            opacity={selected ? 0.12 : 0.055}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} position={[pr * 0.33, pr * 0.18, pr * 0.58]} scale={[1, 0.86, 1]}>
          <sphereGeometry args={[pr * 0.28, 20, 20]} />
          <meshBasicMaterial color="#fff7df" transparent opacity={selected ? 0.2 : 0.12} depthWrite={false} />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} rotation={[0.55, 0.35, 0.2]} scale={[1, 0.82, 1]}>
          <torusGeometry args={[pr * 0.74, pr * 0.04, 6, 64]} />
          <meshBasicMaterial color={highlightColor} transparent opacity={0.14} depthWrite={false} />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} rotation={[0.2, -0.25, 0.15]}>
          <torusGeometry args={[pr * 0.52, pr * 0.032, 6, 54]} />
          <meshBasicMaterial color={craterColor} transparent opacity={0.17} depthWrite={false} />
        </mesh>
        <PlanetSurfaceDetail pr={pr} orbitIndex={orbitIndex} baseColor={detail.color} />
        <mesh onUpdate={disableMeshRaycast}>
          <sphereGeometry args={[pr * detail.atmosphereScale, 24, 24]} />
          <meshStandardMaterial
            color={detail.color}
            emissive={detail.emissive}
            emissiveIntensity={0.2}
            transparent
            opacity={detail.atmosphereOpacity}
            side={THREE.BackSide}
            depthWrite={false}
            metalness={0.1}
            roughness={0.78}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} scale={1.035}>
          <sphereGeometry args={[pr, 24, 24]} />
          <meshBasicMaterial
            color={highlightColor}
            transparent
            opacity={selected ? 0.11 : 0.07}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {ringColor ? <PlanetRings pr={pr} ringColor={ringColor} pausedRef={pausedRef} /> : null}
      </group>
      {selected && (
        <mesh onUpdate={disableMeshRaycast} rotation={[Math.PI / 2, 0, 0]} renderOrder={-1}>
          <torusGeometry args={[pr * 2.95, 0.035, 4, 112]} />
          <meshBasicMaterial
            color="#f7d08d"
            transparent
            opacity={0.72}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      <Html center distanceFactor={38} style={{ pointerEvents: "none" }}>
        <span
          className="block max-w-[10rem] whitespace-normal px-2 py-1 text-center font-[Sora,sans-serif] text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f7e8c9]"
          style={{ textShadow: "0 0 12px rgba(0,0,0,0.9)" }}
        >
          {planet.name}
        </span>
      </Html>
    </group>
  )
}

function SelectionCameraSync({
  selectedId,
  posById,
  controlsRef,
}: {
  selectedId: string | null
  posById: RefObject<Map<string, THREE.Vector3>>
  controlsRef: RefObject<OrbitControlsImpl | null>
}) {
  const { camera } = useThree()
  const lastId = useRef<string | null | undefined>(undefined)
  const lastTarget = useRef<THREE.Vector3 | null>(null)
  const zoomT0 = useRef<number | null>(null)
  const zoomFromD = useRef(100)
  const hasInitialized = useRef(false)
  const toCam = useRef(new THREE.Vector3())
  const shift = useRef(new THREE.Vector3())
  const ideal = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const c = controlsRef.current
    if (!c) return
    if (!selectedId) return

    const focusSun = selectedId === SUN_FOCUS_ID
    const p = focusSun
      ? SUN_TARGET
      : (posById.current.get(selectedId) ?? null)
    if (!p) return

    if (!hasInitialized.current) {
      hasInitialized.current = true
      lastId.current = selectedId
      lastTarget.current = c.target.clone()
      zoomT0.current = FOCUS_ZOOM_SEC
      return
    }

    if (lastId.current !== selectedId) {
      lastId.current = selectedId
      lastTarget.current = c.target.clone()
      const fallbackD = focusSun ? SUN_FOCUS_OUT_DIST : FOCUS_ZOOM_OUT_DIST
      toCam.current.subVectors(camera.position, c.target)
      zoomFromD.current = toCam.current.length() > 0.1 ? toCam.current.length() : fallbackD
      zoomT0.current = 0
    }

    if (!lastTarget.current) {
      lastTarget.current = c.target.clone()
    }
    const prevT = lastTarget.current!

    const smooth = 1 - Math.exp(-TARGET_SMOOTH * delta)
    c.target.lerp(p, smooth)
    shift.current.subVectors(c.target, prevT)
    lastTarget.current = c.target.clone()
    if (shift.current.lengthSq() > 0) {
      camera.position.add(shift.current)
    }

    const outDist = focusSun ? SUN_FOCUS_OUT_DIST : FOCUS_ZOOM_OUT_DIST
    if (zoomT0.current !== null && zoomT0.current < FOCUS_ZOOM_SEC) {
      zoomT0.current += delta
      const t = Math.min(1, zoomT0.current / FOCUS_ZOOM_SEC)
      const e = 1 - (1 - t) * (1 - t)
      const d = THREE.MathUtils.lerp(zoomFromD.current, outDist, e)
      toCam.current.subVectors(camera.position, c.target)
      if (toCam.current.length() > 1e-4) {
        toCam.current.setLength(d)
        ideal.current.addVectors(c.target, toCam.current)
        camera.position.lerp(ideal.current, 1 - Math.exp(-7 * delta))
      }
    }

    c.update()
  })

  return null
}

function SceneContent({ planets, paused, selectedId, onSelect }: SceneContentProps) {
  const timeMs = useRef(0)
  const pausedRef = useRef(paused)
  const posById = useRef(new Map<string, THREE.Vector3>())
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  pausedRef.current = paused

  useFrame((_, delta) => {
    if (!pausedRef.current) timeMs.current += delta * 1000
  })

  return (
    <>
      <color attach="background" args={["#030510"]} />
      <fog attach="fog" args={["#030510", 125, 580]} />

      <ambientLight intensity={0.1} />
      <hemisphereLight args={["#8daeff", "#12060b", 0.24]} />
      <pointLight position={[0, 0, 0]} intensity={260} color="#ffd9a3" distance={0} decay={2} />
      <pointLight position={[0, 0, 0]} intensity={64} color="#ff7a2d" distance={80} decay={1.35} />
      <directionalLight position={[70, 85, 45]} intensity={0.62} color="#b8cfff" />
      <directionalLight position={[-90, -30, -60]} intensity={0.18} color="#6548ff" />

      <Suspense fallback={null}>
        <NebulaVeil />
        <GradientStars />
        <Stars
          radius={520}
          depth={95}
          count={6200}
          factor={2.5}
          saturation={0}
          fade
          speed={0.08}
        />
      </Suspense>

      <group rotation={ECLIPTIC_TILT}>
        {planets.map((planet) => (
          <OrbitGuide
            key={`orbit-${planet.id}`}
            radius={worldOrbitRadius(planet.radius)}
            selected={selectedId === planet.id}
          />
        ))}
      </group>
      <AsteroidBelt pausedRef={pausedRef} />
      <SunNode pausedRef={pausedRef} onSelect={() => onSelect(SUN_FOCUS_ID)} />

      {planets.map((planet) => (
        <PlanetNode
          key={planet.id}
          planet={planet}
          timeMs={timeMs}
          pausedRef={pausedRef}
          posById={posById}
          selected={selectedId === planet.id}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={20}
        maxDistance={400}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI - 0.08}
        enableDamping
        dampingFactor={0.06}
        screenSpacePanning
        zoomSpeed={0.85}
        panSpeed={0.65}
        rotateSpeed={0.65}
        target={[0, 0, 0]}
      />

      <SelectionCameraSync selectedId={selectedId} posById={posById} controlsRef={controlsRef} />
    </>
  )
}

type SolarSystemCanvasProps = SceneContentProps

export function SolarSystemCanvas({ planets, paused, selectedId, onSelect }: SolarSystemCanvasProps) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 40, 98], fov: 50, near: 0.1, far: 2000 }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.18
      }}
      onPointerMissed={() => onSelect(SUN_FOCUS_ID)}
    >
      <SceneContent planets={planets} paused={paused} selectedId={selectedId} onSelect={onSelect} />
    </Canvas>
  )
}

useGLTF.preload(HUMANOID_MODEL_URL)

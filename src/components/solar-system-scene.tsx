import { Suspense, useMemo, useRef, type MutableRefObject, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

const SUN_R = 9

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

const HIT_PAD = 2.45

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

  const torusA = useMemo(() => [pr * 1.75, 0.12, 8, 88] as const, [pr])
  const torusB = useMemo(() => [pr * 1.92, 0.05, 8, 96] as const, [pr])
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
          <torusGeometry args={torusA} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={0.35}
            metalness={0.35}
            roughness={0.4}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={ringShadow}>
        <mesh onUpdate={disableMeshRaycast}>
          <torusGeometry args={[pr * 1.82, 0.08, 8, 92]} />
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
          <torusGeometry args={torusB} />
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
          <torusGeometry args={[pr * 2.1, 0.025, 6, 80]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}

function SunNode({ pausedRef, onSelect }: { pausedRef: RefObject<boolean>; onSelect: () => void }) {
  const vis = useRef<THREE.Group>(null)

  useFrame((_, d) => {
    if (pausedRef.current) return
    if (vis.current) {
      vis.current.rotation.y += d * 0.1
      vis.current.rotation.x += d * 0.018
    }
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
        <mesh onUpdate={disableMeshRaycast} renderOrder={1}>
          <sphereGeometry args={[SUN_R, 72, 72]} />
          <meshPhysicalMaterial
            color="#ffcc88"
            emissive="#ff6a1a"
            emissiveIntensity={1.4}
            metalness={0.04}
            roughness={0.4}
            clearcoat={0.4}
            clearcoatRoughness={0.5}
            iridescence={0.2}
            iridescenceIOR={1.2}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} renderOrder={0} scale={1.08}>
          <sphereGeometry args={[SUN_R, 40, 40]} />
          <meshBasicMaterial
            color="#ffc070"
            transparent
            opacity={0.2}
            side={THREE.FrontSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} renderOrder={0} scale={1.22}>
          <sphereGeometry args={[SUN_R, 32, 32]} />
          <meshBasicMaterial
            color="#ff8c40"
            transparent
            opacity={0.1}
            side={THREE.FrontSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh onUpdate={disableMeshRaycast} renderOrder={0} rotation={[0.12, 0, 0.2]}>
          <torusGeometry args={[SUN_R * 1.4, 0.35, 2, 96]} />
          <meshBasicMaterial
            color="#ffb060"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
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
  const craterColor = useMemo(() => new THREE.Color(detail.color).offsetHSL(0, -0.03, -0.2), [detail.color])
  const highlightColor = useMemo(() => new THREE.Color(detail.color).offsetHSL(0, 0.08, 0.22), [detail.color])

  useFrame((_, d) => {
    const g = group.current
    if (g) {
      const t = timeMs.current * orbitSpeed + planet.offset
      g.position.set(Math.cos(t) * R, 0, Math.sin(t) * R)
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
          <sphereGeometry args={[pr, 44, 44]} />
          <meshPhysicalMaterial
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
      <Html center distanceFactor={38} style={{ pointerEvents: "none" }}>
        <span
          className="block max-w-[10rem] whitespace-normal text-center font-[Manrope,sans-serif] text-[10px] font-medium uppercase tracking-[0.18em] text-[#f7e8c9] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]"
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
      <fog attach="fog" args={["#030510", 140, 640]} />

      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0, 0]} intensity={140} color="#ffd9a3" distance={0} decay={2} />
      <directionalLight position={[50, 80, 40]} intensity={0.45} color="#b8cfff" />

      <Suspense fallback={null}>
        <Stars
          radius={400}
          depth={70}
          count={4400}
          factor={2.2}
          saturation={0}
          fade
          speed={0}
        />
      </Suspense>

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
      onPointerMissed={() => onSelect(SUN_FOCUS_ID)}
    >
      <SceneContent planets={planets} paused={paused} selectedId={selectedId} onSelect={onSelect} />
    </Canvas>
  )
}

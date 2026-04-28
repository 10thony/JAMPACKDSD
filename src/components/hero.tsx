import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "convex/react"
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Settings } from "lucide-react"
import { SolarSystemCanvas, SUN_FOCUS_ID } from "@/components/solar-system-scene"
import { useIsMobile } from "@/hooks/use-mobile"

type ProjectRecord = {
  _id?: string
  title?: string
  description?: string
  technologies?: string[]
  liveUrl?: string
  githubUrl?: string
}

type ResumeRecord = {
  name?: string
  title?: string
  contact?: {
    email?: string
    phone?: string
    portfolio?: string
  }
  experience?: Array<{
    company?: string
    title?: string
    dates?: string
    description?: string[]
  }>
  skills?: string[]
}

type Planet = {
  id: string
  name: string
  description: string
  technologies: string[]
  color: string
  glow: string
  ring?: string
  radius: number
  speed: number
  size: number
  offset: number
  moonCount: number
  liveUrl?: string
  githubUrl?: string
}

type FallbackPlanet = Omit<Planet, "radius" | "speed" | "offset">
const AUTHORIZED_USER_ID = "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"

const fallbackPlanets: FallbackPlanet[] = [
  {
    id: "mercury",
    name: "Signal",
    description: "Rapid prototypes and interaction studies.",
    technologies: ["TypeScript", "Vite"],
    color: "#f5c39d",
    glow: "rgba(245, 195, 157, 0.7)",
    size: 12,
    moonCount: 0,
    liveUrl: "/blog",
  },
  {
    id: "venus",
    name: "Ember",
    description: "Brand systems and visual storytelling builds.",
    technologies: ["React", "Tailwind"],
    color: "#f39a52",
    glow: "rgba(243, 154, 82, 0.75)",
    size: 18,
    moonCount: 1,
  },
  {
    id: "earth",
    name: "Atlas",
    description: "Core portfolio experiences and client pathways.",
    technologies: ["Convex", "Clerk"],
    color: "#61d8ff",
    glow: "rgba(97, 216, 255, 0.7)",
    ring: "rgba(147, 232, 255, 0.7)",
    size: 21,
    moonCount: 1,
  },
  {
    id: "mars",
    name: "Forge",
    description: "Product engineering with measurable outcomes.",
    technologies: ["Node", "REST"],
    color: "#ff6d63",
    glow: "rgba(255, 109, 99, 0.7)",
    size: 16,
    moonCount: 2,
  },
  {
    id: "jupiter",
    name: "Titan",
    description: "Larger systems and cross-team architecture.",
    technologies: ["Postgres", "Queues"],
    color: "#ffce72",
    glow: "rgba(255, 206, 114, 0.8)",
    ring: "rgba(255, 232, 166, 0.65)",
    size: 32,
    moonCount: 4,
  },
  {
    id: "saturn",
    name: "Arc",
    description: "High-polish UI systems with strong motion language.",
    technologies: ["Framer Motion", "Figma"],
    color: "#d4b58f",
    glow: "rgba(212, 181, 143, 0.8)",
    ring: "rgba(236, 210, 173, 0.8)",
    size: 28,
    moonCount: 3,
  },
  {
    id: "uranus",
    name: "Nexus",
    description: "Data-rich interactions and internal tooling.",
    technologies: ["Realtime", "Canvas"],
    color: "#90edff",
    glow: "rgba(144, 237, 255, 0.7)",
    size: 24,
    moonCount: 2,
  },
  {
    id: "neptune",
    name: "Pulse",
    description: "Experimental interfaces and exploratory graphics.",
    technologies: ["WebGL", "Shaders"],
    color: "#6c8cff",
    glow: "rgba(108, 140, 255, 0.75)",
    size: 23,
    moonCount: 1,
  },
]

export function Hero() {
  const isMobile = useIsMobile()
  const { isSignedIn, user } = useUser()
  const isAuthorized = user?.id === AUTHORIZED_USER_ID
  const projects = (useQuery(api.queries.getProjects) || []) as ProjectRecord[]
  const resumeData = useQuery(api.queries.getResumeData) as ResumeRecord | undefined
  const [paused, setPaused] = useState(false)
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null)
  const [experienceIndex, setExperienceIndex] = useState(0)
  const [experienceView, setExperienceView] = useState<"detail" | "list">("detail")
  const [aboutPanelExpanded, setAboutPanelExpanded] = useState(true)
  const [experiencePanelExpanded, setExperiencePanelExpanded] = useState(true)
  const experienceTouchStart = useRef<{ x: number; y: number } | null>(null)

  const planets = useMemo<Planet[]>(() => {
    const sourceCount = projects.length > 0 ? Math.min(projects.length, 8) : fallbackPlanets.length
    return Array.from({ length: sourceCount }, (_, index) => {
      const project = projects.length > 0 ? projects[index] : undefined
      const fallback = fallbackPlanets[index % fallbackPlanets.length]
      const radius = 64 + index * 26
      const speed = (0.0004 + index * 0.00008) * 0.3
      const size = Math.max(11, fallback.size - Math.floor(index / 2))
      const name = project?.title?.trim() || fallback.name
      return {
        id: project?._id || fallback.id + index,
        name,
        description: project?.description || fallback.description,
        technologies:
          project?.technologies && project.technologies.length > 0
            ? project.technologies.slice(0, 4)
            : fallback.technologies,
        color: fallback.color,
        glow: fallback.glow,
        ring: fallback.ring,
        radius,
        speed,
        size,
        offset: (Math.PI * 2 * index) / Math.max(sourceCount, 1),
        moonCount: fallback.moonCount,
        liveUrl: project?.liveUrl || fallback.liveUrl,
        githubUrl: project?.githubUrl || fallback.githubUrl,
      }
    })
  }, [projects])

  const atlasTemplatePlanet = useMemo<Planet>(() => {
    const atlasFallback = fallbackPlanets.find((planet) => planet.name === "Atlas") || fallbackPlanets[2]
    return {
      id: "atlas-template",
      name: atlasFallback.name,
      description: atlasFallback.description,
      technologies: atlasFallback.technologies,
      color: atlasFallback.color,
      glow: atlasFallback.glow,
      ring: atlasFallback.ring,
      radius: 64 + 2 * 26,
      speed: (0.0004 + 2 * 0.00008) * 0.3,
      size: atlasFallback.size,
      offset: 0,
      moonCount: atlasFallback.moonCount,
      liveUrl: atlasFallback.liveUrl,
      githubUrl: atlasFallback.githubUrl,
    }
  }, [])

  const selectedPlanet = useMemo(() => {
    if (selectedPlanetId === SUN_FOCUS_ID) return null
    if (!selectedPlanetId) return atlasTemplatePlanet
    return planets.find((planet) => planet.id === selectedPlanetId) ?? atlasTemplatePlanet
  }, [selectedPlanetId, planets, atlasTemplatePlanet])

  const sunAbout = useMemo(() => {
    const experiences = resumeData?.experience || []
    const topExperience = experiences[0]
    return {
      name: resumeData?.name || "Justin Martinez",
      title: resumeData?.title || "Software Developer",
      email: resumeData?.contact?.email || "Dev.jam0211@gmail.com",
      experiences:
        experiences.length > 0
          ? experiences
          : [
              {
                company: "Cobec Inc",
                title: "AI R&D Developer",
                dates: "July 2025 - Current",
                description: [
                  "Building practical AI-first product features and full-stack web systems.",
                ],
              },
            ],
      skills: (resumeData?.skills || ["React", "TypeScript", "Convex", "Node.js"]).slice(0, 4),
      portfolio: resumeData?.contact?.portfolio,
    }
  }, [resumeData])

  const totalExperiences = sunAbout.experiences.length
  const activeExperience = sunAbout.experiences[Math.min(experienceIndex, totalExperiences - 1)]

  useEffect(() => {
    setExperienceIndex(0)
  }, [resumeData])

  useEffect(() => {
    if (selectedPlanetId === SUN_FOCUS_ID) {
      setExperienceView("detail")
    }
  }, [selectedPlanetId])

  const goExperience = (direction: "prev" | "next") => {
    if (totalExperiences <= 1) return
    setExperienceIndex((current) => {
      if (direction === "next") return (current + 1) % totalExperiences
      return (current - 1 + totalExperiences) % totalExperiences
    })
  }

  const handleExperienceTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    experienceTouchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleExperienceTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!experienceTouchStart.current) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - experienceTouchStart.current.x
    const deltaY = touch.clientY - experienceTouchStart.current.y
    experienceTouchStart.current = null

    // Only treat as role-swipe when horizontal intent is clear.
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY)) return
    if (deltaX < 0) goExperience("next")
    if (deltaX > 0) goExperience("prev")
  }

  const scenePlanets = useMemo(
    () =>
      planets.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        ring: p.ring,
        radius: p.radius,
        speed: p.speed,
        offset: p.offset,
        size: p.size,
      })),
    [planets],
  )

  const shouldPauseForExperienceReading = selectedPlanetId === SUN_FOCUS_ID && experiencePanelExpanded
  const scenePaused = paused || shouldPauseForExperienceReading
  const selectedPlanetLiveUrl = selectedPlanet?.liveUrl?.trim()
  const selectedPlanetGithubUrl = selectedPlanet?.githubUrl?.trim()

  return (
    <section id="work" className="relative pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 px-4 md:px-10">
        <div className="flex h-full items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (selectedPlanetId !== SUN_FOCUS_ID) {
                  setSelectedPlanetId(SUN_FOCUS_ID)
                  setAboutPanelExpanded(true)
                  return
                }
                setAboutPanelExpanded((v) => !v)
              }}
              className="hud-button cosmic-body h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#efcc8f] md:h-10 md:px-5 md:text-sm"
              aria-expanded={aboutPanelExpanded}
              aria-label={aboutPanelExpanded ? "Collapse about panel" : "Expand about panel"}
            >
              About
              {aboutPanelExpanded ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
            </Button>

            {isSignedIn ? (
              <div className="flex items-center gap-2 md:gap-3">
                {isAuthorized && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hud-button h-8 w-8 text-[#f8e6c7] md:h-10 md:w-10"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </Link>
                )}

                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton
                mode="modal"
                appearance={{
                  elements: {
                    modalContent: "border border-[#d7b07955] bg-[#090e22] text-[#f4eedf]",
                    card: "border border-[#d7b07940] bg-[#0b1027] shadow-[0_20px_70px_-40px_rgba(255,174,83,0.65)]",
                    headerTitle: "text-[#f2dfbb]",
                    headerSubtitle: "text-[#ccb58d]",
                    socialButtonsBlockButton: "border border-[#d7b07944] bg-[#111a3a] text-[#f4eedf] hover:bg-[#16224b]",
                    formButtonPrimary: "bg-[#d79a4d] text-[#170e08] hover:bg-[#e6ad63]",
                    footerActionLink: "text-[#e7c58c] hover:text-[#f7d6a5]",
                  },
                }}
              >
                <Button
                  variant="outline"
                  className="hud-button cosmic-body h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f8e6c7] md:h-10 md:px-5 md:text-sm"
                >
                  Login
                </Button>
              </SignInButton>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (selectedPlanetId !== SUN_FOCUS_ID) {
                  setSelectedPlanetId(SUN_FOCUS_ID)
                  setExperiencePanelExpanded(true)
                  return
                }
                setExperiencePanelExpanded((v) => !v)
              }}
              className="hud-button cosmic-body h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#efcc8f] md:h-10 md:px-5 md:text-sm"
              aria-expanded={experiencePanelExpanded}
              aria-label={experiencePanelExpanded ? "Collapse experience panel" : "Expand experience panel"}
            >
              Experience
              {experiencePanelExpanded ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
            </Button>

            <Button
              variant="outline"
              className="hud-button cosmic-body h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f8e6c7] md:h-10 md:px-5 md:text-sm"
              asChild
            >
              <a href="/blog">Star Logs</a>
            </Button>
          </div>
        </div>
      </div>
      <div className="observatory-shell relative h-[calc(100vh-4rem)] w-full overflow-hidden border-y border-[#d7b07933] bg-[#030510] text-[#f4eedf]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Sora:wght@300;400;500;600&display=swap');
          .cosmic-title { font-family: "Cormorant Garamond", serif; letter-spacing: 0.06em; }
          .cosmic-body { font-family: "Sora", sans-serif; letter-spacing: 0.015em; }
          .observatory-shell::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              linear-gradient(90deg, rgba(247,208,141,0.07) 1px, transparent 1px),
              linear-gradient(180deg, rgba(247,208,141,0.045) 1px, transparent 1px);
            background-size: 72px 72px;
            mask-image: radial-gradient(circle at 50% 48%, transparent 0 18%, black 55%, transparent 100%);
            opacity: 0.42;
          }
          .scene-card {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(244, 202, 142, 0.32);
            background:
              linear-gradient(150deg, rgba(19,28,58,0.86), rgba(8,12,27,0.78) 58%, rgba(15,12,32,0.86)),
              radial-gradient(circle at 18% 0%, rgba(244,194,111,0.18), transparent 38%);
            box-shadow:
              0 26px 90px -48px rgba(255, 174, 83, 0.8),
              0 0 0 1px rgba(122, 157, 255, 0.08),
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -28px 60px rgba(0,0,0,0.26);
            backdrop-filter: blur(18px) saturate(1.18);
          }
          .scene-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background:
              linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 42%),
              linear-gradient(90deg, rgba(255,218,151,0.12) 0 1px, transparent 1px calc(100% - 1px), rgba(142,171,255,0.16) calc(100% - 1px));
            pointer-events: none;
          }
          .scene-card::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background:
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              radial-gradient(circle at 82% 18%, rgba(135,166,255,0.16), transparent 24%);
            background-size: 100% 9px, auto;
            mix-blend-mode: screen;
            opacity: 0.4;
            pointer-events: none;
          }
          .scene-card.scene-card-transparent {
            background: transparent;
            border-color: transparent;
            box-shadow: none;
            backdrop-filter: none;
          }
          .scene-card.scene-card-transparent::before,
          .scene-card.scene-card-transparent::after {
            opacity: 0;
            pointer-events: none;
          }
          .scene-card-float {
            animation: panelFloat 8.4s ease-in-out infinite;
          }
          .scene-chip {
            border: 1px solid rgba(255,255,255,0.18);
            background: linear-gradient(180deg, rgba(42,56,99,0.82), rgba(19,28,57,0.76));
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 24px -18px rgba(116,155,255,0.8);
          }
          .hud-button {
            border-color: transparent !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          .hud-button:hover {
            background: rgba(255, 223, 171, 0.08) !important;
          }
          .solar-cta {
            background: linear-gradient(135deg, #ffd891, #de8a3a 55%, #a65335) !important;
            color: #170e08 !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 34px -24px rgba(255,173,72,0.95);
          }
          .solar-cta:hover {
            background: linear-gradient(135deg, #ffe5ad, #ef9d48 55%, #bd6540) !important;
          }
          .scroll-orbit::-webkit-scrollbar { width: 9px; }
          .scroll-orbit::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); border-radius: 999px; }
          .scroll-orbit::-webkit-scrollbar-thumb { background: linear-gradient(#f0ce91, #7e91c7); border-radius: 999px; border: 2px solid rgba(13,18,39,0.94); }
          @keyframes panelFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
        `}</style>

        <div className="absolute inset-0 z-0">
          <SolarSystemCanvas
            planets={scenePlanets}
            paused={scenePaused}
            selectedId={selectedPlanetId}
            onSelect={setSelectedPlanetId}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(255,209,136,0.14),transparent_38%),radial-gradient(circle_at_87%_90%,rgba(111,160,255,0.14),transparent_36%),radial-gradient(circle_at_44%_76%,rgba(129,97,255,0.08),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
          <p
            className={
              isMobile && (selectedPlanet || selectedPlanetId === SUN_FOCUS_ID)
                ? "cosmic-body pointer-events-none absolute left-4 top-24 z-[5] max-w-[72vw] px-3 py-2 text-[10px] leading-relaxed text-[#cfbea3] [text-shadow:0_0_18px_rgba(246,188,120,0.55)]"
                : "cosmic-body pointer-events-none absolute bottom-3 left-4 z-[5] max-w-[72vw] px-3 py-2 text-[10px] leading-relaxed text-[#cfbea3] [text-shadow:0_0_18px_rgba(246,188,120,0.55)] md:bottom-8 md:left-8 md:max-w-xs md:text-sm"
            }
          >
            <span className="text-[#f0cc8d]">Flight controls:</span>{" "}
            {isMobile
              ? "one finger to orbit · pinch to zoom"
              : "drag to orbit · scroll to zoom · right-drag to pan"}
          </p>

          {selectedPlanet && isMobile && (
            <div className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20 flex max-h-[min(50vh,420px)] flex-col gap-2 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <aside className="cosmic-body scene-card-float w-full shrink-0 p-3 text-[#f7ebd5] [text-shadow:0_0_16px_rgba(0,0,0,0.72)]">
                <p className="cosmic-title text-[10px] uppercase tracking-[0.32em] text-[#efcc8f]">Selected Orbit</p>
                <h2 className="cosmic-title mt-1 text-xl font-semibold leading-tight">{selectedPlanet.name}</h2>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#dfcdaf]">
                  {selectedPlanet.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPlanet.technologies.map((tech) => (
                    <span
                      key={`mobile-${tech}`}
                      className="scene-chip rounded-md px-2 py-1 text-[10px] text-[#f7e9cf]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="cosmic-body scene-card w-full shrink-0 rounded-2xl p-3 text-[#f7ebd5]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Actions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPlanetLiveUrl ? (
                    <Button asChild size="sm" className="solar-cta h-8 px-3 text-xs">
                      <a href={selectedPlanetLiveUrl}>Launch</a>
                    </Button>
                  ) : (
                    <Button size="sm" className="solar-cta h-8 px-3 text-xs opacity-55" disabled>
                      Launch
                    </Button>
                  )}
                  {selectedPlanetGithubUrl ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="hud-button h-8 px-3 text-xs text-[#d4e2ff]"
                    >
                      <a href={selectedPlanetGithubUrl} target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hud-button h-8 px-3 text-xs text-[#d4e2ff] opacity-55"
                      disabled
                    >
                      Source
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="hud-button h-8 px-3 text-xs text-[#f3e2c2]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>
            </div>
          )}

          {selectedPlanet && !isMobile && (
            <>
              <aside className="scene-card-float cosmic-body pointer-events-auto absolute left-4 top-4 w-[min(72vw,370px)] p-3 text-[#f7ebd5] [text-shadow:0_0_16px_rgba(0,0,0,0.72)] md:left-10 md:top-10 md:w-[min(100vw-2rem,370px)] md:p-5">
                <p className="cosmic-title text-[10px] uppercase tracking-[0.32em] text-[#efcc8f]">Selected Orbit</p>
                <h2 className="cosmic-title mt-2 text-2xl font-semibold leading-none md:text-[2.05rem]">{selectedPlanet.name}</h2>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#dfcdaf] md:mt-3 md:line-clamp-none md:text-sm">
                  {selectedPlanet.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 md:hidden">
                  {selectedPlanet.technologies.map((tech) => (
                    <span
                      key={`mobile-${tech}`}
                      className="scene-chip rounded-md px-2 py-1 text-[10px] text-[#f7e9cf]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute right-4 top-16 hidden w-[min(44vw,320px)] rounded-2xl p-3 text-[#f7ebd5] md:right-10 md:top-28 md:block md:w-[min(100vw-2rem,320px)] md:p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Core Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPlanet.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="scene-chip rounded-md px-2 py-1 text-[10px] text-[#f7e9cf] md:text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 right-4 hidden w-[min(100vw-2rem,315px)] rounded-2xl p-4 text-[#f7ebd5] md:bottom-10 md:right-10 md:block">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPlanetLiveUrl ? (
                    <Button
                      asChild
                      size="sm"
                      className="solar-cta"
                    >
                      <a href={selectedPlanetLiveUrl}>Launch</a>
                    </Button>
                  ) : (
                    <Button size="sm" className="solar-cta opacity-55" disabled>
                      Launch
                    </Button>
                  )}
                  {selectedPlanetGithubUrl ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="hud-button text-[#d4e2ff]"
                    >
                      <a href={selectedPlanetGithubUrl} target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hud-button text-[#d4e2ff] opacity-55"
                      disabled
                    >
                      Source
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="hud-button text-[#f3e2c2]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>
            </>
          )}

          {selectedPlanetId === SUN_FOCUS_ID && isMobile && (
            <div className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20 flex max-h-[min(80vh,760px)] flex-col gap-2 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <aside className="cosmic-body w-full min-w-0 rounded-2xl border border-transparent bg-transparent p-3 text-[#f7ebd5] shadow-none [text-shadow:0_0_16px_rgba(0,0,0,0.72)]">
                <div className="relative z-[1] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {experiencePanelExpanded && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExperienceView((view) => (view === "detail" ? "list" : "detail"))
                        }
                        className="hud-button h-7 px-2 text-[10px] text-[#f2ddba]"
                      >
                        {experienceView === "detail" ? "List" : "Detail"}
                      </Button>
                    )}
                  </div>
                </div>

                {experiencePanelExpanded && (
                  <>
                    <div
                      className="scroll-orbit mt-2 max-h-[min(36vh,300px)] w-full overflow-y-auto rounded-md border border-transparent bg-[#0b1027] p-3 pr-2 shadow-[inset_0_1px_22px_rgba(0,0,0,0.28)]"
                      onTouchStart={handleExperienceTouchStart}
                      onTouchEnd={handleExperienceTouchEnd}
                    >
                      {experienceView === "detail" ? (
                        <>
                          <p className="text-base font-semibold leading-snug text-[#f8ebd4]">
                            {activeExperience?.title || "Role"}
                          </p>
                          <p className="mt-1 text-sm text-[#d0b690]">
                            {activeExperience?.company || "Company"} - {activeExperience?.dates || "Dates"}
                          </p>
                          <div className="mt-3 space-y-3">
                            {(activeExperience?.description || []).map((line, lineIndex) => (
                              <p key={`${line}-${lineIndex}`} className="text-sm leading-relaxed text-[#dac8a8]">
                                {line}
                              </p>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="mt-1 space-y-2">
                          {sunAbout.experiences.map((experience, index) => (
                            <button
                              key={`${experience.title || "role"}-${index}`}
                              type="button"
                              onClick={() => {
                                setExperienceIndex(index)
                                setExperienceView("detail")
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                index === experienceIndex
                                  ? "border-[#f0c57e88] bg-[#2a3b70] text-[#f9e8c7]"
                                  : "border-[#ffffff2b] bg-[#111a37] text-[#e8d2ac] hover:bg-[#22325f]"
                              }`}
                            >
                              <p className="text-sm font-semibold">{experience.title || "Role"}</p>
                              <p className="mt-1 text-xs text-[#cbb08a]">{experience.dates || "Dates"}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[10px] text-[#cfb287]">
                        Role {Math.min(experienceIndex + 1, totalExperiences)} of {totalExperiences}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => goExperience("prev")}
                          className="hud-button h-8 px-2 text-xs text-[#f3dfbd]"
                        >
                          Prev
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => goExperience("next")}
                          className="hud-button h-8 px-2 text-xs text-[#f3dfbd]"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-[#b89a71]">Swipe left/right to browse roles</p>
                  </>
                )}
              </aside>

              {aboutPanelExpanded && (
                <aside className="scene-card-float cosmic-body w-full shrink-0 p-3 text-[#f7ebd5] [text-shadow:0_0_16px_rgba(0,0,0,0.72)]">
                  <h2 className="cosmic-title text-[1.5rem] font-semibold leading-none">{sunAbout.name}</h2>
                  <p className="mt-1 text-xs text-[#d8c39f]">{sunAbout.title}</p>
                  <a
                    href={`mailto:${sunAbout.email}`}
                    className="mt-2 block text-xs text-[#f0d6ad] hover:text-[#ffe5c0]"
                  >
                    {sunAbout.email}
                  </a>
                </aside>
              )}

              <aside className="cosmic-body scene-card scene-card-transparent w-full shrink-0 rounded-2xl p-3 text-[#f7ebd5]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Capabilities</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-[#e7d0a8]">
                  {sunAbout.skills.slice(0, 3).join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                  {sunAbout.portfolio && (
                    <Button asChild size="sm" className="solar-cta h-8 px-3 text-xs">
                      <a href={sunAbout.portfolio} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="hud-button h-8 px-3 text-xs text-[#d4e2ff]"
                  >
                    <a href="mailto:Dev.jam0211@gmail.com">Contact</a>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="hud-button h-8 px-3 text-xs text-[#f3e2c2]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>
            </div>
          )}

          {selectedPlanetId === SUN_FOCUS_ID && !isMobile && (
            <>
              <aside className="scene-card-float cosmic-body pointer-events-auto absolute left-4 top-4 w-[min(100vw-2rem,360px)] p-3 text-[#f7ebd5] [text-shadow:0_0_16px_rgba(0,0,0,0.72)] md:left-10 md:top-10 md:p-5">
                {aboutPanelExpanded && (
                  <>
                    <h2 className="cosmic-title text-[2rem] font-semibold leading-none md:text-[2.15rem]">{sunAbout.name}</h2>
                    <p className="mt-1 text-xs text-[#d8c39f] md:text-sm">{sunAbout.title}</p>
                    <a href={`mailto:${sunAbout.email}`} className="mt-2 block text-xs text-[#f0d6ad] hover:text-[#ffe5c0] md:text-sm">
                      {sunAbout.email}
                    </a>
                  </>
                )}
              </aside>

              <aside className="cosmic-body pointer-events-auto absolute left-1/2 top-28 w-[min(100vw-2.5rem,560px)] -translate-x-1/2 rounded-2xl border border-transparent bg-transparent p-4 text-[#f7ebd5] shadow-none [text-shadow:0_0_16px_rgba(0,0,0,0.72)] md:top-24 md:p-5">
                <div className="relative z-[1] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {experiencePanelExpanded && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExperienceView((view) => (view === "detail" ? "list" : "detail"))
                        }
                        className="hud-button h-7 px-2 text-[10px] text-[#f2ddba]"
                      >
                        {experienceView === "detail" ? "List" : "Detail"}
                      </Button>
                    )}
                  </div>
                </div>

                {experiencePanelExpanded && (
                  <>
                <div
                  className="scroll-orbit mt-3 max-h-[360px] w-full overflow-y-auto rounded-none border border-transparent bg-[#0b1027] p-4 pr-3 shadow-[inset_0_1px_22px_rgba(0,0,0,0.28)] md:max-h-[620px]"
                  onTouchStart={handleExperienceTouchStart}
                  onTouchEnd={handleExperienceTouchEnd}
                >
                  {experienceView === "detail" ? (
                    <>
                      <p className="text-base font-semibold leading-snug text-[#f8ebd4] md:text-lg">
                        {activeExperience?.title || "Role"}
                      </p>
                      <p className="mt-1 text-sm text-[#d0b690]">
                        {activeExperience?.company || "Company"} - {activeExperience?.dates || "Dates"}
                      </p>
                      <div className="mt-3 space-y-3">
                        {(activeExperience?.description || []).map((line, lineIndex) => (
                          <p key={`${line}-${lineIndex}`} className="text-sm leading-relaxed text-[#dac8a8] md:text-[0.95rem]">
                            {line}
                          </p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {sunAbout.experiences.map((experience, index) => (
                        <button
                          key={`${experience.title || "role"}-${index}`}
                          type="button"
                          onClick={() => {
                            setExperienceIndex(index)
                            setExperienceView("detail")
                          }}
                          className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                            index === experienceIndex
                              ? "border-[#f0c57e88] bg-[#2a3b70] text-[#f9e8c7]"
                              : "border-[#ffffff2b] bg-[#111a37] text-[#e8d2ac] hover:bg-[#22325f]"
                          }`}
                        >
                          <p className="text-sm font-semibold">{experience.title || "Role"}</p>
                          <p className="mt-1 text-xs text-[#cbb08a]">{experience.dates || "Dates"}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-[#cfb287]">
                    Role {Math.min(experienceIndex + 1, totalExperiences)} of {totalExperiences}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => goExperience("prev")}
                      className="hud-button h-8 px-2 text-xs text-[#f3dfbd] md:px-3 md:text-sm"
                    >
                      Prev
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => goExperience("next")}
                      className="hud-button h-8 px-2 text-xs text-[#f3dfbd] md:px-3 md:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-[#b89a71] md:hidden">Swipe left/right to browse roles</p>
                  </>
                )}
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 left-4 hidden w-[min(100vw-2rem,320px)] rounded-2xl p-4 text-[#f7ebd5] md:bottom-10 md:left-10 md:block">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Capabilities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sunAbout.skills.map((skill) => (
                    <span key={skill} className="scene-chip rounded-md px-2 py-1 text-[11px] text-[#f7e9cf]">
                      {skill}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 right-4 hidden w-[min(100vw-2rem,315px)] rounded-2xl p-4 text-[#f7ebd5] md:bottom-10 md:right-10 md:block">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sunAbout.portfolio && (
                    <Button asChild size="sm" className="solar-cta">
                      <a href={sunAbout.portfolio} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="hud-button text-[#d4e2ff]"
                  >
                    <a href="mailto:Dev.jam0211@gmail.com">Contact</a>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="hud-button text-[#f3e2c2]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

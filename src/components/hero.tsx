import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { SolarSystemCanvas, SUN_FOCUS_ID } from "@/components/solar-system-scene"

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

  const selectedPlanet = useMemo(() => {
    if (selectedPlanetId === SUN_FOCUS_ID) return null
    return (
      planets.find((planet) => planet.id === selectedPlanetId) ??
      planets[Math.min(2, Math.max(0, planets.length - 1))]
    )
  }, [selectedPlanetId, planets])

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

  useEffect(() => {
    if (!selectedPlanetId && planets.length > 0) {
      setSelectedPlanetId(planets[Math.min(2, planets.length - 1)].id)
    }
  }, [selectedPlanetId, planets])

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

  return (
    <section id="work" className="pt-16">
      <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden border-y border-[#d7b07933] bg-[#030510] text-[#f4eedf]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Sora:wght@300;400;500;600&display=swap');
          .cosmic-title { font-family: "Cormorant Garamond", serif; letter-spacing: 0.06em; }
          .cosmic-body { font-family: "Sora", sans-serif; letter-spacing: 0.015em; }
          .scene-card {
            border: 1px solid rgba(231, 193, 132, 0.29);
            background: linear-gradient(160deg, rgba(16,22,45,0.9), rgba(9,14,33,0.88));
            box-shadow: 0 26px 80px -48px rgba(255, 164, 82, 0.72), inset 0 0 0 1px rgba(255,255,255,0.03);
            backdrop-filter: blur(12px);
          }
          .scene-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0));
            pointer-events: none;
          }
          .scene-card-float {
            animation: panelFloat 8.4s ease-in-out infinite;
          }
          @keyframes panelFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
        `}</style>

        <div className="absolute inset-0 z-0">
          <SolarSystemCanvas
            planets={scenePlanets}
            paused={paused}
            selectedId={selectedPlanetId}
            onSelect={setSelectedPlanetId}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(255,209,136,0.14),transparent_38%),radial-gradient(circle_at_87%_90%,rgba(111,160,255,0.14),transparent_36%),radial-gradient(circle_at_44%_76%,rgba(129,97,255,0.08),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
          <div className="pointer-events-auto absolute right-4 top-16 md:right-10 md:top-10">
            <Button
              variant="outline"
              className="cosmic-body h-8 border-[#f5c78f70] bg-[#10173bcc] px-3 text-xs text-[#f8e6c7] hover:bg-[#1a2555] md:h-9 md:px-4 md:text-sm"
              asChild
            >
              <a href="/blog">Star Logs</a>
            </Button>
          </div>

          <p className="cosmic-body pointer-events-none absolute bottom-3 left-4 max-w-[72vw] text-[10px] leading-relaxed text-[#cfbea3] md:bottom-8 md:left-8 md:max-w-xs md:text-sm">
            <span className="text-[#f0cc8d]">Flight controls:</span> drag to orbit · scroll to zoom · right-drag to pan
          </p>

          {selectedPlanet && (
            <>
              <aside className="scene-card scene-card-float cosmic-body pointer-events-auto absolute left-4 top-4 w-[min(72vw,370px)] rounded-2xl p-3 text-[#f7ebd5] md:left-10 md:top-10 md:w-[min(100vw-2rem,370px)] md:p-5">
                <p className="cosmic-title text-[10px] uppercase tracking-[0.32em] text-[#efcc8f]">Selected Orbit</p>
                <h2 className="cosmic-title mt-2 text-2xl font-semibold leading-none md:text-[2.05rem]">{selectedPlanet.name}</h2>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#dfcdaf] md:mt-3 md:line-clamp-none md:text-sm">
                  {selectedPlanet.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 md:hidden">
                  {selectedPlanet.technologies.map((tech) => (
                    <span
                      key={`mobile-${tech}`}
                      className="rounded-md border border-[#ffffff2f] bg-[#1d2747b8] px-2 py-1 text-[10px] text-[#f7e9cf]"
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
                      className="rounded-md border border-[#ffffff2f] bg-[#1d2747b8] px-2 py-1 text-[10px] text-[#f7e9cf] md:text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 right-4 hidden w-[min(100vw-2rem,315px)] rounded-2xl p-4 text-[#f7ebd5] md:bottom-10 md:right-10 md:block">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPlanet.liveUrl && (
                    <Button
                      asChild
                      size="sm"
                      className="bg-[#e4a24f] text-[#17100a] hover:bg-[#f1b86b]"
                    >
                      <a href={selectedPlanet.liveUrl}>Launch</a>
                    </Button>
                  )}
                  {selectedPlanet.githubUrl && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-[#8db7ff88] bg-transparent text-[#d4e2ff] hover:bg-[#213965]"
                    >
                      <a href={selectedPlanet.githubUrl} target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="border-[#f3d6a266] bg-transparent text-[#f3e2c2] hover:bg-[#332742]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 right-4 left-4 rounded-2xl p-3 text-[#f7ebd5] md:hidden">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Actions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPlanet.liveUrl && (
                    <Button asChild size="sm" className="h-8 bg-[#e4a24f] px-3 text-xs text-[#17100a] hover:bg-[#f1b86b]">
                      <a href={selectedPlanet.liveUrl}>Launch</a>
                    </Button>
                  )}
                  {selectedPlanet.githubUrl && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 border-[#8db7ff88] bg-transparent px-3 text-xs text-[#d4e2ff] hover:bg-[#213965]"
                    >
                      <a href={selectedPlanet.githubUrl} target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="h-8 border-[#f3d6a266] bg-transparent px-3 text-xs text-[#f3e2c2] hover:bg-[#332742]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>
            </>
          )}

          {selectedPlanetId === SUN_FOCUS_ID && (
            <>
              <aside className="scene-card scene-card-float cosmic-body pointer-events-auto absolute left-4 top-4 w-[min(100vw-2rem,360px)] rounded-2xl p-3 text-[#f7ebd5] md:left-10 md:top-10 md:p-5">
                <div className="relative z-[1] flex items-start justify-between gap-2">
                  <p className="cosmic-title text-[10px] uppercase tracking-[0.34em] text-[#efcc8f]">About</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setAboutPanelExpanded((v) => !v)}
                    className="-mt-0.5 h-8 w-8 shrink-0 text-[#efcc8f] hover:bg-[#ffffff14]"
                    aria-expanded={aboutPanelExpanded}
                    aria-label={aboutPanelExpanded ? "Collapse about panel" : "Expand about panel"}
                  >
                    {aboutPanelExpanded ? (
                      <ChevronUp className="h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </div>
                {aboutPanelExpanded && (
                  <>
                    <h2 className="cosmic-title mt-2 text-[2rem] font-semibold leading-none md:text-[2.15rem]">{sunAbout.name}</h2>
                    <p className="mt-1 text-xs text-[#d8c39f] md:text-sm">{sunAbout.title}</p>
                    <a href={`mailto:${sunAbout.email}`} className="mt-2 block text-xs text-[#f0d6ad] hover:text-[#ffe5c0] md:text-sm">
                      {sunAbout.email}
                    </a>
                  </>
                )}
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute right-4 top-28 left-4 rounded-2xl p-3 text-[#f7ebd5] md:top-28 md:left-auto md:w-[min(100vw-2rem,370px)] md:p-4">
                <div className="relative z-[1] flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#efcc8f]">Experience</p>
                  <div className="flex items-center gap-2">
                    {experiencePanelExpanded && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExperienceView((view) => (view === "detail" ? "list" : "detail"))
                        }
                        className="h-7 border-[#ffffff35] bg-transparent px-2 text-[10px] text-[#f2ddba] hover:bg-[#2a3663]"
                      >
                        {experienceView === "detail" ? "List" : "Detail"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setExperiencePanelExpanded((v) => !v)}
                      className="h-8 w-8 shrink-0 text-[#efcc8f] hover:bg-[#ffffff14]"
                      aria-expanded={experiencePanelExpanded}
                      aria-label={experiencePanelExpanded ? "Collapse experience panel" : "Expand experience panel"}
                    >
                      {experiencePanelExpanded ? (
                        <ChevronUp className="h-4 w-4" aria-hidden />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                </div>

                {experiencePanelExpanded && (
                  <>
                <div
                  className="mt-2 max-h-[250px] overflow-y-auto rounded-xl border border-[#ffffff24] bg-[#17213dbb] p-3 pr-2 md:max-h-[420px]"
                  onTouchStart={handleExperienceTouchStart}
                  onTouchEnd={handleExperienceTouchEnd}
                >
                  {experienceView === "detail" ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-[#f8ebd4]">
                        {activeExperience?.title || "Role"}
                      </p>
                      <p className="text-xs text-[#d0b690]">
                        {activeExperience?.company || "Company"} - {activeExperience?.dates || "Dates"}
                      </p>
                      <div className="mt-2 space-y-2">
                        {(activeExperience?.description || []).map((line, lineIndex) => (
                          <p key={`${line}-${lineIndex}`} className="text-xs leading-relaxed text-[#dac8a8]">
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
                              ? "border-[#f0c57e88] bg-[#263764] text-[#f9e8c7]"
                              : "border-[#ffffff2b] bg-[#1c274a] text-[#e8d2ac] hover:bg-[#23325d]"
                          }`}
                        >
                          <p className="text-xs font-semibold">{experience.title || "Role"}</p>
                          <p className="mt-1 text-[11px] text-[#cbb08a]">{experience.dates || "Dates"}</p>
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
                      className="h-8 border-[#ffffff32] bg-transparent px-2 text-xs text-[#f3dfbd] hover:bg-[#2d3a6a] md:px-3 md:text-sm"
                    >
                      Prev
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => goExperience("next")}
                      className="h-8 border-[#ffffff32] bg-transparent px-2 text-xs text-[#f3dfbd] hover:bg-[#2d3a6a] md:px-3 md:text-sm"
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
                    <span key={skill} className="rounded-md border border-[#ffffff2a] bg-[#1d2747b8] px-2 py-1 text-[11px] text-[#f7e9cf]">
                      {skill}
                    </span>
                  ))}
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 right-4 hidden w-[min(100vw-2rem,315px)] rounded-2xl p-4 text-[#f7ebd5] md:bottom-10 md:right-10 md:block">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sunAbout.portfolio && (
                    <Button asChild size="sm" className="bg-[#e4a24f] text-[#17100a] hover:bg-[#f1b86b]">
                      <a href={sunAbout.portfolio} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-[#8db7ff88] bg-transparent text-[#d4e2ff] hover:bg-[#213965]"
                  >
                    <a href="mailto:Dev.jam0211@gmail.com">Contact</a>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPaused((value) => !value)}
                    className="border-[#f3d6a266] bg-transparent text-[#f3e2c2] hover:bg-[#332742]"
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </aside>

              <aside className="scene-card cosmic-body pointer-events-auto absolute bottom-4 left-4 right-4 rounded-2xl p-3 text-[#f7ebd5] md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#efcc8f]">Capabilities</p>
                    <p className="mt-1 text-[11px] text-[#e7d0a8]">
                      {sunAbout.skills.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 border-[#8db7ff88] bg-transparent px-3 text-xs text-[#d4e2ff] hover:bg-[#213965]"
                    >
                      <a href="mailto:Dev.jam0211@gmail.com">Contact</a>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPaused((value) => !value)}
                      className="h-8 border-[#f3d6a266] bg-transparent px-3 text-xs text-[#f3e2c2] hover:bg-[#332742]"
                    >
                      {paused ? "Resume" : "Pause"}
                    </Button>
                  </div>
                </div>
              </aside>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

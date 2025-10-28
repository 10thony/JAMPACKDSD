"use server"

export interface Project {
  id: string
  title: string
  url: string
  description?: string
  tags?: string[]
  createdAt: Date
}

// In-memory storage (replace with database in production)
let projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    url: "https://vercel.com",
    description: "A modern e-commerce solution built with Next.js and Stripe",
    tags: ["Next.js", "TypeScript", "Stripe"],
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Design System",
    url: "https://ui.shadcn.com",
    description: "Comprehensive component library and design tokens",
    tags: ["React", "Tailwind", "Radix UI"],
    createdAt: new Date(),
  },
]

export async function getProjects(): Promise<Project[]> {
  return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function addProject(data: Omit<Project, "id" | "createdAt">): Promise<Project> {
  const newProject: Project = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date(),
  }

  projects.push(newProject)
  return newProject
}

export async function deleteProject(id: string): Promise<void> {
  projects = projects.filter((p) => p.id !== id)
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>,
): Promise<Project | null> {
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null

  projects[index] = {
    ...projects[index],
    ...data,
  }

  return projects[index]
}

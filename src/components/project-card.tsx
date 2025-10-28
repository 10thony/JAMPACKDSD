import { Card } from "@/components/ui/card"
import { ExternalLink, Github } from "lucide-react"
import { InlineProjectManager } from "./inline-project-manager"

interface ProjectCardProps {
  project: any // Convex document type
}

export function ProjectCard({ project }: ProjectCardProps) {
  const projectUrl = project.liveUrl || project.githubUrl

  return (
    <Card 
      className="group overflow-hidden border-border/50 hover:border-border transition-all duration-300 relative"
    >
      <InlineProjectManager project={project} />
      {projectUrl ? (
        <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="block">
          <div className="aspect-[16/10] bg-muted relative overflow-hidden">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚀</div>
                  <p className="text-sm">No preview available</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-medium group-hover:text-primary transition-colors">{project.title}</h3>
                  {project.featured && (
                    <span className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground">
                      Featured
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 mt-1">
                {project.liveUrl && <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                {project.githubUrl && <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
              </div>
            </div>

            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.technologies.map((tech: string) => (
                  <span key={tech} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
      ) : (
        <div className="block">
          <div className="aspect-[16/10] bg-muted relative overflow-hidden">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚀</div>
                  <p className="text-sm">No preview available</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-medium">{project.title}</h3>
                  {project.featured && (
                    <span className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground">
                      Featured
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                )}
              </div>
            </div>

            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.technologies.map((tech: string) => (
                  <span key={tech} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

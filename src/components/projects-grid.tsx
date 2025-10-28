import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"

export function ProjectsGrid() {
  const projects = useQuery(api.queries.getProjects) || []
  const [isOpen, setIsOpen] = useState(true)

  return (
    <section id="work" className="container mx-auto px-6 py-10 bg-muted/30 rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left mb-12 hover:text-primary transition-colors">
          <h2 className="text-sm text-muted-foreground tracking-wide uppercase">Selected Work</h2>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No projects yet. Add your first project from the admin panel.</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

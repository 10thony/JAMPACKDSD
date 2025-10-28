import { useState } from "react"
import { ProjectQuoteCard } from "@/components/project-quote-card"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"

export function ProjectQuotesGrid() {
  const quotes = useQuery(api.queries.getProjectQuotes) || []
  const [isOpen, setIsOpen] = useState(true)

  return (
    <section id="services" className="container mx-auto px-6 py-10 bg-muted/30 rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left mb-12 hover:text-primary transition-colors">
          <h2 className="text-sm text-muted-foreground tracking-wide uppercase">Project Packages</h2>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quotes.map((quote) => (
              <ProjectQuoteCard key={quote._id} quote={quote} />
            ))}
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No project quotes yet. Add your first quote from the admin panel.</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

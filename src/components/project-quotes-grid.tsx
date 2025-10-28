import { useState } from "react"
import { ProjectQuoteCard } from "@/components/project-quote-card"
import { QuoteIntakeModal } from "@/components/quote-intake-modal"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react"
import { useUser } from "@clerk/clerk-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableQuoteCard({ quote, isAuthorized, onClick }: { quote: any; isAuthorized: boolean; onClick?: (quoteId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: quote._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isAuthorized && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-2 rounded bg-background/80 hover:bg-background"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <ProjectQuoteCard quote={quote} onClick={onClick ? () => onClick(quote._id) : undefined} />
    </div>
  )
}

export function ProjectQuotesGrid() {
  const quotes = useQuery(api.queries.getProjectQuotes) || []
  const reorderQuotes = useMutation(api.mutations.reorderProjectQuotes)
  const [isOpen, setIsOpen] = useState(true)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>()
  const { isSignedIn, user } = useUser()
  const isAuthorized = user?.id === "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"

  const handleQuoteClick = (quoteId: string) => {
    setSelectedPackage(quoteId)
    setQuoteModalOpen(true)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    // Only allow reordering if signed in and authorized
    if (!over || active.id === over.id || !isSignedIn || !isAuthorized) {
      return
    }

    const oldIndex = quotes.findIndex((q) => q._id === active.id)
    const newIndex = quotes.findIndex((q) => q._id === over.id)

    const reordered = arrayMove(quotes, oldIndex, newIndex)
    
    await reorderQuotes({ 
      quoteIds: reordered.map(q => q._id) as any 
    })
  }

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
          <p className="text-sm text-muted-foreground mb-6 italic">
            Note: All functionality available in lower tier packages is grandfathered into higher tier packages. Only distinguishing features are listed to avoid redundant information.
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={quotes.map(q => q._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quotes.map((quote) => (
                  <SortableQuoteCard 
                    key={quote._id} 
                    quote={quote} 
                    isAuthorized={isAuthorized}
                    onClick={handleQuoteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {quotes.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No project quotes yet. Add your first quote from the admin panel.</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      <QuoteIntakeModal 
        open={quoteModalOpen} 
        onOpenChange={setQuoteModalOpen}
        selectedPackage={selectedPackage}
      />
    </section>
  )
}

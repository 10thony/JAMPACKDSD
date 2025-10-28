import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { InlineProjectQuoteManager } from "./inline-project-quote-manager"

interface ProjectQuoteCardProps {
  quote: {
    _id: string
    name: string
    cost: string
    features: string[]
    order: number
  }
}

export function ProjectQuoteCard({ quote }: ProjectQuoteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const [spinCount, setSpinCount] = useState(0)

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!cardRef.current) return
    
    // Increment rotation
    rotationRef.current += 360
    
    // Calculate duration - each click makes it faster (min 0.1s)
    const duration = Math.max(0.1, 1 - (spinCount * 0.1))
    
    // Apply the animation
    cardRef.current.style.transition = `transform ${duration}s linear`
    cardRef.current.style.transform = `rotate(${rotationRef.current}deg)`
    
    // Update spin count
    setSpinCount(prev => prev + 1)
  }

  return (
    <Card 
      ref={cardRef}
      onContextMenu={handleRightClick}
      className="group overflow-hidden border-border/50 hover:border-border transition-all duration-300 relative"
    >
      <InlineProjectQuoteManager quote={quote} />
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold mb-2">{quote.name}</h3>
          <div className="text-3xl font-bold text-primary">{quote.cost}</div>
        </div>

        {quote.features && quote.features.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            {quote.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}


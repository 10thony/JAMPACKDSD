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
  onClick?: () => void
}

export function ProjectQuoteCard({ quote, onClick }: ProjectQuoteCardProps) {
  return (
    <Card 
      className="group overflow-hidden border-border/50 hover:border-border transition-all duration-300 relative"
    >
      <InlineProjectQuoteManager quote={quote} />
      
      <div className="p-6 cursor-pointer" onClick={onClick}>
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


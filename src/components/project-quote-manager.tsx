import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"

export function ProjectQuoteManager() {
  const { isSignedIn } = useUser()
  const quotes = useQuery(api.queries.getProjectQuotes) || []
  const addProjectQuote = useMutation(api.mutations.addProjectQuote)
  const deleteProjectQuote = useMutation(api.mutations.deleteProjectQuote)
  
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    features: "",
    order: 0,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isSignedIn) {
      alert("You must be signed in to add project quotes")
      return
    }

    const features = formData.features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean)

    await addProjectQuote({
      name: formData.name,
      cost: formData.cost,
      features,
      order: formData.order,
    })

    setFormData({ 
      name: "", 
      cost: "", 
      features: "", 
      order: 0 
    })
    setIsAdding(false)
  }

  async function handleDelete(id: string) {
    if (!isSignedIn) {
      alert("You must be signed in to delete project quotes")
      return
    }

    if (confirm("Are you sure you want to delete this project quote?")) {
      await deleteProjectQuote({ id: id as any })
    }
  }

  return (
    <div className="space-y-6">
      {!isSignedIn && (
        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <p className="text-sm text-destructive">
            You must be signed in to manage project quotes. Please sign in to add, edit, or delete quotes.
          </p>
        </Card>
      )}
      
      {!isAdding ? (
        <Button 
          onClick={() => setIsAdding(true)} 
          className="w-full md:w-auto"
          disabled={!isSignedIn}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Project Quote
        </Button>
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Quote Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Basic Static Webpage"
                required
              />
            </div>

            <div>
              <Label htmlFor="cost">Price *</Label>
              <Input
                id="cost"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="$200"
                required
              />
            </div>

            <div>
              <Label htmlFor="features">Features (comma-separated) *</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Responsive website, Professional styling, Dark/light mode toggle"
                required
              />
            </div>

            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Add Project Quote</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setFormData({ name: "", cost: "", features: "", order: 0 })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Current Project Quotes</h2>

        {quotes.length === 0 ? (
          <p className="text-muted-foreground">No project quotes yet. Add your first one above!</p>
        ) : (
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Card key={quote._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{quote.name}</h3>
                      <span className="text-lg font-semibold text-primary">{quote.cost}</span>
                    </div>

                    {quote.features && quote.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {quote.features.map((feature, index) => (
                          <span key={index} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(quote._id)}
                    className="text-destructive hover:text-destructive"
                    disabled={!isSignedIn}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


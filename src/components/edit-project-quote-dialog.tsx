import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditProjectQuoteDialogProps {
  quote: {
    _id: string
    name: string
    cost: string
    features: string[]
    order: number
  }
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectQuoteDialog({ quote, isOpen, onOpenChange }: EditProjectQuoteDialogProps) {
  const updateProjectQuote = useMutation(api.mutations.updateProjectQuote)
  const [formData, setFormData] = useState({
    name: quote.name,
    cost: quote.cost,
    features: quote.features.join(", "),
    order: quote.order,
  })

  // Reset form data when quote changes
  useEffect(() => {
    setFormData({
      name: quote.name,
      cost: quote.cost,
      features: quote.features.join(", "),
      order: quote.order,
    })
  }, [quote])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const features = formData.features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean)

    try {
      await updateProjectQuote({
        id: quote._id as Id<"project_quotes">,
        name: formData.name,
        cost: formData.cost,
        features,
        order: formData.order,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update project quote:", error)
      alert("Failed to update project quote. Please try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project Quote</DialogTitle>
          <DialogDescription>
            Update your project quote details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
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
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


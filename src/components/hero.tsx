import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DEFAULT_LABELS = {
  brand: "J.A.M Packed SD",
  heading: "Crafting digital experiences with precision and care",
  description: "Professional web development and design services based in San Diego. I build accessible, pixel-perfect digital experiences for the web, specializing in modern web technologies and thoughtful design systems.",
}

export function Hero() {
  const { user } = useUser()
  const labels = useQuery(api.queries.getHomepageLabels) || {}
  const updateLabel = useMutation(api.mutations.updateHomepageLabel)
  
  const isAuthorized = user?.id === "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"
  
  const brand = labels.brand || DEFAULT_LABELS.brand
  const heading = labels.heading || DEFAULT_LABELS.heading
  const description = labels.description || DEFAULT_LABELS.description

  const [editing, setEditing] = useState<"brand" | "heading" | "description" | null>(null)
  const [tempValues, setTempValues] = useState({ brand: "", heading: "", description: "" })

  const handleStartEdit = (key: "brand" | "heading" | "description") => {
    setTempValues({ ...tempValues, [key]: labels[key] || DEFAULT_LABELS[key] })
    setEditing(key)
  }

  const handleSave = async (key: "brand" | "heading" | "description") => {
    await updateLabel({ key, value: tempValues[key] })
    setEditing(null)
  }

  const handleCancel = () => {
    setEditing(null)
  }

  return (
    <section className="container mx-auto px-6 pt-32 pb-20">
      <div className="max-w-3xl">
        {/* Brand */}
        {editing === "brand" && isAuthorized ? (
          <div className="mb-4">
            <Input
              value={tempValues.brand}
              onChange={(e) => setTempValues({ ...tempValues, brand: e.target.value })}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => handleSave("brand")}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <p className="text-sm text-muted-foreground mb-4 tracking-wide uppercase">{brand}</p>
            {isAuthorized && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleStartEdit("brand")}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Heading */}
        {editing === "heading" && isAuthorized ? (
          <div className="mb-6">
            <Textarea
              value={tempValues.heading}
              onChange={(e) => setTempValues({ ...tempValues, heading: e.target.value })}
              className="text-5xl md:text-7xl font-light min-h-[120px]"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => handleSave("heading")}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 text-balance">
              {heading}
            </h1>
            {isAuthorized && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleStartEdit("heading")}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Description */}
        {editing === "description" && isAuthorized ? (
          <div>
            <Textarea
              value={tempValues.description}
              onChange={(e) => setTempValues({ ...tempValues, description: e.target.value })}
              className="text-lg min-h-[120px]"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => handleSave("description")}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
            {isAuthorized && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleStartEdit("description")}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

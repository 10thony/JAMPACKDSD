import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, X, Edit2 } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import type { Id } from "../../convex/_generated/dataModel"
import { EditProjectDialog } from "./edit-project-dialog"

interface InlineProjectManagerProps {
  project: {
    _id: string
    title: string
    description?: string
    imageUrl?: string
    technologies?: string[]
    githubUrl?: string
    liveUrl?: string
    featured: boolean
    order: number
  }
  onDeleted?: () => void
}

export function InlineProjectManager({ project, onDeleted }: InlineProjectManagerProps) {
  const { user } = useUser()
  const deleteProject = useMutation(api.mutations.deleteProject)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // Check if current user is authorized
  const isAuthorized = user?.id === "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"

  if (!isAuthorized) {
    return null
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) {
      return
    }

    try {
      await deleteProject({ id: project._id as Id<"projects"> })
      if (onDeleted) {
        onDeleted()
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
      alert("Failed to delete project. Please try again.")
    }
  }

  if (!showDelete) {
    return (
      <>
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowEdit(true)
            }}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-sm"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowDelete(true)
            }}
            className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <EditProjectDialog 
          project={project} 
          isOpen={showEdit} 
          onOpenChange={setShowEdit}
        />
      </>
    )
  }

  return (
    <div className="absolute inset-0 bg-destructive/95 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-destructive-foreground">Delete Project</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDelete(false)}
            className="text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted mb-4">
          Are you sure you want to delete "{project.title}"? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1"
          >
            Delete Project
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDelete(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}


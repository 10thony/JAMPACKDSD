import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { ImageUploader } from "./image-uploader"

interface EditProjectDialogProps {
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
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectDialog({ project, isOpen, onOpenChange }: EditProjectDialogProps) {
  const updateProject = useMutation(api.mutations.updateProject)
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    imageUrl: project.imageUrl || "",
    technologies: project.technologies?.join(", ") || "",
    githubUrl: project.githubUrl || "",
    liveUrl: project.liveUrl || "",
    featured: project.featured,
    order: project.order,
  })

  // Reset form data when project changes
  useEffect(() => {
    setFormData({
      title: project.title,
      description: project.description || "",
      imageUrl: project.imageUrl || "",
      technologies: project.technologies?.join(", ") || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      featured: project.featured,
      order: project.order,
    })
  }, [project])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const technologies = formData.technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean)

    try {
      await updateProject({
        id: project._id as Id<"projects">,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        technologies,
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        featured: formData.featured,
        order: formData.order,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update project:", error)
      alert("Failed to update project. Please try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My Awesome Project"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                label="Preview Image"
              />
            </div>

            <div>
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div>
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of your project"
                rows={3}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="technologies">Technologies (comma-separated)</Label>
              <Input
                id="technologies"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="React, TypeScript, Next.js"
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

            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Project
              </Label>
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


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUploader } from "./image-uploader"

export function FloatingAddProject() {
  const { user } = useUser()
  const addProject = useMutation(api.mutations.addProject)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    featured: false,
    order: 0,
  })

  // Check if current user is authorized
  const isAuthorized = user?.id === "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"

  if (!isAuthorized) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const technologies = formData.technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean)

    try {
      await addProject({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        technologies,
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        featured: formData.featured,
        order: formData.order,
      })

      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        technologies: "",
        githubUrl: "",
        liveUrl: "",
        featured: false,
        order: 0,
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to add project:", error)
      alert("Failed to add project. Please try again.")
    }
  }

  return (
    <>
      <Button
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Project</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your portfolio
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
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}


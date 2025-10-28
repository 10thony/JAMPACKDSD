import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, ExternalLink, Edit } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"

export function ProjectManager() {
  const { isSignedIn } = useUser()
  const projects = useQuery(api.queries.getProjects) || []
  const addProject = useMutation(api.mutations.addProject)
  const updateProject = useMutation(api.mutations.updateProject)
  const deleteProject = useMutation(api.mutations.deleteProject)
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    featured: false,
    order: 0,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isSignedIn) {
      alert("You must be signed in to add projects")
      return
    }

    const technologies = formData.technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean)

    if (editingId) {
      // Update existing project
      await updateProject({
        id: editingId as any,
        title: formData.title,
        description: formData.description,
        technologies,
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        featured: formData.featured,
        order: formData.order,
      })
      setEditingId(null)
    } else {
      // Add new project
      await addProject({
        title: formData.title,
        description: formData.description,
        technologies,
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        featured: formData.featured,
        order: formData.order,
      })
    }

    setFormData({ 
      title: "", 
      description: "", 
      technologies: "", 
      githubUrl: "", 
      liveUrl: "", 
      featured: false, 
      order: 0 
    })
    setIsAdding(false)
  }

  function handleEdit(project: any) {
    setFormData({
      title: project.title || "",
      description: project.description || "",
      technologies: project.technologies?.join(", ") || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      featured: project.featured || false,
      order: project.order || 0,
    })
    setEditingId(project._id)
    setIsAdding(true)
  }

  async function handleDelete(id: string) {
    if (!isSignedIn) {
      alert("You must be signed in to delete projects")
      return
    }

    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject({ id: id as any })
    }
  }

  return (
    <div className="space-y-6">
      {!isSignedIn && (
        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <p className="text-sm text-destructive">
            You must be signed in to manage projects. Please sign in to add, edit, or delete projects.
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
          Add New Project
        </Button>
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My Awesome Project"
                required
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of your project"
                rows={3}
              />
            </div>

            <div>
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <Label htmlFor="featured" className="font-normal">Featured Project</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update Project" : "Add Project"}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setEditingId(null)
                  setFormData({ title: "", description: "", technologies: "", githubUrl: "", liveUrl: "", featured: false, order: 0 })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Current Projects</h2>

        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects yet. Add your first one above!</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{project.title}</h3>
                      {project.featured && (
                        <span className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground">
                          Featured
                        </span>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {project.description && <p className="text-sm text-muted-foreground mb-2">{project.description}</p>}

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                      disabled={!isSignedIn}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project._id)}
                      className="text-destructive hover:text-destructive"
                      disabled={!isSignedIn}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

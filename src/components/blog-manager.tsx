import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { useUser } from "@clerk/clerk-react"
import { AUTHORIZED_USER_ID } from "@/lib/authorized-user"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Edit, Upload, Globe, EyeOff } from "lucide-react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { parseBlogMarkdownFile } from "@/lib/parse-blog-markdown"

type EditorMode = "idle" | "new" | { edit: Id<"blog_posts"> }

export function BlogManager() {
  const { isSignedIn, user, isLoaded } = useUser()
  const isAuthorized = user?.id === AUTHORIZED_USER_ID
  const posts = useQuery(
    api.blog.listAllPostsForAdmin,
    isLoaded && isSignedIn && isAuthorized ? {} : "skip"
  )
  const [mode, setMode] = useState<EditorMode>("idle")
  const existing = useQuery(
    api.blog.getPostForAdmin,
    typeof mode === "object" && "edit" in mode
      ? { id: mode.edit }
      : "skip"
  )

  const createPost = useMutation(api.blog.createPost)
  const importPost = useMutation(api.blog.importPostFromMarkdown)
  const updatePost = useMutation(api.blog.updatePost)
  const deletePost = useMutation(api.blog.deletePost)
  const publishPost = useMutation(api.blog.publishPost)
  const unpublishPost = useMutation(api.blog.unpublishPost)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [bodyMarkdown, setBodyMarkdown] = useState("")
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === "new") {
      setTitle("")
      setSlug("")
      setExcerpt("")
      setBodyMarkdown("")
      return
    }
    if (typeof mode === "object" && "edit" in mode && existing) {
      setTitle(existing.title)
      setSlug(existing.slug)
      setExcerpt(existing.excerpt ?? "")
      setBodyMarkdown(existing.bodyMarkdown)
    }
  }, [mode, existing])

  if (!isLoaded) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Card>
    )
  }

  if (!isSignedIn) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Sign in to manage the blog.
        </p>
      </Card>
    )
  }

  if (!isAuthorized) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          You do not have access to blog management.
        </p>
      </Card>
    )
  }

  if (posts === undefined) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Card>
    )
  }

  const editingId =
    typeof mode === "object" && "edit" in mode ? mode.edit : null
  const formLoading =
    editingId !== null && existing === undefined

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (mode === "new") {
        await createPost({
          title,
          slug,
          bodyMarkdown,
          excerpt: excerpt || undefined,
          status: "draft",
        })
        setMode("idle")
      } else if (editingId) {
        await updatePost({
          id: editingId,
          title,
          slug,
          bodyMarkdown,
          excerpt: excerpt || undefined,
        })
        setMode("idle")
      }
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: Id<"blog_posts">) {
    if (!confirm("Delete this post and all its comments?")) return
    try {
      await deletePost({ id })
      if (editingId === id) setMode("idle")
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Delete failed")
    }
  }

  async function handlePublish(id: Id<"blog_posts">) {
    try {
      await publishPost({ id })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Publish failed")
    }
  }

  async function handleUnpublish(id: Id<"blog_posts">) {
    try {
      await unpublishPost({ id })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Unpublish failed")
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const text = await file.text()
    try {
      const parsed = parseBlogMarkdownFile(text, file.name)
      const id = await importPost({
        title: parsed.title,
        slug: parsed.slug,
        bodyMarkdown: parsed.bodyMarkdown,
        excerpt: parsed.excerpt,
      })
      alert(`Imported as draft. You can edit it below.`)
      setMode({ edit: id })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Import failed")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setMode("new")}
          disabled={mode !== "idle"}
        >
          <Plus className="h-4 w-4 mr-2" />
          New draft
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={onImportFile}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Markdown
        </Button>
      </div>

      {(mode === "new" || editingId) && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {mode === "new" ? "New post" : "Edit post"}
          </h3>
          {formLoading ? (
            <p className="text-sm text-muted-foreground">Loading post…</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="blog-title">Title</Label>
                  <Input
                    id="blog-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-slug">Slug (URL)</Label>
                  <Input
                    id="blog-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-excerpt">Excerpt (optional)</Label>
                <Input
                  id="blog-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-body">Markdown body</Label>
                <Textarea
                  id="blog-body"
                  value={bodyMarkdown}
                  onChange={(e) => setBodyMarkdown(e.target.value)}
                  rows={16}
                  className="font-mono text-sm resize-y"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode("idle")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          All posts
        </h3>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post._id}>
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{post.title}</span>
                      <span
                        className={
                          post.status === "published"
                            ? "text-xs px-2 py-0.5 rounded bg-primary/15 text-primary"
                            : "text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        }
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                      /blog/{post.slug}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {format(post.updatedAt, "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {post.status === "published" ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/blog/${post.slug}`} target="_blank">
                            View
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnpublish(post._id)}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Unpublish
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(post._id)}
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setMode({ edit: post._id })}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

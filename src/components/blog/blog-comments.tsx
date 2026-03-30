import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "convex/react"
import { useUser, SignInButton } from "@clerk/clerk-react"
import { AUTHORIZED_USER_ID } from "@/lib/authorized-user"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { Trash2 } from "lucide-react"

type Comment = {
  _id: Id<"blog_comments">
  authorUserId: string
  authorName: string
  body: string
  createdAt: number
}

export function BlogComments({
  postId,
  comments,
}: {
  postId: Id<"blog_posts">
  comments: Comment[] | undefined
}) {
  const { isSignedIn, user, isLoaded } = useUser()
  const isAdmin = isLoaded && user?.id === AUTHORIZED_USER_ID
  const addComment = useMutation(api.blog.addComment)
  const deleteComment = useMutation(api.blog.deleteComment)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await addComment({ postId, body })
      setBody("")
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Could not post comment")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: Id<"blog_comments">) {
    if (!confirm("Delete this comment?")) return
    try {
      await deleteComment({ id })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Could not delete comment")
    }
  }

  const list = comments ?? []
  const commentsLoading = comments === undefined

  return (
    <section className="mt-16 border-t border-border/50 pt-10">
      <h2 className="text-lg font-light tracking-tight text-foreground mb-6">
        Comments
      </h2>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="mb-10 space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment…"
            rows={4}
            className="resize-y bg-background"
            maxLength={5000}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              {body.length}/5000
            </span>
            <Button type="submit" disabled={submitting || !body.trim()}>
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground mb-10">
          <SignInButton mode="modal">
            <button
              type="button"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Sign in
            </button>
          </SignInButton>
          {" · "}
          <Link
            to="/sign-in"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Sign in page
          </Link>
          {" "}to join the conversation.
        </p>
      )}

      {commentsLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-6">
          {list.map((c) => {
            const canDelete =
              isAdmin || (user?.id && user.id === c.authorUserId)
            return (
              <li
                key={c._id}
                className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {c.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(c.createdAt, "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(c._id)}
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {c.body}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

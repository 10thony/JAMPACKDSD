import { Link } from "react-router-dom"
import { useQuery } from "convex/react"
import { useUser } from "@clerk/clerk-react"
import { format } from "date-fns"
import { Navigation } from "@/components/navigation"
import { api } from "../../convex/_generated/api"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AUTHORIZED_USER_ID } from "@/lib/authorized-user"

export default function BlogIndex() {
  const posts = useQuery(api.blog.listPublishedPosts)
  const { user, isLoaded } = useUser()
  const canManageBlog = isLoaded && user?.id === AUTHORIZED_USER_ID

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-3xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              Blog
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Notes and updates from J.A.M Packed SD.
            </p>
          </div>
          {canManageBlog && (
            <Button asChild className="shrink-0 w-full sm:w-auto">
              <Link to="/admin#blog-admin">
                <Plus className="h-4 w-4 mr-2" />
                New post
              </Link>
            </Button>
          )}
        </div>

        {posts === undefined ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              No posts published yet.
            </p>
            {canManageBlog && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create a draft in{" "}
                <Link
                  to="/admin#blog-admin"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Admin → Blog
                </Link>
                , then publish when it is ready.
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post._id}>
                <Link to={`/blog/${post.slug}`}>
                  <Card className="p-6 border-border/50 hover:border-border transition-colors">
                    <h2 className="text-xl font-light text-foreground tracking-tight">
                      {post.title}
                    </h2>
                    {post.publishedAt != null && (
                      <time
                        dateTime={new Date(post.publishedAt).toISOString()}
                        className="text-xs text-muted-foreground mt-2 block"
                      >
                        {format(post.publishedAt, "MMMM d, yyyy")}
                      </time>
                    )}
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

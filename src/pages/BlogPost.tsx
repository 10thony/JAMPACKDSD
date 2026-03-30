import { Link, useParams } from "react-router-dom"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import { Navigation } from "@/components/navigation"
import { BlogMarkdown } from "@/components/blog/blog-markdown"
import { BlogComments } from "@/components/blog/blog-comments"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = useQuery(
    api.blog.getPublishedPostBySlug,
    slug ? { slug } : "skip"
  )
  const comments = useQuery(
    api.blog.listCommentsByPost,
    post?._id ? { postId: post._id } : "skip"
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-3xl">
        <Link to="/blog">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All posts
          </Button>
        </Link>

        {post === undefined ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : post === null ? (
          <div>
            <h1 className="text-2xl font-light text-foreground">Not found</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              This post does not exist or is not published.
            </p>
            <Link to="/blog" className="inline-block mt-6">
              <Button variant="outline" size="sm">
                Back to blog
              </Button>
            </Link>
          </div>
        ) : (
          <article>
            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                {post.title}
              </h1>
              {post.publishedAt != null && (
                <time
                  dateTime={new Date(post.publishedAt).toISOString()}
                  className="text-sm text-muted-foreground mt-3 block"
                >
                  {format(post.publishedAt, "MMMM d, yyyy")}
                </time>
              )}
            </header>
            <BlogMarkdown markdown={post.bodyMarkdown} />
            <BlogComments postId={post._id} comments={comments} />
          </article>
        )}
      </main>
    </div>
  )
}

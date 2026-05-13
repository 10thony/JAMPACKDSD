import { useEffect } from "react"
import { BlogManager } from "@/components/blog-manager"
import { ProjectManager } from "@/components/project-manager"
import { ProjectQuoteManager } from "@/components/project-quote-manager"
import { QuoteSubmissionsManager } from "@/components/quote-submissions-manager"
import { SnakeGameSettings } from "@/components/snake-game-settings"
import { LeadershipSummaryLinkSettings } from "@/components/leadership-summary-link-settings"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserButton } from "@clerk/clerk-react"

export default function Admin() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash !== "#blog-admin") return
    requestAnimationFrame(() => {
      document.getElementById("blog-admin")?.scrollIntoView({ behavior: "smooth" })
    })
  }, [location.hash, location.pathname])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to J.A.M Packed SD
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Project Manager</h1>
          <p className="text-muted-foreground">Add and manage your portfolio projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6" id="blog-admin">
              <h2 className="text-xl font-light tracking-tight mb-2">Blog</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create posts, import Markdown drafts, publish when ready.
              </p>
              <BlogManager />
            </div>
          </div>
          <div className="lg:col-span-2">
            <QuoteSubmissionsManager />
          </div>
          <ProjectManager />
          <ProjectQuoteManager />
          <div className="lg:col-span-2">
            <LeadershipSummaryLinkSettings />
          </div>
          <SnakeGameSettings />
        </div>
      </div>
    </div>
  )
}

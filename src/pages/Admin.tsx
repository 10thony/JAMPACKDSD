import { ProjectManager } from "@/components/project-manager"
import { ProjectQuoteManager } from "@/components/project-quote-manager"
import { QuoteSubmissionsManager } from "@/components/quote-submissions-manager"
import { SnakeGameSettings } from "@/components/snake-game-settings"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserButton } from "@clerk/clerk-react"

export default function Admin() {
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
            <QuoteSubmissionsManager />
          </div>
          <ProjectManager />
          <ProjectQuoteManager />
          <SnakeGameSettings />
        </div>
      </div>
    </div>
  )
}

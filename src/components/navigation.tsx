import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Settings, LogIn } from "lucide-react"
import { UserButton, SignInButton, useUser } from "@clerk/clerk-react"
import { QuoteIntakeModal } from "./quote-intake-modal"
import { AboutModal } from "./about-modal"

const AUTHORIZED_USER_ID = "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"

export function Navigation() {
  const { isSignedIn, user } = useUser()
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const isAuthorized = user?.id === AUTHORIZED_USER_ID

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-base font-medium tracking-tight md:text-lg">
            J.A.M Packed SD
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <a href="#work" className="text-xs text-muted-foreground transition-colors hover:text-foreground md:text-sm">
              Work
            </a>
            <Link
              to="/blog"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground md:text-sm"
            >
              Blog
            </Link>
            <button 
              onClick={() => setAboutModalOpen(true)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground md:text-sm"
            >
              About
            </button>
            <button 
              onClick={() => setQuoteModalOpen(true)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground md:text-sm"
            >
              Contact
            </button>
            
            {isSignedIn ? (
              <>
                {isAuthorized && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Admin Settings</span>
                    </Button>
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="h-8 px-2 md:px-3">
                  <LogIn className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sign In</span>
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
      
      <QuoteIntakeModal 
        open={quoteModalOpen} 
        onOpenChange={setQuoteModalOpen} 
      />
      
      <AboutModal 
        open={aboutModalOpen} 
        onOpenChange={setAboutModalOpen} 
      />
    </nav>
  )
}

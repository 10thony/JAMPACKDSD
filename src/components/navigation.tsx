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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-medium tracking-tight">
            J.A.M Packed SD
          </Link>

          <div className="flex items-center gap-6">
            <a href="#work" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Work
            </a>
            <button 
              onClick={() => setAboutModalOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => setQuoteModalOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
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

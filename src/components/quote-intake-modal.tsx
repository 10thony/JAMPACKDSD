import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface QuoteIntakeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPackage?: string // ID of the pre-selected project package
}

export function QuoteIntakeModal({ open, onOpenChange, selectedPackage }: QuoteIntakeModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [projectPackage, setProjectPackage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const submitQuote = useMutation(api.mutations.addQuoteSubmission)
  const quotes = useQuery(api.queries.getProjectQuotes) || []
  const { toast } = useToast()

  // Update projectPackage when selectedPackage prop changes or modal opens
  useEffect(() => {
    if (selectedPackage) {
      setProjectPackage(selectedPackage)
    }
  }, [selectedPackage, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !serviceDescription.trim()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await submitQuote({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        serviceDescription: serviceDescription.trim(),
        projectPackage: projectPackage || undefined,
      })
      
      toast({
        title: "Thank you!",
        description: "Your quote request has been submitted. We'll get back to you soon!",
      })
      
      // Reset form
      setName("")
      setEmail("")
      setPhone("")
      setServiceDescription("")
      setProjectPackage("")
      
      // Close modal
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting quote:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Get a Quote</DialogTitle>
          <DialogDescription>
            Tell us about your project and we'll get back to you with a customized quote.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="projectPackage">Project Package (Optional)</Label>
              {projectPackage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setProjectPackage("")}
                  disabled={isSubmitting}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <Select 
              value={projectPackage || undefined} 
              onValueChange={setProjectPackage}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {quotes.map((quote) => (
                  <SelectItem key={quote._id} value={quote._id}>
                    {quote.name} - {quote.cost}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service">
              Service Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="service"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Tell us about the type of service you're looking for..."
              required
              rows={5}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


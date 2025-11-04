import { Dialog, DialogContent } from "@/components/ui/dialog"
import { About } from "./about"

interface AboutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto p-6">
        <About />
      </DialogContent>
    </Dialog>
  )
}


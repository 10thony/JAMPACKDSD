import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Mail, Phone, FileText, Package } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export function QuoteSubmissionsManager() {
  const submissions = useQuery(api.queries.getQuoteSubmissions) || []
  const quotes = useQuery(api.queries.getProjectQuotes) || []
  const markRead = useMutation(api.mutations.markQuoteSubmissionRead)
  const deleteSubmission = useMutation(api.mutations.deleteQuoteSubmission)
  const { toast } = useToast()

  const handleMarkRead = async (id: string) => {
    try {
      await markRead({ id: id as any })
      toast({
        title: "Marked as read",
      })
    } catch (error) {
      console.error("Error marking submission as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark submission as read",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return
    }

    try {
      await deleteSubmission({ id: id as any })
      toast({
        title: "Deleted",
        description: "Submission deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting submission:", error)
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      })
    }
  }

  const unreadCount = submissions.filter((s) => !s.read).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Quote Submissions
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              View and manage incoming quote requests from potential clients
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quote submissions yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className={`border rounded-lg p-4 ${
                    !submission.read ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{submission.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(submission.createdAt), "PPpp")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!submission.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkRead(submission._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(submission._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {submission.email}
                      </a>
                    </div>

                    {submission.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <a
                          href={`tel:${submission.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {submission.phone}
                        </a>
                      </div>
                    )}

                    {submission.projectPackage && (
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Package: </span>
                          {quotes.find(q => q._id === submission.projectPackage)?.name || "Unknown Package"}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 mt-3">
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {submission.serviceDescription}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}


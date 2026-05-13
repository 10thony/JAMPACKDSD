import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ENGINEERING_REPORT_SHARE_TOKEN } from '@/lib/engineering-report-share-token'
import { Copy, ExternalLink } from 'lucide-react'

export function LeadershipSummaryLinkSettings() {
  const { toast } = useToast()
  const url = useMemo(() => {
    const path = `/leadership-summary/${ENGINEERING_REPORT_SHARE_TOKEN}`
    if (typeof window === 'undefined') return path
    return `${window.location.origin}${path}`
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Link copied' })
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Select the URL and copy manually.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium mb-2">Leadership summary (private link)</h2>
          <p className="text-sm text-muted-foreground">
            Standalone mid-year report page. Only people with this URL can open it; it does not
            appear in the site navigation.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leadership-summary-url">Share URL</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="leadership-summary-url"
              readOnly
              value={url}
              className="font-mono text-xs sm:text-sm"
            />
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="secondary" onClick={copy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

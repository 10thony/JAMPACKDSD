import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Link2 } from "lucide-react"
import { uploadToUploadThing } from "@/lib/uploadthing"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  required?: boolean
}

export function ImageUploader({ value, onChange, label = "Image", required = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value || "")
  const [urlInput, setUrlInput] = useState(value || "")
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file")
      return
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("File size must be less than 4MB")
      return
    }

    setIsUploading(true)
    setUploadError("")

    try {
      const url = await uploadToUploadThing(file)
      console.log("Upload successful! Image URL:", url)
      setPreviewUrl(url)
      onChange(url)
    } catch (error: any) {
      console.error("Upload error:", error)
      setUploadError(error.message || "Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleUrlSubmit() {
    if (urlInput) {
      setPreviewUrl(urlInput)
      onChange(urlInput)
    }
  }

  function handleRemove() {
    setPreviewUrl("")
    setUrlInput("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Use URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="flex flex-col gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
            {isUploading && (
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            )}
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF, WebP (max 4MB)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleUrlSubmit()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              disabled={!urlInput}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {previewUrl && (
        <div className="relative mt-4 rounded-lg border border-border overflow-hidden bg-muted">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error("Image failed to load:", previewUrl)
              setUploadError("Failed to load image preview. The URL may be invalid.")
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", previewUrl)
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}


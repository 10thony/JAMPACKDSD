import matter from "gray-matter"

function filenameToSlug(name: string): string {
  const base = name.replace(/\.md$/i, "").trim().toLowerCase()
  const slug = base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || "untitled"
}

function firstHeading(markdown: string): string | undefined {
  const m = markdown.match(/^#\s+(.+)$/m)
  return m?.[1]?.trim()
}

export function parseBlogMarkdownFile(text: string, filename: string) {
  const { data, content } = matter(text)
  const body = content.trim()
  const slugFromFile = filenameToSlug(filename)
  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    firstHeading(body) ||
    slugFromFile.replace(/-/g, " ")
  const slug =
    (typeof data.slug === "string" && data.slug.trim().toLowerCase()) ||
    slugFromFile
  const excerpt =
    typeof data.excerpt === "string" ? data.excerpt.trim() : undefined
  return { title, slug, bodyMarkdown: body, excerpt }
}

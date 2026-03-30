import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

const contentClassName =
  "max-w-none space-y-6 text-[15px] leading-relaxed text-muted-foreground " +
  "[&_h1]:text-3xl [&_h1]:font-light [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mt-10 [&_h1]:mb-4 " +
  "[&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 " +
  "[&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 " +
  "[&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline underline-offset-4 hover:[&_a]:text-primary/80 " +
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-foreground " +
  "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/50 [&_pre]:bg-muted/50 [&_pre]:p-4 " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic " +
  "[&_hr]:border-border [&_table]:w-full [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left " +
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2"

export function BlogMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className={contentClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

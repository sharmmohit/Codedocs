import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-full bg-slate-900 text-white p-4 rounded-xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

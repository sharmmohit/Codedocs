import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { vsDark } from 'prism-react-renderer/themes';

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="p-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                language={match[1]}
                style={vsDark}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-700 rounded px-1.5 py-0.5 text-sm">
                {children}
              </code>
            );
          },
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-4 leading-relaxed" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-300 my-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-600 px-4 py-2 text-left bg-gray-700" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-600 px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'

export default function DocsPage() {
  const searchParams = useSearchParams()
  const repo = searchParams.get('repo')
  const [markdown, setMarkdown] = useState<string>("Loading...")

  useEffect(() => {
    if (repo) {
      // Simulate backend call
      fetch(`http://localhost:5000/generate-docs?repo=${repo}`)
        .then(res => res.json())
        .then(data => setMarkdown(data.content || "Failed to load docs"))
    }
  }, [repo])

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">📚 Generated Documentation</h1>
      <MarkdownViewer content={markdown} />
    </main>
  )
}

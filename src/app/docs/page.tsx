'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MarkdownViewer } from '@/components/ui/markdown-viewer';
import Link from 'next/link';

export default function DocsPage() {
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!repo) {
      setError('No repository specified');
      setIsLoading(false);
      return;
    }

    const fetchDocs = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch(`/api/generate-docs?repo=${repo}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate documentation');
        }
        
        setMarkdown(data.content);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocs();
  }, [repo]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold">
            Documentation for <span className="text-blue-400">{repo}</span>
          </h1>
          <div></div> {/* Spacer */}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Generating documentation...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a minute</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            <p>{error}</p>
            <p className="mt-4 text-sm text-red-300">
              Please check the repository URL and try again
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <MarkdownViewer content={markdown} />
          </div>
        )}
      </div>
    </div>
  );
}
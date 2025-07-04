import { RepoInput } from '@/components/ui/RepoInput'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white">
      <div className="max-w-xl p-8 bg-white/10 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          AI GitHub Docs Generator
        </h1>
        <RepoInput />
      </div>
    </main>
  )
}

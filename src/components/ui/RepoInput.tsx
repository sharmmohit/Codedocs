'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function RepoInput() {
  const [repoUrl, setRepoUrl] = useState("")
  const router = useRouter()

  const handleSubmit = () => {
    if (!repoUrl.startsWith("https://github.com/")) {
      alert("Enter a valid GitHub repo URL")
      return
    }
    const repo = repoUrl.replace("https://github.com/", "")
    router.push(`/docs?repo=${encodeURIComponent(repo)}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Enter GitHub Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />
      <Button onClick={handleSubmit}>Generate Docs</Button>
    </div>
  )
}

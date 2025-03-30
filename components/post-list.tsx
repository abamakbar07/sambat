"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, ExternalLink } from "lucide-react"
import ReportDialog from "@/components/report-dialog"

type Post = {
  id: string
  message: string
  trackId: string
  trackName: string
  artistName: string
  albumArt: string
  createdAt: string
}

export default function PostList({ posts }: { posts: Post[] }) {
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground mt-1">Be the first to share a thought!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={post.albumArt || "/placeholder.svg?height=64&width=64"}
                    alt={`${post.trackName} album art`}
                    width={64}
                    height={64}
                    className="rounded-md"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate">{post.trackName}</h3>
                      <p className="text-sm text-muted-foreground">{post.artistName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                  </div>

                  <p className="mt-2 break-words">{post.message}</p>

                  <div className="flex justify-between items-center mt-4">
                    <a
                      href={`https://open.spotify.com/track/${post.trackId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Listen on Spotify
                    </a>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReportingPostId(post.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <ReportDialog
        postId={reportingPostId}
        open={!!reportingPostId}
        onOpenChange={(open) => {
          if (!open) setReportingPostId(null)
        }}
      />
    </div>
  )
}


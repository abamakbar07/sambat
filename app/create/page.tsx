"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createPost } from "@/app/actions"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import SongSearch from "@/components/song-search"
import SelectedSong from "@/components/selected-song"

export default function CreatePost() {
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to share.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTrack) {
      toast({
        title: "Song required",
        description: "Please select a song to accompany your message.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("message", message)
    formData.append("trackId", selectedTrack.id)

    const result = await createPost(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Post created!",
        description: "Your anonymous post has been shared.",
      })
      router.push("/")
    } else {
      toast({
        title: "Error",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-2xl px-4 py-8 mx-auto">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create a new post</CardTitle>
          <CardDescription>Share your thoughts anonymously with a song that matches your mood</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                maxLength={280}
              />
              <div className="text-xs text-muted-foreground text-right">{message.length}/280</div>
            </div>

            {selectedTrack ? (
              <div className="space-y-2">
                <Label>Selected song</Label>
                <SelectedSong track={selectedTrack} onRemove={() => setSelectedTrack(null)} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="song">Find a song</Label>
                <SongSearch onSelect={setSelectedTrack} />
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !message.trim() || !selectedTrack}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>Share anonymously</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


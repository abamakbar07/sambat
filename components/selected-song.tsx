"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function SelectedSong({
  track,
  onRemove,
}: {
  track: any
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
      <div className="flex-shrink-0">
        <Image
          src={track.album.images[1]?.url || "/placeholder.svg?height=64&width=64"}
          alt={`${track.name} album art`}
          width={64}
          height={64}
          className="rounded"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{track.name}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artists.map((a: any) => a.name).join(", ")}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0"
        aria-label="Remove selected song"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}


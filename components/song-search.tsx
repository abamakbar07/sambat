"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { useDebounce } from "@/hooks/use-debounce"

export default function SongSearch({ onSelect }: { onSelect: (track: any) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 500)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Search for tracks when query changes
  useEffect(() => {
    async function searchTracks() {
      if (!debouncedQuery.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        const data = await response.json()

        setResults(data.tracks?.items || [])
        setIsOpen(true)
      } catch (error) {
        console.error("Error searching tracks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    searchTracks()
  }, [debouncedQuery])

  function handleSelect(track: any) {
    onSelect(track)
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          placeholder="Search for a song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {results.map((track) => (
            <Button
              key={track.id}
              variant="ghost"
              className="w-full justify-start p-2 h-auto"
              onClick={() => handleSelect(track)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  <Image
                    src={track.album.images[2]?.url || "/placeholder.svg?height=40&width=40"}
                    alt={`${track.name} album art`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.map((a: any) => a.name).join(", ")}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}


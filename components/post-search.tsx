"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface PostSearchProps {
  onResults: (posts: any[]) => void
  onLoadingChange: (isLoading: boolean) => void
  initialQuery?: string
}

export default function PostSearch({
  onResults,
  onLoadingChange,
  initialQuery = "",
}: PostSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false) // Internal loading state
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    // Update query from prop if it changes
    if (initialQuery) {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  // Effect to call onLoadingChange prop when internal isLoading state changes
  useEffect(() => {
    onLoadingChange(isLoading)
  }, [isLoading, onLoadingChange])

  // Effect to fetch posts when debouncedQuery changes
  useEffect(() => {
    async function searchPosts() {
      if (!debouncedQuery.trim()) {
        onResults([])
        setIsLoading(false) // Ensure loading is false if query is cleared
        return
      }

      setIsLoading(true) // Set loading true before fetch
      try {
        const response = await fetch(
          `/api/search?type=post&q=${encodeURIComponent(debouncedQuery)}`
        )
        if (!response.ok) {
          console.error("Error fetching posts:", response.status, response.statusText)
          onResults([])
        } else {
          const data = await response.json()
          // Ensure data is an array, default to empty array if not
          onResults(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error searching posts:", error)
        onResults([])
      } finally {
        setIsLoading(false) // Set loading false after fetch operation (success or error)
      }
    }

    searchPosts()
  }, [debouncedQuery, onResults]) // Removed setIsLoading from dependency array of this useEffect

  return (
    <div className="relative">
      <Input
        placeholder="Search for posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-10" // Padding right for the icon
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {isLoading ? ( // Use internal isLoading state for rendering the icon
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}

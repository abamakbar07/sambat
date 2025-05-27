import { Suspense } from "react" // Suspense is kept as it's used directly in Home
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Input removed as it's now in PostSearchAndFeedClient
import { PlusCircle } from "lucide-react"
import prisma from "@/lib/db"
import PostList from "@/components/post-list"
import { formatRelativeTime } from "@/lib/utils"
// useDebounce, useRouter, usePathname, useSearchParams, useState, useEffect removed
import type { Prisma } from "@prisma/client"
import PostSearchAndFeedClient from "@/components/post-search-and-feed" // Import the new component

// Fetch posts with pagination and search (remains unchanged)
async function getPosts(page = 1, limit = 10, searchQuery?: string) {
  const skip = (page - 1) * limit

  const whereClause: Prisma.PostWhereInput = { status: "ACTIVE" }
  if (searchQuery && searchQuery.trim() !== "") {
    whereClause.AND = [
      {
        OR: [
          { message: { contains: searchQuery, mode: 'insensitive' } },
          { trackName: { contains: searchQuery, mode: 'insensitive' } },
          { artistName: { contains: searchQuery, mode: 'insensitive' } },
          { authorName: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    ]
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  const totalPosts = await prisma.post.count({ where: whereClause })

  return {
    posts: posts.map((post) => ({
      ...post,
      createdAt: formatRelativeTime(post.createdAt),
      albumArt: post.albumArt ?? "",
      authorName: post.authorName ?? undefined,
    })),
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
  }
}

// PostFeed component remains in this file as it's a server component
async function PostFeed({ searchParams }: { searchParams: { page?: string; query?: string } }) {
  const page = Number(searchParams?.page) || 1
  const query = searchParams?.query || ""
  const { posts, totalPages, currentPage } = await getPosts(page, 10, query)

  const createPageURL = (newPage: number) => {
    const params = new URLSearchParams(searchParams ? new URLSearchParams(searchParams as any).toString() : "")
    params.set("page", String(newPage))
    if (query) {
      params.set("query", query)
    } else {
      params.delete("query")
    }
    return `/?${params.toString()}`
  }

  return (
    <>
      <PostList posts={posts} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Button variant="outline" asChild>
              <Link href={createPageURL(currentPage - 1)}>Previous</Link>
            </Button>
          )}

          {currentPage < totalPages && (
            <Button variant="outline" asChild>
              <Link href={createPageURL(currentPage + 1)}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </>
  )
}

// PostListSkeleton component remains in this file
function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-muted rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Home component now uses the imported PostSearchAndFeedClient
export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; query?: string }
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Melodic Whispers</h1>
            <p className="text-muted-foreground mt-1">Share your thoughts anonymously with the perfect soundtrack</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/create">
              <PlusCircle className="h-5 w-5" />
              <span>New Post</span>
            </Link>
          </Button>
        </header>

        <PostSearchAndFeedClient searchParams={searchParams}>
          <Suspense fallback={<PostListSkeleton />}>
            <PostFeed searchParams={searchParams} />
          </Suspense>
        </PostSearchAndFeedClient>
      </div>
    </main>
  )
}

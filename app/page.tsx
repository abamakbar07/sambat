import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { db } from "@/lib/db"
import PostList from "@/components/post-list"
import { formatRelativeTime } from "@/lib/utils"
import { auth } from "./auth"

// Fetch posts with pagination
async function getPosts(page = 1, limit = 10) {
  const skip = (page - 1) * limit

  const posts = await db.post.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      likes: {
        select: {
          userId: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    skip,
    take: limit,
  })

  const totalPosts = await db.post.count({
    where: {
      status: "ACTIVE",
    },
  })

  return {
    posts: posts.map((post) => ({
      ...post,
      createdAt: formatRelativeTime(post.createdAt),
    })),
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Music Feed</h1>
        <Button asChild>
          <Link href="/create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Share a song
          </Link>
        </Button>
      </div>

      <Suspense fallback={<PostListSkeleton />}>
        <PostFeed searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function PostFeed({ searchParams }: { searchParams: { page?: string } }) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const { posts, totalPages, currentPage } = await getPosts(page)
  const session = await auth()

  return (
    <div className="space-y-6">
      <PostList posts={posts} currentUserId={session?.user?.id} />
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <Link
              key={i + 1}
              href={`/?page=${i + 1}`}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

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


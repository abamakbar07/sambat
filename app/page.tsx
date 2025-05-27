"use client" // Top-level directive for client component features like hooks

import { Suspense, useState, useEffect } from "react" // Added useState, useEffect
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import db from "@/lib/db" // Changed to default import
import PostList from "@/components/post-list"
import PostSearch from "@/components/post-search" // Import PostSearch
import { formatRelativeTime } from "@/lib/utils"
import { auth } from "./auth" // auth import might be problematic

// Define Post type based on usage, assuming it's like this from getPosts
// This should ideally come from a shared types file or Prisma generated types
type Post = {
  id: string;
  // Add other fields like trackName, artistName, message, albumArt, audioUrl, etc.
  // For now, keeping it minimal based on what PostList might expect generally
  createdAt: string; // Assuming it's already formatted
  likes: { userId: string }[];
  comments: any[]; // Define more strictly if possible
  // Assuming PostList also needs user and other post fields
  [key: string]: any; // Be more specific if possible
};

type InitialPostData = {
  posts: Post[];
  totalPages: number;
  currentPage: number;
  currentUserId?: string;
};

// Fetch posts with pagination - This function needs to be callable from client or data fetched initially
// For this modification, we'll assume initialPosts are passed to PostFeed,
// and PostFeed itself becomes a client component to manage search states.
async function getPosts(page = 1, limit = 10): Promise<Omit<InitialPostData, 'currentUserId'>> {
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
      // Ensure createdAt is formatted as needed by PostList, or format it there/later
      // For now, assuming formatRelativeTime is available and works client-side or was done server-side
      createdAt: formatRelativeTime(post.createdAt), 
    })),
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
  }
}


// The Home component itself will fetch initial data and pass it to PostFeed.
// Home remains an RSC (React Server Component).
export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  // Fetch initial posts and session data here, in the Server Component
  const initialPostData = await getPosts(page);
  const session = await auth();
  const currentUserId = session?.user?.id;

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

      {/* PostFeed is now a client component, receiving initial data as props */}
      <PostFeed 
        initialPosts={initialPostData.posts} 
        initialTotalPages={initialPostData.totalPages}
        initialCurrentPage={initialPostData.currentPage}
        currentUserId={currentUserId}
      />
    </div>
  );
}

// PostFeed becomes a client component to use hooks for search state
function PostFeed({ 
  initialPosts,
  initialTotalPages,
  initialCurrentPage,
  currentUserId,
}: { 
  initialPosts: Post[], 
  initialTotalPages: number,
  initialCurrentPage: number,
  currentUserId?: string,
}) {
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const handleResults = (results: Post[]) => {
    setSearchResults(results);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsLoadingSearch(isLoading);
  };

  // Determine which posts to display
  // If searchResults has items, use them. Otherwise, use initialPosts.
  const postsToDisplay = searchResults.length > 0 ? searchResults : initialPosts;
  
  // Hide pagination if search results are shown
  const showPagination = searchResults.length === 0 && initialTotalPages > 1;

  return (
    <div className="space-y-6">
      <PostSearch onResults={handleResults} onLoadingChange={handleLoadingChange} />

      {isLoadingSearch ? (
        <p className="text-center text-muted-foreground">Searching posts...</p>
      ) : (
        // PostList will handle its own empty state if postsToDisplay is empty
        // e.g. "No posts found" or "No posts yet"
        <PostList posts={postsToDisplay} currentUserId={currentUserId} />
      )}
      
      {showPagination && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <Link
              key={i + 1}
              href={`/?page=${i + 1}`}
              className={`px-4 py-2 rounded ${
                initialCurrentPage === i + 1
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
  );
}

// PostListSkeleton can remain unchanged if it's used by Suspense in Home,
// but Home no longer uses Suspense directly around PostFeed in this new structure.
// However, if getPosts was slow, Home could wrap PostFeed in Suspense and show this skeleton.
// For now, it's not explicitly used by the refactored PostFeed.
// It can be removed if Home won't use Suspense for PostFeed anymore.
// Let's keep it for now, as Home could still wrap <PostFeed ... /> in <Suspense>
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


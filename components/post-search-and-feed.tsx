"use client"; // Directive at the top

import { Suspense, useState, useEffect, ComponentType } from "react"; // Added ComponentType
import { useRouter, usePathname, useSearchParams as useNextSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

// Define the props for PostFeed and PostListSkeleton if their exact structure is known
// For now, using a general ComponentType
interface PostFeedProps {
  searchParams: { page?: string; query?: string };
}

interface PostSearchAndFeedClientProps {
  searchParams: { page?: string; query?: string };
  PostFeedComponent: ComponentType<PostFeedProps>;
  PostListSkeletonComponent: ComponentType<any>; // Use any for skeleton if props are minimal/none
}

export default function PostSearchAndFeedClient({
  searchParams,
  PostFeedComponent,
  PostListSkeletonComponent,
}: PostSearchAndFeedClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentNextSearchParams = useNextSearchParams();

  const initialQuery = searchParams.query || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(currentNextSearchParams.toString());
    if (debouncedSearchTerm) {
      params.set("query", debouncedSearchTerm);
    } else {
      params.delete("query");
    }
    const currentQueryParam = currentNextSearchParams.get("query");
    if (debouncedSearchTerm !== (currentQueryParam || "")) {
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, initialQuery, pathname, router, currentNextSearchParams]);

  return (
    <div>
      <Input
        type="text"
        placeholder="Search posts by message, song, artist, or author..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full"
      />
      <Suspense fallback={<PostListSkeletonComponent />}>
        <PostFeedComponent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

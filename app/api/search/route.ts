import { type NextRequest, NextResponse } from "next/server"
import { searchTracks } from "@/lib/spotify"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const type = searchParams.get("type")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  if (type === "post") {
    try {
      const posts = await prisma.post.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { message: { contains: query, mode: "insensitive" } },
            { trackName: { contains: query, mode: "insensitive" } },
            { artistName: { contains: query, mode: "insensitive" } },
          ],
        },
      })
      return NextResponse.json(posts)
    } catch (error) {
      console.error("Error searching posts:", error)
      return NextResponse.json({ error: "Failed to search posts" }, { status: 500 })
    }
  } else {
    try {
      const data = await searchTracks(query)
      return NextResponse.json(data)
    } catch (error) {
      console.error("Error searching tracks:", error)
      return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 })
    }
  }
}


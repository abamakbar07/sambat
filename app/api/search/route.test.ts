import { GET } from "./route"
import { NextRequest } from "next/server"
import { searchTracks } from "@/lib/spotify"
import { PrismaClient } from "@prisma/client"

// Mock Spotify searchTracks
jest.mock("@/lib/spotify", () => ({
  searchTracks: jest.fn(),
}))

// Mock Prisma client
const mockFindMany = jest.fn()
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    post: {
      findMany: mockFindMany,
    },
  })),
}))

describe("API Route: /api/search", () => {
  let req: NextRequest

  beforeEach(() => {
    jest.clearAllMocks() // Clear mocks before each test
  })

  describe("Song Search", () => {
    it("should call searchTracks and return its results when type=song and q is provided", async () => {
      const mockSpotifyResults = { tracks: { items: [{ id: "1", name: "Song A" }] } }
      ;(searchTracks as jest.Mock).mockResolvedValue(mockSpotifyResults)

      req = new NextRequest("http://localhost/api/search?type=song&q=testquery")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(searchTracks).toHaveBeenCalledWith("testquery")
      expect(body).toEqual(mockSpotifyResults)
    })

    it("should call searchTracks when no type is provided (defaults to song) and q is provided", async () => {
      const mockSpotifyResults = { tracks: { items: [{ id: "2", name: "Song B" }] } }
      ;(searchTracks as jest.Mock).mockResolvedValue(mockSpotifyResults)

      req = new NextRequest("http://localhost/api/search?q=anotherquery")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(searchTracks).toHaveBeenCalledWith("anotherquery")
      expect(body).toEqual(mockSpotifyResults)
    })

    it("should return a 400 error if q parameter is missing for song search", async () => {
      req = new NextRequest("http://localhost/api/search?type=song")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: "Query parameter is required" })
      expect(searchTracks).not.toHaveBeenCalled()
    })
    
    it("should return a 400 error if q parameter is missing (defaulting to song search)", async () => {
        req = new NextRequest("http://localhost/api/search")
        const response = await GET(req)
        const body = await response.json()
  
        expect(response.status).toBe(400)
        expect(body).toEqual({ error: "Query parameter is required" })
        expect(searchTracks).not.toHaveBeenCalled()
      })

    it("should return a 500 error if searchTracks throws an error", async () => {
      (searchTracks as jest.Mock).mockRejectedValue(new Error("Spotify API error"))

      req = new NextRequest("http://localhost/api/search?q=errorquery")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: "Failed to search tracks" })
      expect(searchTracks).toHaveBeenCalledWith("errorquery")
    })
  })

  describe("Post Search", () => {
    it("should call prisma.post.findMany with correct parameters for type=post and q", async () => {
      const mockPrismaPosts = [{ id: "p1", message: "Test post" }]
      mockFindMany.mockResolvedValue(mockPrismaPosts)

      req = new NextRequest("http://localhost/api/search?type=post&q=postquery")
      const response = await GET(req)
      // const body = await response.json() // consume body later if needed for this test

      expect(response.status).toBe(200) // Check status first
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          status: "ACTIVE",
          OR: [
            { message: { contains: "postquery", mode: "insensitive" } },
            { trackName: { contains: "postquery", mode: "insensitive" } },
            { artistName: { contains: "postquery", mode: "insensitive" } },
          ],
        },
      })
    })

    it("should return posts found by Prisma for type=post and q", async () => {
      const mockPrismaPosts = [{ id: "p2", message: "Another post" }]
      mockFindMany.mockResolvedValue(mockPrismaPosts)

      req = new NextRequest("http://localhost/api/search?type=post&q=anotherpostquery")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual(mockPrismaPosts)
    })

    it("should return a 400 error if q parameter is missing for post search", async () => {
      req = new NextRequest("http://localhost/api/search?type=post")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: "Query parameter is required" })
      expect(mockFindMany).not.toHaveBeenCalled()
    })

    it("should return a 500 error if Prisma client throws an error during post search", async () => {
      mockFindMany.mockRejectedValue(new Error("Prisma DB error"))

      req = new NextRequest("http://localhost/api/search?type=post&q=dberrorquery")
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: "Failed to search posts" })
      expect(mockFindMany).toHaveBeenCalledWith({ // Ensure it was still called with correct params
        where: {
          status: "ACTIVE",
          OR: [
            { message: { contains: "dberrorquery", mode: "insensitive" } },
            { trackName: { contains: "dberrorquery", mode: "insensitive" } },
            { artistName: { contains: "dberrorquery", mode: "insensitive" } },
          ],
        },
      })
    })
  })
})

import { cache } from "react"

// Cache token to avoid unnecessary requests
let accessToken: string | null = null
let tokenExpiry = 0

// Get Spotify access token
export async function getSpotifyToken() {
  // Return cached token if it's still valid
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${data.error}`)
  }

  // Cache the token and set expiry
  accessToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000 // Subtract 1 minute for safety

  return accessToken
}

// Search for tracks with caching
export const searchTracks = cache(async (query: string) => {
  if (!query || query.trim().length < 2) {
    return { tracks: [] }
  }

  try {
    const token = await getSpotifyToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error searching tracks:", error)
    return { tracks: { items: [] } }
  }
})

// Get track details with caching
export const getTrack = cache(async (trackId: string) => {
  try {
    const token = await getSpotifyToken()

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting track:", error)
    throw error
  }
})


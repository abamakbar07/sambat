"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import prisma from "@/lib/db"
import { hashIpAddress } from "@/lib/utils"
import { getTrack } from "@/lib/spotify"
import { z } from "zod"

// Validation schema for creating a post
const createPostSchema = z.object({
  message: z.string().min(1).max(280),
  trackId: z.string().min(1),
  authorName: z.string().max(50).optional(),
})

export async function createPost(formData: FormData) {
  try {
    // Get and validate form data
    const message = formData.get("message") as string
    const trackId = formData.get("trackId") as string
    const authorName = formData.get("authorName") as string | null

    const validatedData = createPostSchema.parse({ message, trackId, authorName })

    // Get IP address for moderation purposes
    // const headersList = headers()
    // const ip = headersList.get("x-forwarded-for") || "unknown"
    // const hashedIp = hashIpAddress(ip)

    // Fetch track details to verify it exists and store relevant info
    const trackDetails = await getTrack(trackId)

    // Create the post
    const postData: any = {
      message: validatedData.message,
      trackId: validatedData.trackId,
      trackName: trackDetails.name,
      artistName: trackDetails.artists[0].name,
      albumArt: trackDetails.album.images[0]?.url || "",
      hashedIp: "random", // This will be addressed later if necessary
    };
    if (validatedData.authorName) {
      postData.authorName = validatedData.authorName;
    }
    await prisma.post.create({ data: postData });

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error creating post:", error)
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? "Invalid input. Message must be between 1-280 characters and a track must be selected."
          : "Failed to create post. Please try again.",
    }
  }
}

// Validation schema for reporting a post
const reportPostSchema = z.object({
  postId: z.string().min(1),
  reason: z.string().min(1).max(500),
})

export async function reportPost(formData: FormData) {
  try {
    // Get and validate form data
    const postId = formData.get("postId") as string
    const reason = formData.get("reason") as string

    const validatedData = reportPostSchema.parse({ postId, reason })

    // Get IP address for moderation purposes
    // const headersList = headers()
    // const ip = headersList.get("x-forwarded-for") || "unknown"
    // const hashedIp = hashIpAddress(ip)

    // Create the report
    await prisma.report.create({
      data: {
        postId: validatedData.postId,
        reason: validatedData.reason,
        hashedIp: "random"
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error reporting post:", error)
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? "Invalid input. Please provide a reason for reporting."
          : "Failed to submit report. Please try again.",
    }
  }
}


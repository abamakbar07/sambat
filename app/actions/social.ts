"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/app/auth"

export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const existingLike = await db.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  if (existingLike) {
    await db.like.delete({
      where: {
        id: existingLike.id,
      },
    })
  } else {
    await db.like.create({
      data: {
        postId,
        userId,
      },
    })
  }

  revalidatePath("/")
}

export async function addComment(postId: string, content: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const comment = await db.comment.create({
    data: {
      content,
      postId,
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  })

  revalidatePath("/")
  return comment
}

export async function deleteComment(commentId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!comment || comment.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await db.comment.delete({
    where: { id: commentId },
  })

  revalidatePath("/")
}
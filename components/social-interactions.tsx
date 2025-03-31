"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Trash2 } from "lucide-react"
import { toggleLike, addComment, deleteComment } from "@/app/actions/social"
import { format } from "date-fns"

type SocialInteractionsProps = {
  postId: string
  likes: { userId: string }[]
  comments: {
    id: string
    content: string
    createdAt: Date
    user: {
      name: string | null
      image: string | null
    }
    userId: string
  }[]
  currentUserId: string | null | undefined
}

export default function SocialInteractions({
  postId,
  likes,
  comments,
  currentUserId,
}: SocialInteractionsProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLiked = currentUserId ? likes.some((like) => like.userId === currentUserId) : false

  const handleLike = async () => {
    if (!currentUserId) return
    await toggleLike(postId)
  }

  const handleComment = async () => {
    if (!currentUserId || !commentText.trim()) return
    setIsSubmitting(true)
    await addComment(postId, commentText.trim())
    setCommentText("")
    setIsCommenting(false)
    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={isLiked ? "text-red-500" : ""}
          onClick={handleLike}
          disabled={!currentUserId}
        >
          <Heart className="w-5 h-5 mr-1" />
          {likes.length}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCommenting(!isCommenting)}
          disabled={!currentUserId}
        >
          <MessageCircle className="w-5 h-5 mr-1" />
          {comments.length}
        </Button>
      </div>

      {isCommenting && (
        <div className="space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button
            onClick={handleComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      )}

      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 items-start">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.image || "/placeholder-user.jpg"} />
                <AvatarFallback>{comment.user.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{comment.user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
              {currentUserId === comment.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
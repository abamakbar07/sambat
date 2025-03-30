"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { reportPost } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

export default function ReportDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!postId || !reason.trim()) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("postId", postId)
    formData.append("reason", reason)

    const result = await reportPost(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe.",
      })
      setReason("")
      onOpenChange(false)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report inappropriate content</DialogTitle>
          <DialogDescription>
            Please let us know why you think this post violates our community guidelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why this post is inappropriate..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit report</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


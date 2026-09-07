'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/session"

export async function createFeedPost(data: {
  /** Optional — when omitted, the first line of the content becomes the title. */
  title?: string
  content: string
  postType: 'EVENT_RECAP' | 'CONGRATULATIONS' | 'ANNOUNCEMENT'
  imageUrls?: string[]
  eventId?: string
  winners?: { userId: string; awardTitle: string }[]
}) {
  const user = await getCurrentUser()
  
  // Guard check: Only Club Accounts can post
  if (!user || user.role !== 'CLUB') {
    throw new Error("Unauthorized: Only Club Accounts can create posts.")
  }

  const club = await prisma.club.findUnique({
    where: { id: user.id }
  })

  if (!club) throw new Error("Club account not found")

  if (club.status !== "PUBLISHED") {
    throw new Error(
      "You must publish your club profile before posting updates."
    )
  }

  // With no title field on the composer, the first line of the text becomes
  // the post title and the rest is the body — so the feed card doesn't repeat
  // the same line as both heading and paragraph.
  const lines = data.content.trim().split('\n')
  const title =
    (data.title || lines[0] || 'Untitled post').trim().slice(0, 100)
  const body = lines.slice(1).join('\n').trim()

  const newPost = await prisma.clubPost.create({
    data: {
      clubId: club.id,
      title,
      content: body,
      postType: data.postType,
      imageUrls: data.imageUrls || [],
      eventId: data.eventId || null,
      taggedUsers: data.winners ? {
        create: data.winners.map(w => ({
          userId: w.userId,
          awardTitle: w.awardTitle
        }))
      } : undefined
    }
  })

  // Revalidate global feed, the club's profile page, and its public feed page
  revalidatePath('/feed')
  revalidatePath(`/clubs/${club.slug}`)
  revalidatePath(`/clubs/${club.slug}/feed`)

  return { success: true, postId: newPost.id }
}

export async function togglePostLike(postId: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'STUDENT') {
    throw new Error("Only logged-in students can like posts.")
  }

  const existingLike = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } }
  })

  if (existingLike) {
    await prisma.postLike.delete({
      where: { id: existingLike.id }
    })
  } else {
    await prisma.postLike.create({
      data: { postId, userId: user.id }
    })
  }

  revalidatePath('/feed')
  return { success: true }
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Heart, Share2, Award, Calendar } from 'lucide-react'
import { togglePostLike } from '@/app/actions/feed'

type PostType = 'EVENT_RECAP' | 'CONGRATULATIONS' | 'ANNOUNCEMENT'

interface PostCardProps {
  post: {
    id: string
    clubId: string
    postType: PostType
    title: string
    content: string
    imageUrls: string[]
    createdAt: Date
    club: {
      name: string
      logoUrl: string | null
    }
    event?: {
      id: string
      title: string
      startDate: Date
    } | null
    likes: { id: string }[]
    taggedUsers: {
      id: string
      awardTitle: string | null
      user: {
        name: string
        department: string | null
      }
    }[]
  }
  currentUserId?: string
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    currentUserId ? post.likes.some(like => like.id === currentUserId) : false // Simplified for UI purposes
  )
  const [likeCount, setLikeCount] = useState(post.likes.length)

  const handleLike = async () => {
    if (!currentUserId) return // Could trigger a login modal here
    try {
      // Optimistic update
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
      await togglePostLike(post.id)
    } catch (error) {
      // Revert optimistic update
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
    }
  }

  const categoryLabels = {
    EVENT_RECAP: 'Event Recap',
    CONGRATULATIONS: 'Congratulations',
    ANNOUNCEMENT: 'Announcement'
  }

  const categoryColors = {
    EVENT_RECAP: 'bg-blue-100 text-blue-800',
    CONGRATULATIONS: 'bg-yellow-100 text-yellow-800',
    ANNOUNCEMENT: 'bg-green-100 text-green-800'
  }

  return (
    <div className="liquid-glass mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            {post.club.logoUrl ? (
              <Image src={post.club.logoUrl} alt={post.club.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                {post.club.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.club.name}</h3>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString(undefined, { 
                month: 'short', day: 'numeric', year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColors[post.postType]}`}>
          {categoryLabels[post.postType]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>

      {/* Linked Event Badge */}
      {post.event && (
        <div className="px-4 pb-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm border border-indigo-100">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{post.event.title}</span>
            <span className="text-indigo-400">&bull;</span>
            <span className="text-indigo-600">{new Date(post.event.startDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Winner Spotlight Banner */}
      {post.taggedUsers.length > 0 && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <h4 className="font-bold text-yellow-800">Winner Spotlight</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {post.taggedUsers.map((tag) => (
              <div key={tag.id} className="bg-white rounded-lg p-3 flex flex-col shadow-sm border border-yellow-50">
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1">
                  {tag.awardTitle || 'Winner'}
                </span>
                <span className="font-semibold text-gray-900">{tag.user.name}</span>
                {tag.user.department && (
                  <span className="text-xs text-gray-500">{tag.user.department}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className={`grid gap-1 ${post.imageUrls.length === 1 ? 'grid-cols-1' : post.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {post.imageUrls.map((url, idx) => (
            <div key={idx} className={`relative bg-gray-100 ${post.imageUrls.length === 1 ? 'h-64 sm:h-96' : 'h-48'} ${post.imageUrls.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
              <Image src={url} alt="Post image" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-50 flex items-center space-x-6">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium text-sm">{likeCount}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="font-medium text-sm">Share</span>
        </button>
      </div>
    </div>
  )
}

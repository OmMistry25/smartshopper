import React from 'react'

interface ChatBubbleProps {
  message: string
  sentByUser?: boolean
}

export default function ChatBubble({ message, sentByUser = false }: ChatBubbleProps) {
  return (
    <div className={`flex ${sentByUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-xs break-words text-sm shadow
          ${sentByUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
      >
        {message}
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAgentStore } from '@/state/agentStore'
import ChatBubble from './ChatBubble'
import { getNextPrompt, findProductsByKeyword, findProductsByIntent } from '@/lib/chatEngine'
import ProductCard from './ProductCard'
import { parseIntent } from '@/lib/nlu/intentParser'

async function logInteraction({ userId, question, response }: { userId?: string | null, question: string, response: string }) {
  await fetch('/api/logInteraction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, question, response }),
  })
}

export default function AgentWidget() {
  const { isOpen, setIsOpen, messages, addMessage, products, setProducts } = useAgentStore()

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage({ text: 'Hi! What are you looking for today?', sentByUser: false })
    }
  }, [isOpen, messages.length, addMessage])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Shopping Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg.text} sentByUser={msg.sentByUser} />
            ))}
          </div>
          <form
            className="p-4 border-t flex gap-2"
            onSubmit={async e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('userInput') as HTMLInputElement;
              const value = input.value.trim();
              if (value) {
                addMessage({ text: value, sentByUser: true });
                input.value = '';
                // Log user message
                logInteraction({ userId: null, question: value, response: '' });
                setTimeout(async () => {
                  const userAnswers = useAgentStore.getState().messages
                    .filter(m => m.sentByUser)
                    .map(m => m.text);
                  const next = getNextPrompt(userAnswers);
                  if (next === 'search') {
                    const intent = parseIntent(userAnswers.join(' '));
                    const found = await findProductsByIntent(intent);
                    setProducts(found);
                    if (found.length > 0) {
                      addMessage({ text: 'Here are some options for you!', sentByUser: false });
                    } else {
                      addMessage({ text: 'Sorry, product not available.', sentByUser: false });
                    }
                  } else {
                    addMessage({ text: next, sentByUser: false });
                  }
                  // Log agent reply
                  logInteraction({ userId: null, question: value, response: next });
                }, 100);
              }
            }}
          >
            <input
              name="userInput"
              type="text"
              autoComplete="off"
              placeholder="Type your message..."
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </form>
          {products.length > 0 && (
            <div className="p-4 border-t flex flex-wrap gap-4 justify-center bg-gray-50">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
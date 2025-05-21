'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAgentStore } from '@/state/agentStore'
import ChatBubble from './ChatBubble'
import { getNextPrompt, findProductsByKeyword, findProductsByIntent } from '@/lib/chatEngine'
import ProductCard from './ProductCard'
import { parseIntent } from '@/lib/nlu/intentParser'

async function logInteraction({ userId, question, response, intent, followUp }: { userId?: string | null, question: string, response: string, intent: any, followUp: string }) {
  await fetch('/api/logInteraction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, question, response, intent, followUp }),
  })
}

export default function AgentWidget() {
  const { isOpen, setIsOpen, messages, addMessage, products, setProducts } = useAgentStore()
  const userAnswers = useMemo(() => messages.filter(m => m.sentByUser).map(m => m.text), [messages])
  const mergedIntent = useMemo(() => {
    const { mergeIntents } = require('@/lib/chatEngine')
    return mergeIntents(userAnswers.map(require('@/lib/nlu/intentParser').parseIntent))
  }, [userAnswers])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage({ text: 'Hi! What are you looking for today?', sentByUser: false })
    }
  }, [isOpen, messages.length, addMessage])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Open shopping assistant chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl w-80 md:w-96 h-[400px] md:h-[500px] flex flex-col overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Shopping Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Close chat window"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg.text} sentByUser={msg.sentByUser} />
            ))}
          </div>
          <form
            className="p-4 border-t border-gray-200 bg-gray-100 flex items-center gap-2"
            onSubmit={async e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('userInput') as HTMLInputElement;
              const value = input.value.trim();

              if (value) {
                // Add user message to state immediately for instant display
                addMessage({ text: value, sentByUser: true });
                input.value = '';

                // Process agent logic and log interaction after a short delay
                setTimeout(async () => {
                  // Retrieve messages including the user's latest for intent parsing
                  const currentMessages = useAgentStore.getState().messages;
                  const userAnswers = currentMessages.filter(m => m.sentByUser).map(m => m.text);

                  // Parse intent and determine next step based on accumulated user answers
                  const intents = userAnswers.map(require('@/lib/nlu/intentParser').parseIntent);
                  const mergedIntent = require('@/lib/chatEngine').mergeIntents(intents);
                  const next = getNextPrompt(userAnswers);

                  // Determine the agent's response text
                  let agentResponseText = next;
                  if (next === 'search') {
                      const found = await findProductsByIntent(mergedIntent);
                      setProducts(found);
                      agentResponseText = found.length > 0 
                        ? 'Here are some options for you!' 
                        : 'Sorry, product not available.';
                   }

                  // Add agent's response to state
                   addMessage({ text: agentResponseText, sentByUser: false });

                  // Log the full interaction (user question -> agent response) with intent and follow-up
                  // Use the original user input (value) as the question for the log
                  console.log('Final Logging Attempt:', { userId: null, question: value, response: agentResponseText, intent: mergedIntent, followUp: next });
                  logInteraction({ userId: null, question: value, response: agentResponseText, intent: mergedIntent, followUp: next });

                }, 100);
              }
            }}
          >
            <input
              name="userInput"
              type="text"
              autoComplete="off"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              aria-label="Type your message"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Send
            </button>
          </form>
          {/* Product listing area - only shown if products exist */}
          {products.length > 0 && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-100 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 justify-center">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* Smart navigation link */}
              {mergedIntent.category && (
                <div className="w-full text-center mt-2">
                  <a
                    href={`/products/${mergedIntent.category}?${mergedIntent.color ? `color=${mergedIntent.color}&` : ''}${mergedIntent.size ? `size=${mergedIntent.size}` : ''}`}
                    className="text-blue-600 underline hover:text-blue-800 text-sm"
                    target="_blank"
                  >
                    Browse all {mergedIntent.category}
                    {mergedIntent.color ? ` in ${mergedIntent.color}` : ''}
                    {mergedIntent.size ? `, size ${mergedIntent.size}` : ''}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
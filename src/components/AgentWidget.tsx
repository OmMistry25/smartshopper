'use client'

import { useState, useEffect, useRef } from 'react'
import { useAgentStore } from '@/state/agentStore'
import ChatBubble from './ChatBubble'
import ProductCard from './ProductCard'
import { getNextPrompt, IntentObject } from '@/lib/chatEngine'
import type { Message } from '@/state/agentStore'
import { getShopifyProductUrl } from '@/lib/shopify/shopifyClient'

// async function logInteraction({ userId, question, response, intent, followUp }: { userId?: string | null, question: string, response: string, intent: any, followUp: string }) {
//   await fetch('/api/logInteraction', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ userId, question, response, intent, followUp }),
//   })
// }

export const AgentWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { messages, addMessage, setProducts, products } = useAgentStore()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Hardcode the shop domain for now for testing purposes
  const shopDomain = 'kks3tj-31.myshopify.com'; // <<<<<<----- REPLACE THIS IN PRODUCTION

  // State to hold the current intent
  const [currentIntent, setCurrentIntent] = useState<IntentObject>({
    category: null,
    color: null,
    size: null,
    priceMax: null,
    style: null,
    incomplete: []
  })

  // Initial prompt when the widget opens or component mounts
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({ text: "Hi! What are you looking for today?", sentByUser: false })
    }
  }, [messages, addMessage])

  // Effect to scroll to the bottom of the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = { text: inputValue, sentByUser: true }
      addMessage(userMessage)
      setInputValue('') // Clear input immediately

      // Prepare messages for getNextPrompt (adapt to expected { text, sender } format)
      const messagesForPrompt = messages.map(msg => ({ text: msg.text, sender: msg.sentByUser ? 'user' : 'agent' as 'user' | 'agent' }))
      const userMessageForPrompt = { text: userMessage.text, sender: 'user' as 'user' | 'agent' }

      // Call getNextPrompt with the new message, current intent, and shopDomain
      const { prompt, products, updatedIntent } = await getNextPrompt([...messagesForPrompt, userMessageForPrompt], currentIntent, shopDomain);

      // Update the current intent state
      setCurrentIntent(updatedIntent)

      // Add agent's reply (do not generate id here)
      addMessage({ text: prompt, sentByUser: false })

      // Set products if found
      if (products) {
        setProducts(products)
      } else {
        setProducts([]) // Clear products if none found
      }

      // Log user interaction (optional, depending on if we re-enable logging)
      // logInteraction({ question: inputValue, response: prompt, intent: updatedIntent, follow_up: prompt })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Basic styling classes
  const widgetClasses = `fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col ${isOpen ? 'block' : 'hidden'}`
  const toggleButtonClasses = 'fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg'

  return (
    <>
      {/* Floating Toggle Button */}
      <button className={toggleButtonClasses} onClick={() => setIsOpen(!isOpen)}>
        Assistant
      </button>

      {/* Agent Widget */}
      <div className={widgetClasses}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Assistant</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message.text} sentByUser={message.sentByUser} />
          ))}

          {/* Display Product Cards */}
          {products.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 flex-shrink-0">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Smart navigation link - Uncommented */}
          {products.length > 0 && products[0].handle && (
            <div className="w-full text-center mt-2">
              <a
                href={getShopifyProductUrl(products[0].handle)!}
                className="text-blue-600 underline hover:text-blue-800 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                View {currentIntent.category || 'Product'} on Shopify
              </a>
            </div>
          )}

          {/* Message when no products are found */}
          {messages.length > 0 && messages[messages.length - 1].sentByUser === false && products.length === 0 && messages[messages.length - 1].text.includes("Sorry, I couldn't find") && (
            <div className="text-gray-600 text-sm text-center mt-2">
              Please try refining your search.
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 flex items-center">
          <input
            type="text"
            className="flex-grow border rounded-l-md p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="bg-blue-500 text-white rounded-r-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
} 
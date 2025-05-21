import { parseIntent, IntentObject } from './nlu/intentParser'
import { getNextQuestion } from './nlu/questionPlanner'
import { searchProductsByIntent } from './shopify/shopifyClient'
import type { Product } from '@/types/product'

// Function to merge a new intent into the current one
function mergeIntents(currentIntent: IntentObject, newIntent: IntentObject): IntentObject {
  // Ensure all properties from IntentObject are included, even if null
  return {
    category: newIntent.category || currentIntent.category,
    color: newIntent.color || currentIntent.color,
    size: newIntent.size || currentIntent.size,
    priceMax: newIntent.priceMax !== null && !isNaN(newIntent.priceMax) ? newIntent.priceMax : currentIntent.priceMax,
    style: newIntent.style || currentIntent.style, // Include style
    incomplete: [], // incomplete is determined by getNextQuestion now
  };
}

export async function getNextPrompt(
  messages: { text: string; sender: 'user' | 'agent' }[],
  currentIntent: IntentObject
): Promise<{ prompt: string; products?: Product[]; updatedIntent: IntentObject }> {
  // Get the last user message
  const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop();
  const userMessageText = lastUserMessage ? lastUserMessage.text : '';

  // Parse intent from the last user message
  const newIntent = parseIntent(userMessageText);

  // Merge new intent with the current intent
  const updatedIntent = mergeIntents(currentIntent, newIntent);

  console.log('Updated Intent:', updatedIntent);

  // Search for products based on the updated intent
  const { products, availableAttributes } = await searchProductsByIntent(updatedIntent);
  console.log('Products found:', products);
  console.log('Available attributes:', availableAttributes);

  if (products.length > 0) {
    // If products are found:
    // Determine the next question based on the updated intent and available attributes
    const nextQuestion = getNextQuestion(updatedIntent, availableAttributes);

    // If the next question is about price, and we found products, don't ask it.
    if (nextQuestion && nextQuestion.includes('maximum price')) {
         return { prompt: "Here are some products that match your criteria:", products: products, updatedIntent: updatedIntent };
    } else if (nextQuestion) {
        // If the planner suggests a different next question (based on attributes), ask it
        return { prompt: nextQuestion, products: products, updatedIntent: updatedIntent };
    } else {
        // If no more attribute-based questions are suggested, just display products
         return { prompt: "Here are some products that match your criteria:", products: products, updatedIntent: updatedIntent };
    }

  } else {
    // If no products found, inform the user and determine next question based on intent
    const nextQuestion = getNextQuestion(updatedIntent, availableAttributes);

    if (nextQuestion) {
        // If the planner suggests a next question, include the "not found" message before it
        return { prompt: "Sorry, I couldn't find any products matching your criteria. " + nextQuestion, updatedIntent: updatedIntent };
    } else {
         // If no products found and no further questions are suggested by the planner
         return { prompt: "Sorry, I couldn't find any products matching your criteria. Please try a different query.", updatedIntent: updatedIntent };
    }
  }
}

export type { IntentObject }; // Re-export for use in other files 
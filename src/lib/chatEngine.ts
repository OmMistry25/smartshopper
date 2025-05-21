import { parseIntent, IntentObject } from './nlu/intentParser'
import { getNextQuestion } from './nlu/questionPlanner'
import { searchProductsByIntent } from './shopify/shopifyClient'
import type { Product } from '@/components/ProductCard'

export function mergeIntents(intents: IntentObject[]): IntentObject {
  const merged: IntentObject = {
    category: null,
    style: null,
    color: null,
    size: null,
    priceMax: null,
    incomplete: [] as string[]
  }
  for (const intent of intents) {
    if (intent.category) merged.category = intent.category
    if (intent.style) merged.style = intent.style
    if (intent.color) merged.color = intent.color
    if (intent.size) merged.size = intent.size
    if (intent.priceMax) merged.priceMax = intent.priceMax
  }
  // Recompute incomplete
  const required = ['category', 'color', 'size']
  merged.incomplete = required.filter((k) => !(merged as any)[k])
  return merged
}

export function getNextPrompt(prevAnswers: string[]): string {
  // Parse all user messages and merge intents
  const intents = prevAnswers.map(parseIntent)
  const mergedIntent = mergeIntents(intents)
  if (mergedIntent.incomplete.length === 0) {
    return 'search'
  }
  return getNextQuestion(mergedIntent)
}

export async function findProductsByIntent(intent: IntentObject): Promise<Product[]> {
  const shopifyProducts = await searchProductsByIntent(intent);
  return shopifyProducts as Product[];
} 
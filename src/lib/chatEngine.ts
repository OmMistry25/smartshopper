import { parseIntent, IntentObject } from './nlu/intentParser'
import { getNextQuestion } from './nlu/questionPlanner'
import { supabase } from './supabaseClient'
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
  let query = supabase.from('products').select('*')
  if (intent.category) query = query.eq('category', intent.category)
  if (intent.color) query = query.ilike('description', `%${intent.color}%`)
  if (intent.size) query = query.ilike('description', `%${intent.size}%`)
  if (intent.priceMax) query = query.lte('price', intent.priceMax)
  const { data, error } = await query.limit(5)
  if (error) return []
  return data as Product[]
}

export async function findProductsByKeyword(keyword: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${keyword}%`)
    .limit(5)
  if (error) return []
  return data as Product[]
} 
import { parseIntent } from './nlu/intentParser'
import { getNextQuestion } from './nlu/questionPlanner'
import { supabase } from './supabaseClient'
import type { Product } from '@/components/ProductCard'

export function getNextPrompt(prevAnswers: string[]): string {
  const lastMsg = prevAnswers[prevAnswers.length - 1] || ''
  const intent = parseIntent(lastMsg)
  if (intent.incomplete.length === 0) {
    return 'search'
  }
  return getNextQuestion(intent)
}

export async function findProductsByIntent(intent: ReturnType<typeof parseIntent>): Promise<Product[]> {
  let query = supabase.from('products').select('*')
  if (intent.category) query = query.ilike('category', `%${intent.category}%`)
  if (intent.color) query = query.ilike('name', `%${intent.color}%`)
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
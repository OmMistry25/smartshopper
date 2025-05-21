import { parseIntent } from './nlu/intentParser'
import { getNextQuestion } from './nlu/questionPlanner'
import { supabase } from './supabaseClient'
import type { Product } from '@/components/ProductCard'

export function getNextPrompt(prevAnswers: string[]): string {
  // Use the last user message for intent parsing
  const lastMsg = prevAnswers[prevAnswers.length - 1] || ''
  const intent = parseIntent(lastMsg)
  const nextQ = getNextQuestion(intent)
  return nextQ
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
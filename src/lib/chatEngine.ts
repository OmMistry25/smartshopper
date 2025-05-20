import { supabase } from './supabaseClient'
import type { Product } from '@/components/ProductCard'

export function getNextPrompt(prevAnswers: string[]): string {
  // For now, just return a placeholder prompt
  return "Thanks for your answer! (Product search coming soon...)";
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
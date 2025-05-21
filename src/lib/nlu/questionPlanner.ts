import type { IntentObject } from './intentParser'

export function getNextQuestion(intent: IntentObject): string {
  if (!intent) return "Could you tell me more about what you're looking for?"
  if (intent.incomplete.includes('category')) return "What type of product are you looking for? (e.g., pants, shoes, dress)"
  if (intent.incomplete.includes('color')) return "Do you have a preferred color?"
  if (intent.incomplete.includes('size')) return "What size do you need? (e.g., S, M, L)"
  // If all required info is present
  return "Great! Let me find some options for you."
} 
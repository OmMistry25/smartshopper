import type { IntentObject } from './intentParser'

export function getNextQuestion(intent: IntentObject, availableAttributes: string[]): string | null {
  // If a category is not set AND 'Category' is an available attribute, ask for category.
  if (!intent.category && availableAttributes.includes('Category')) {
    return 'Do you have a preferred category?'
  }

  // If a color is not set AND 'Color' is an available attribute, ask for color.
  if (!intent.color && availableAttributes.includes('Color')) {
    return 'Do you have a preferred color?'
  }

  // If a size is not set AND 'Size' is an available attribute, ask for size.
  if (!intent.size && availableAttributes.includes('Size')) {
    return 'What size do you need? (e.g., S, M, L)'
  }

  // If a priceMax is not set, ask for maximum price
  // We don't check availableAttributes for price because price is always a potential filter
  if (intent.priceMax === null) {
    return 'What is your maximum price?'
  }

  // If all required intent fields have been gathered based on available attributes, 
  // or if there are no more relevant attributes to ask about, return null
  return null;
} 
export interface IntentObject {
  category: string | null
  style: string | null
  color: string | null
  size: string | null
  priceMax: number | null
  incomplete: string[]
}

export function parseIntent(message: string): IntentObject {
  // Simple regex/rules for demo purposes
  const categoryMatch = message.match(/pants|shoes|dress|shirt|jacket|backpack|mat|lamp|bottle|phone|laptop|speaker|maker|mouse/i)
  const styleMatch = message.match(/baggy|slim|skinny|regular|running|portable|wireless|eco-friendly|non-slip|adjustable|insulated|ergonomic/i)
  const colorMatch = message.match(/red|blue|black|white|green|yellow|gray|grey|pink|purple|orange/i)
  const sizeMatch = message.match(/\b(xs|s|m|l|xl|xxl)\b/i)
  const priceMatch = message.match(/under \$?(\d+)/i)

  const intent: IntentObject = {
    category: categoryMatch ? categoryMatch[0].toLowerCase() : null,
    style: styleMatch ? styleMatch[0].toLowerCase() : null,
    color: colorMatch ? colorMatch[0].toLowerCase() : null,
    size: sizeMatch ? sizeMatch[1].toUpperCase() : null,
    priceMax: priceMatch ? parseInt(priceMatch[1], 10) : null,
    incomplete: []
  }

  // Determine which fields are missing
  const required = ['category', 'color', 'size']
  intent.incomplete = required.filter((k) => !(intent as any)[k])

  return intent
} 
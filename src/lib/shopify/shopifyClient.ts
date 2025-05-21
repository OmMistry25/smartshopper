import type { Product } from '@/components/ProductCard'

// Basic function to get all products (will be updated later)
export async function getProducts(): Promise<Product[]> {
  console.log('Shopify getProducts called (placeholder)');
  // TODO: Implement Shopify Admin API fetch
  return []
}

// Basic function to search products by query (will be updated later)
export async function searchProducts(query: string): Promise<Product[]> {
  console.log(`Shopify searchProducts called with query: ${query} (placeholder)`);
  // TODO: Implement Shopify Admin API search based on query
  return []
}
 
import type { Product } from '@/types/product'
import type { IntentObject } from '@/lib/nlu/intentParser'

// This client-side file now calls our API route instead of Shopify directly

// Removed: Direct Shopify API credentials and fetch logic
// const shopifyStoreUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
// const shopifyAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN; // This token is now server-only
// const apiVersion = '2024-01';
// async function fetchShopifyProducts(): Promise<any[]> { ... }
// function formatShopifyProduct(rawProduct: any): Product | null { ... }

// Basic function to get all products (might not be needed, keep for now)
export async function getProducts(): Promise<Product[]> {
  console.log('Client-side getProducts called (calling API route)');
  try {
    const response = await fetch('/api/shopify/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Sending an empty intent or a broad one to get all products (adjust as needed)
      body: JSON.stringify({ intent: {} }), 
    });
    if (!response.ok) {
        console.error(`API Route Error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Response body:', errorBody);
        return [];
    }
    const products: Product[] = await response.json();
    console.log('Client-side fetched products from API route:', products);
    return products;
  } catch (error) {
      console.error('Client-side error fetching products from API route:', error);
      return [];
  }
}

// Function to search products based on intent (calls our API route)
export async function searchProductsByIntent(intent: IntentObject): Promise<{ products: Product[], availableAttributes: string[] }> {
  console.log('Client-side searchProductsByIntent called (calling API route)', intent);
  try {
    const response = await fetch('/api/shopify/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent }),
    });

    if (!response.ok) {
      console.error(`API Route Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return { products: [], availableAttributes: [] };
    }

    const data: { products: Product[], availableAttributes: string[] } = await response.json();
    console.log('Client-side fetched products and attributes from API route:', data);
    return data;

  } catch (error) {
    console.error('Client-side error fetching products from API route:', error);
    return { products: [], availableAttributes: [] };
  }
}

// Function to generate a public Shopify product URL (remains client-side)
export function getShopifyProductUrl(productHandle: string): string | null {
  const shopifyStoreUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
  if (!shopifyStoreUrl) {
    console.error('Shopify store URL not set in .env.local');
    return null;
  }
  // Construct the public URL format: https://{store-name}.myshopify.com/products/{product-handle}
  // Ensure the store URL doesn't end with a slash for correct joining
  const baseUrl = shopifyStoreUrl.endsWith('/') ? shopifyStoreUrl.slice(0, -1) : shopifyStoreUrl;
  return `${baseUrl}/products/${productHandle}`;
}
 
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
// Note: This would ideally also require a shopDomain
export async function getProducts(): Promise<Product[]> {
  console.log('Client-side getProducts called (calling API route)');
  // For now, hardcoding a placeholder shop domain for testing.
  // You will need to replace 'YOUR_SHOPIFY_SHOP_DOMAIN' with the actual shop domain.
  const shopDomain = 'kks3tj-31.myshopify.com'; // <<<<<<----- REPLACED THIS

  try {
    const response = await fetch('/api/shopify/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Sending an empty intent or a broad one to get all products
      // Now also sending shopDomain
      body: JSON.stringify({ shopDomain: shopDomain, intent: {} }),
    });
    if (!response.ok) {
        console.error(`API Route Error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Response body:', errorBody);
        return [];
    }
    const data: { products: Product[], availableAttributes: string[] } = await response.json();
    console.log('Client-side fetched products from API route:', data.products);
    return data.products;
  } catch (error) {
      console.error('Client-side error fetching products from API route:', error);
      return [];
  }
}

// Function to search products based on intent (calls our API route)
// Now accepts shopDomain
export async function searchProductsByIntent(shopDomain: string, intent: IntentObject): Promise<{ products: Product[], availableAttributes: string[] }> {
  console.log('Client-side searchProductsByIntent called (calling API route)', { shopDomain, intent });
  try {
    const response = await fetch('/api/shopify/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Sending shopDomain and intent
      body: JSON.stringify({ shopDomain: shopDomain, intent }),
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
  const shopifyStoreUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL; // Using NEXT_PUBLIC for client-side URL construction
  if (!shopifyStoreUrl) {
    console.error('Shopify store URL not set in .env.local');
    return null;
  }
  // Construct the public URL format: https://{store-name}.myshopify.com/products/{product-handle}
  // Ensure the store URL doesn't end with a slash for correct joining
  const baseUrl = shopifyStoreUrl.endsWith('/') ? shopifyStoreUrl.slice(0, -1) : shopifyStoreUrl;
  return `${baseUrl}/products/${productHandle}`;
}
 
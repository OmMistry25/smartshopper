import type { Product } from '@/components/ProductCard'
import type { IntentObject } from '@/lib/nlu/intentParser'

const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const apiVersion = '2024-01';

async function fetchShopifyProducts(): Promise<any[]> {
  if (!shopifyStoreUrl || !shopifyAccessToken) {
    console.error('Shopify API credentials not set in .env.local');
    return [];
  }

  const url = `${shopifyStoreUrl}/admin/api/${apiVersion}/products.json`;

  try {
    console.log(`Fetching products from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
      },
    });

    if (!response.ok) {
      console.error(`Shopify API Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return [];
    }

    const data = await response.json();
    return data.products || [];

  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return [];
  }
}

// Basic function to get all products (will be updated later)
export async function getProducts(): Promise<Product[]> {
 // This function might not be needed anymore if we always search by intent
 // For now, it calls the internal fetcher
  const shopifyProducts = await fetchShopifyProducts();
 // We will format these in a later task
  console.log('Fetched Shopify Products (raw):', shopifyProducts);
  return shopifyProducts as Product[]; // Temporary cast, formatting needed
}

// Function to search products based on intent
export async function searchProductsByIntent(intent: IntentObject): Promise<Product[]> {
  console.log('Shopify searchProductsByIntent called with intent:', intent);

  const allShopifyProducts = await fetchShopifyProducts();

  // Filter products based on intent (basic filtering for now)
  const filteredProducts = allShopifyProducts.filter(product => {
    let matches = true;

    // Filter by category (using product_type for simplicity)
    if (intent.category && product.product_type) {
      matches = matches && product.product_type.toLowerCase().includes(intent.category.toLowerCase());
    }

    // Filter by color (searching title or body_html)
    if (intent.color) {
        const colorMatch = product.title.toLowerCase().includes(intent.color.toLowerCase()) || 
                           (product.body_html && product.body_html.toLowerCase().includes(intent.color.toLowerCase()));
        matches = matches && colorMatch;
    }

    // Filter by size (searching title or body_html)
    if (intent.size) {
        const sizeMatch = product.title.toLowerCase().includes(intent.size.toLowerCase()) || 
                          (product.body_html && product.body_html.toLowerCase().includes(intent.size.toLowerCase()));
        matches = matches && sizeMatch;
    }

    // Filter by priceMax (checking if ANY variant price is under priceMax)
    if (intent.priceMax !== null && product.variants && product.variants.length > 0) {
        const priceMatch = product.variants.some((variant: any) => parseFloat(variant.price) <= intent.priceMax!);
        matches = matches && priceMatch;
    }

    return matches;
  });

  console.log('Filtered Shopify Products (raw):', filteredProducts);
  // We will format these in a later task
  return filteredProducts as Product[]; // Temporary cast, formatting needed
}

// Basic function to search products by query (will be updated later)
export async function searchProducts(query: string): Promise<Product[]> {
  console.log(`Shopify searchProducts called with query: ${query} (placeholder)`);
  // TODO: Implement Shopify Admin API search based on query or use getProducts with filtering
  return []
}
 
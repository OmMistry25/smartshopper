import type { Product } from '@/components/ProductCard'

// Basic function to get all products (will be updated later)
export async function getProducts(): Promise<Product[]> {
  const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
  const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyStoreUrl || !shopifyAccessToken) {
    console.error('Shopify API credentials not set in .env.local');
    return [];
  }

  const url = `${shopifyStoreUrl}/admin/api/2024-01/products.json`;

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
    const products = data.products; // Shopify returns products in a 'products' array

    console.log('Fetched Shopify Products (Titles):');
    if (products && Array.isArray(products)) {
      products.forEach((product: any) => {
        console.log(`- ${product.title}`);
      });
    }

    // Return empty array for now, formatting happens in a later task
    return [];

  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return [];
  }
}

// Basic function to search products by query (will be updated later)
export async function searchProducts(query: string): Promise<Product[]> {
  console.log(`Shopify searchProducts called with query: ${query} (placeholder)`);
  // TODO: Implement Shopify Admin API search based on query or use getProducts with filtering
  return []
}
 
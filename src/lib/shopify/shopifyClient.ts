import type { Product } from '@/types/product'
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

// Helper to format raw Shopify product data to our Product interface
function formatShopifyProduct(rawProduct: any): Product | null {
  if (!rawProduct || !rawProduct.id || !rawProduct.title || !rawProduct.variants || rawProduct.variants.length === 0 || !rawProduct.handle) {
    console.warn('Skipping malformed Shopify product (missing id, title, variants, or handle):', rawProduct);
    return null;
  }
  
  // Use the price of the first variant for simplicity
  const price = parseFloat(rawProduct.variants[0].price);
  if (isNaN(price)) {
      console.warn('Skipping product with invalid price:', rawProduct);
      return null;
  }

  return {
    id: rawProduct.id.toString(), // Ensure ID is string
    name: rawProduct.title,
    category: rawProduct.product_type || 'Uncategorized', // Use product_type or default
    price: price,
    description: rawProduct.body_html || '',
    image_url: (rawProduct.images && rawProduct.images.length > 0) ? rawProduct.images[0].src : undefined,
    handle: rawProduct.handle, // Include the handle
  };
}

// Basic function to get all products (will be updated later)
export async function getProducts(): Promise<Product[]> {
 // This function might not be needed anymore if we always search by intent
 // For now, it calls the internal fetcher and formats results
  const shopifyProducts = await fetchShopifyProducts();
  const formattedProducts = shopifyProducts.map(formatShopifyProduct).filter((p): p is Product => p !== null);
  console.log('Fetched and Formatted Shopify Products:', formattedProducts);
  return formattedProducts;
}

// Function to search products based on intent
export async function searchProductsByIntent(intent: IntentObject): Promise<Product[]> {
  console.log('Shopify searchProductsByIntent called with intent:', intent);

  const allShopifyProducts = await fetchShopifyProducts();

  // Filter products based on intent (basic filtering for now)
  const filteredProducts = allShopifyProducts.filter(product => {
    let matches = true;

    // Filter by category (using product_type for simplicity)
    // Check if intent category is provided AND product_type exists and matches (case-insensitive, partial match)
    if (intent.category) {
      if (!product.product_type || !product.product_type.toLowerCase().includes(intent.category.toLowerCase())) {
         matches = false;
      }
    }

    // Filter by color (searching title or body_html) - only apply if color intent exists
    if (intent.color) {
        const colorMatch = product.title.toLowerCase().includes(intent.color.toLowerCase()) || 
                           (product.body_html && product.body_html.toLowerCase().includes(intent.color.toLowerCase()));
        matches = matches && colorMatch;
    }

    // Filter by size (searching title or body_html) - only apply if size intent exists
    if (intent.size) {
        const sizeMatch = product.title.toLowerCase().includes(intent.size.toLowerCase()) || 
                          (product.body_html && product.body_html.toLowerCase().includes(intent.size.toLowerCase()));
        matches = matches && sizeMatch;
    }

    // Filter by priceMax (checking if ANY variant price is under priceMax) - only apply if priceMax intent exists
    // Ensure priceMax is a number and products have variants with prices
    if (intent.priceMax !== null && !isNaN(intent.priceMax)) {
        if (!product.variants || product.variants.length === 0 || !product.variants.some((variant: any) => parseFloat(variant.price) <= intent.priceMax!)){
             matches = false;
        }
    }

    return matches;
  });

  console.log('Filtered and Formatted Shopify Products:', filteredProducts);
  // Format the filtered products before returning
  const formattedFilteredProducts = filteredProducts.map(formatShopifyProduct).filter((p): p is Product => p !== null);
  return formattedFilteredProducts;
}

// Basic function to search products by query (will be updated later)
export async function searchProducts(query: string): Promise<Product[]> {
  console.log(`Shopify searchProducts called with query: ${query} (placeholder)`);
  // TODO: Implement Shopify Admin API search based on query or use getProducts with filtering
  return []
}

// Function to generate a public Shopify product URL
export function getShopifyProductUrl(productHandle: string): string | null {
  if (!shopifyStoreUrl) {
    console.error('Shopify store URL not set in .env.local');
    return null;
  }
  // Construct the public URL format: https://{store-name}.myshopify.com/products/{product-handle}
  // Ensure the store URL doesn't end with a slash for correct joining
  const baseUrl = shopifyStoreUrl.endsWith('/') ? shopifyStoreUrl.slice(0, -1) : shopifyStoreUrl;
  return `${baseUrl}/products/${productHandle}`;
}
 
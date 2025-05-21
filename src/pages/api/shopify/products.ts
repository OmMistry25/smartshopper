import type { NextApiRequest, NextApiResponse } from 'next'
import type { IntentObject } from '@/lib/nlu/intentParser'
import type { Product } from '@/types/product'

// Read environment variables without NEXT_PUBLIC_ prefix for server-side use
const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN; // Keep this server-only!
const apiVersion = '2024-01';

async function fetchShopifyProducts(): Promise<any[]> {
  // This function now runs server-side via the API route
  if (!shopifyStoreUrl || !shopifyAccessToken) {
    console.error('Shopify API credentials not set for server-side fetch');
    return [];
  }

  const url = `${shopifyStoreUrl}/admin/api/${apiVersion}/products.json`;

  try {
    console.log(`Server-side fetching products from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
      },
    });

    if (!response.ok) {
      console.error(`Server-side Shopify API Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return [];
    }

    const data = await response.json();
    console.log('Server-side fetched raw products:', data.products); // Log raw fetched products
    return data.products || [];

  } catch (error) {
    console.error('Server-side error fetching Shopify products:', error);
    return [];
  }
}

// Helper to format raw Shopify product data to our Product interface
function formatShopifyProduct(rawProduct: any): Product | null {
  // Ensure rawProduct and required fields exist, including handle
  if (!rawProduct || !rawProduct.id || !rawProduct.title || !rawProduct.variants || rawProduct.variants.length === 0 || !rawProduct.handle) {
    console.warn('Server-side skipping malformed Shopify product (missing id, title, variants, or handle):', rawProduct);
    return null;
  }
  
  // Use the price of the first variant for simplicity
  const price = parseFloat(rawProduct.variants[0].price);
  if (isNaN(price)) {
      console.warn('Server-side skipping product with invalid price:', rawProduct);
      return null;
  }

  // Return formatted Product object including handle
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ products: Product[], availableAttributes: string[] } | { error: string }>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { intent } = req.body as { intent: IntentObject };
  console.log('API Route received intent:', intent); // Log the received intent

  if (!intent) {
      return res.status(400).json({ error: 'Missing intent in request body' });
  }

  const allShopifyProducts = await fetchShopifyProducts();

  // Filter products based on intent (basic filtering on server-side now)
  const filteredProducts = allShopifyProducts.filter(product => {
    let matches = true;

    // Filter by category (using product_type OR title)
    if (intent.category) {
        const categoryMatch = 
            (product.product_type && product.product_type.toLowerCase().includes(intent.category.toLowerCase())) ||
            (product.title && product.title.toLowerCase().includes(intent.category.toLowerCase()));
        if (!categoryMatch) {
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

    console.log('Product filtering check:', { productTitle: product.title, productType: product.product_type, intent: intent, matches: matches }); // Log filtering check for each product

    return matches;
  });

  console.log('Server-side Filtered Shopify Products Count:', filteredProducts.length); // Log count of filtered products

  // Collect available attributes from filtered products
  const availableAttributes = new Set<string>();
  filteredProducts.forEach(product => {
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: any) => {
        if (variant.options && variant.options.length > 0) {
          variant.options.forEach((option: any) => {
            if (option.name) {
              availableAttributes.add(option.name);
            }
          });
        }
      });
    }
  });

  console.log('Server-side Filtered Shopify Products:', filteredProducts);
  // Format the filtered products before sending to client
  const formattedFilteredProducts = filteredProducts.map(formatShopifyProduct).filter((p): p is Product => p !== null);

  console.log('Server-side Available Attributes:', Array.from(availableAttributes));

  res.status(200).json({ products: formattedFilteredProducts, availableAttributes: Array.from(availableAttributes) });
} 
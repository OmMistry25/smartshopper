import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
  const shop = req.query.shop; // Get the shop domain from the query parameter

  if (!apiKey || !redirectUri) {
    console.error('Shopify API Key or Redirect URI not set in environment variables.');
    return res.status(500).send('Server configuration error.');
  }

  if (!shop || typeof shop !== 'string') {
    return res.status(400).send('Missing or invalid shop parameter.');
  }

  const scopes = 'read_products,write_script_tags';
  const authUrl = 
    `https://${shop}/admin/oauth/authorize?` +
    `client_id=${apiKey}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Redirect the merchant to the Shopify OAuth consent screen
  res.redirect(authUrl);
} 
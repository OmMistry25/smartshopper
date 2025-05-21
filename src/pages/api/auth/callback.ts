import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const { shop, hmac, code, timestamp } = req.query; // Get parameters from Shopify redirect

  if (!apiKey || !apiSecret) {
    console.error('Shopify API Key or Secret not set in environment variables.');
    return res.status(500).send('Server configuration error.');
  }

  if (!shop || typeof shop !== 'string' || !code || typeof code !== 'string') {
    return res.status(400).send('Missing shop or code parameter from Shopify.');
  }

  // TODO: Implement HMAC verification to ensure the request came from Shopify
  // For now, we will skip HMAC verification for simplicity in this step.
  console.warn('HMAC verification is skipped. Implement this for production!');

  // Exchange the authorization code for a permanent access token
  const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
  const accessTokenPayload = {
    client_id: apiKey,
    client_secret: apiSecret,
    code,
  };

  try {
    const response = await fetch(accessTokenRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accessTokenPayload),
    });

    if (!response.ok) {
      console.error(`Shopify Access Token Exchange Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return res.status(response.status).send('Failed to obtain access token from Shopify.');
    }

    const data: { access_token: string, scope: string } = await response.json();
    const accessToken = data.access_token;

    console.log(`Successfully obtained access token for ${shop}: ${accessToken}`);

    // Store the shop domain and access token securely in the 'shops' table
    const { error: dbError } = await supabase
      .from('shops')
      .upsert(
        { shop_domain: shop, access_token: accessToken },
        { onConflict: 'shop_domain' } // Use upsert to handle potential re-installations
      );

    if (dbError) {
      console.error('Error saving shop access token to DB:', dbError);
      // Depending on your error handling, you might want to return an error response here
      // or proceed, but logging the error is important.
    }

    // Redirect the merchant to your app's main page or a success page
    // Replace with your actual app URL
    res.redirect(`https://your-app.com?shop=${shop}&installed=true`);

  } catch (error) {
    console.error('Error during Shopify access token exchange or DB save:', error);
    res.status(500).send('Internal server error during OAuth callback.');
  }
} 
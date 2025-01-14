import { Hono } from 'hono';
import { handle } from 'hono/vercel'

export const runtime = 'edge'

// Initialize Hono app
const app = new Hono().basePath('/api');

// Define environment variables (these should be set in Vercel's environment settings)
const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const VERCEL_URL = process.env.VERCEL_URL!
const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Handle OAuth Authentication Request
app.get('/auth', (c) => {
  const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${VERCEL_URL}/callback&response_type=code&scope=openid email profile`;
  return c.redirect(authUrl);
});

// Handle OAuth Callback and Exchange Code for Access Token
app.get('/callback', async (c) => {
  const code = c.req.query('code'); // The authorization code received from Google

  if (!code) {
    return c.text('Missing authorization code', 400);
  }

  // Exchange authorization code for access token
  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: `${VERCEL_URL}/callback`,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return c.text(`Error: ${tokenData.error}`, 400);
  }

  // You can return the access token or store it in a session/database
  return c.json({ access_token: tokenData.access_token });
});

// Handle default route
app.get('/', (c) => {
  return c.text('Authentication Server is Running');
});

export const GET = handle(app)
export const POST = handle(app)

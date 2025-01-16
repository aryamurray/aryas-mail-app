import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { OAuth2Client } from 'google-auth-library'
export const runtime = 'edge'

// Initialize Hono app
const app = new Hono().basePath('/api')

// Define environment variables (these should be set in Vercel's environment settings)
const CLIENT_ID = process.env.CLIENT_ID!
const CLIENT_SECRET = process.env.CLIENT_SECRET!
const VERCEL_URL = process.env.VERCEL_URL!
const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

const oauth2Client = new OAuth2Client(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URI // Usually your backend URL
)

// Handle OAuth Authentication Request
app.get('/auth', (c) => {
	const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${VERCEL_URL}/callback&response_type=code&scope=openid email profile`
	return c.redirect(authUrl)
})

// Handle OAuth Callback and Exchange Code for Access Token
app.post('/callback', async (c) => {
	try {
		const { code } = await c.req.json()

		if (!code) return c.json({ error: 'No code was Provided' }, 400)

		// Exchange code for tokens
		const { tokens } = await oauth2Client.getToken(code)
		const { access_token, refresh_token } = tokens

		// Store these securely (e.g., in a database)
		// Return tokens to the client (or manage them on the server-side)
		return c.json({ access_token, refresh_token })
	} catch (error) {
		console.error('Error:', error)
		return c.json({ error: 'Failed to exchange code' }, 500)
	}
})

// Handle default route
app.get('/', (c) => {
	return c.text('Authentication Server is Running')
})

export const GET = handle(app)
export const POST = handle(app)

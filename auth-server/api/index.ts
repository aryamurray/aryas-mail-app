import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { OAuth2Client } from 'google-auth-library'
export const runtime = 'edge'

// Initialize Hono app
const app = new Hono().basePath('/api')

// Define environment variables (these should be set in Vercel's environment settings)
const CLIENT_ID = process.env.CLIENT_ID!
const CLIENT_SECRET = process.env.CLIENT_SECRET!
const REDIRECT_URL = process.env.REDIRECT_URI!

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

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
		return c.json({ error: `Failed to exchange code${error}` }, 500)
	}
})

// Handle default route
app.get('/', (c) => {
	return c.text('Authentication Server is Running')
})

export const GET = handle(app)
export const POST = handle(app)

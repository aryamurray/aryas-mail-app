import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { OAuth2Client } from 'google-auth-library'
export const runtime = 'edge'

// Initialize Hono app
const app = new Hono().basePath('/api')

// Define environment variables (these should be set in Vercel's environment settings)
const CLIENT_ID = process.env.CLIENT_ID!
const CLIENT_SECRET = process.env.CLIENT_SECRET!
const REDIRECT_URI = process.env.REDIRECT_URI!

const oauth2Client = new OAuth2Client(
	CLIENT_ID,
	CLIENT_SECRET,
	'https://aryas-mail-app.vercel.app/api/'
)

app.get('/callback', async (c) => {
	try {
		// Extract the 'code' from the query parameters
		const { code } = c.req.query()

		// Ensure the 'code' is provided
		if (!code) {
			return c.json({ error: 'No code was provided' }, 400)
		}

		// Exchange the code for tokens
		const { tokens } = await oauth2Client.getToken({
			code,
			redirect_uri: 'http://localhost:8889'
		})

		const { access_token, refresh_token } = tokens

		// Optionally store the tokens securely (e.g., in a session or database)
		// Or send the tokens back to the frontend
		return c.json({ access_token, refresh_token })
	} catch (error) {
		console.error('Error:', error)
		return c.json({ error: `Failed to exchange code: ${error}` }, 500)
	}
})

// app.post('refresh', async (c) => {
// 	try {
// 		// Expect the refresh token to be sent in the request body
// 		const { refresh_token } = await c.req.json()

// 		if (!refresh_token) {
// 			return c.json({ error: 'Missing refresh token' }, 400)
// 		}

// 		// Set the refresh token on the OAuth2 client
// 		oAuth2Client.setCredentials({ refresh_token })

// 		// Refresh the access token
// 		const { credentials } = await oAuth2Client.refreshAccessToken()
// 		const { access_token, expires_in } = credentials

// 		return c.json({
// 			access_token,
// 			expires_in
// 		})
// 	} catch (error) {
// 		console.error('Error refreshing token:', error)
// 		return c.json({ error: 'Failed to refresh token' }, 500)
// 	}
// })

app.get('/done', (c) => {
	return c.text('Close this tab.')
})

// Handle default route
app.get('/', (c) => {
	return c.text('Authentication Server is Running')
})

export const GET = handle(app)
export const POST = handle(app)

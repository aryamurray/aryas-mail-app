import { useGoogleLogin } from '@react-oauth/google'
import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { fetch } from '@tauri-apps/plugin-http'
import { onUrl, start } from '@fabianlars/tauri-plugin-oauth'

const LoginButton = async () => {
	const [port, setPort] = useState<number | undefined>()
	const [url, setUrl] = useState<string>()

	useEffect(() => {
		const startServer = async () => {
			if (port) return
			const newPort = await start()
			setPort(newPort)

			// Set up listeners for OAuth results
			await onUrl(setUrl)
		}
		startServer()
	}, [])

	const login = useGoogleLogin({
		flow: 'auth-code',
		redirect_uri: 'https://localhost:12000',
		onSuccess: async (codeResponse) => {
			console.log('pre-authed code', codeResponse)

			try {
				const response = await fetch(
					'https://aryas-mail-app.vercel.app/api/callback',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							code: codeResponse.code
						})
					}
				)

				const tokens = await response.json()

				console.log('authed Code', tokens)
			} catch (error) {
				console.error('Error Exchanging Code:', error)
			}
		}
	})

	return (
		<button
			onClick={() => login()}
			className='flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground'
		>
			<Plus />
			Add new Account
		</button>
	)
}

export default LoginButton

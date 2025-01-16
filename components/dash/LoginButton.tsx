import { useGoogleLogin } from '@react-oauth/google'
import { Plus } from 'lucide-react'
import React from 'react'
import { fetch } from '@tauri-apps/plugin-http'

const LoginButton = () => {
	const login = useGoogleLogin({
		flow: 'auth-code',
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

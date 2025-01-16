import { useGoogleLogin } from '@react-oauth/google'
import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { fetch } from '@tauri-apps/plugin-http'
import { onUrl, start } from '@fabianlars/tauri-plugin-oauth'

const LoginButton = () => {
	const login = useGoogleLogin({
		flow: 'auth-code',
		redirect_uri: 'https://aryas-mail-app.vercel.app/api/callback'
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

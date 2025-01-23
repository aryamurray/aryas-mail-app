import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import { Plus } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { fetch } from '@tauri-apps/plugin-http'
import { openUrl } from '@tauri-apps/plugin-opener'
import { useRouter } from 'next/navigation'
import {
	start,
	cancel,
	onUrl,
	onInvalidUrl
} from '@fabianlars/tauri-plugin-oauth'
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'
import { URL } from 'url'

interface SingleInstancePayload {
	args: string[]
	cwd: string
}

const LoginButton = () => {
	const [isOAuthServerRunning, setIsOAuthServerRunning] =
		useState<boolean>(false)
	const [isMounted, setIsMounted] = useState(false)
	const [port, setPort] = useState<undefined | number>()

	const login = useGoogleLogin({
		flow: 'auth-code',
		redirect_uri: 'https://aryas-mail-app.vercel.app/api/done',
		onSuccess: async (response) => {
			console.log('Authed and got Code.', response)

			const authResponse = await fetch(
				'https://aryas-mail-app.vercel.app/api/callback',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						code: response.code
					})
				}
			)

			console.log('sent to authserver response', authResponse)
		}
	})

	// const generateGoogleAuthUrl = () => {
	// 	const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
	// 	const params = new URLSearchParams({
	// 		client_id:
	// 			'482323581679-ho9ubqllfa4a2p5n4ph2s395h3p14qsi.apps.googleusercontent.com',
	// 		redirect_uri: `http://localhost:8889`,
	// 		response_type: 'code',
	// 		access_type: 'offline', // Needed for refresh tokens
	// 		include_granted_scopes: 'true',
	// 		prompt: 'consent', // Forces account selection each time
	// 		scope: 'https://www.googleapis.com/auth/userinfo.email'
	// 	})

	// 	return `${baseUrl}?${params.toString()}`
	// }

	const signIn = async () => {
		login()
	}

	const handleOAuthUrl = async (url: string) => {
		console.log('Received OAuth URL:', url)
		const code = new URL(url).searchParams.get('code')
		if (!code) {
			console.error('Could not parse code from return url')
			return
		}
		console.log('Recived Token:', code)
		console.log('Sending for acess and refresh')

		const response = await fetch(
			'https://aryas-mail-app.vercel.app/api/callback',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					code: code
				})
			}
		)

		const tokens = await response.json()

		console.log('authed Code', tokens)
	}

	const startTauriOAuth = async () => {
		if (isOAuthServerRunning) return
		try {
			if (process.env.NODE_ENV === 'production') {
				const { getCurrentWindow } = await import('@tauri-apps/api/window')
				const currentWindow = getCurrentWindow()
				currentWindow.listen('single-instance', ({ event, payload }) => {
					console.log('Received deep link:', event, payload)
					const { args } = payload as SingleInstancePayload
					if (args?.[1]) {
						handleOAuthUrl(args[1])
					}
				})
				await onOpenUrl((urls) => {
					urls.forEach((url) => {
						handleOAuthUrl(url)
					})
				})
			} else {
				const port = await start({ ports: [8889] })
				setIsOAuthServerRunning(true)
				setPort(port)
				console.log(`OAuth server started on port ${port}`)

				await onUrl(handleOAuthUrl)
				await onInvalidUrl((url) => {
					console.log('Received invalid OAuth URL:', url)
				})
			}
		} catch (error) {
			console.error('Error starting OAuth server:', error)
		}
	}

	const stopTauriOAuth = async () => {
		try {
			if (port) {
				await cancel(port)
				console.log('OAuth server stopped')
				setIsOAuthServerRunning(false)
			}
		} catch (error) {
			console.error('Error stopping OAuth server:', error)
		}
	}

	useEffect(() => {
		// Ensure the OAuth server is only started once
		if (!isOAuthServerRunning) {
			startTauriOAuth()
		}
		return () => {
			stopTauriOAuth()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOAuthServerRunning])

	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) {
		return null
	}
	return (
		<button
			onClick={signIn}
			className='flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground'
		>
			<Plus />
			Add new Account
		</button>
	)
}

export default LoginButton

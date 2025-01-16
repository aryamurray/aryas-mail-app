'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { onUrl, start } from '@fabianlars/tauri-plugin-oauth'
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import LoginButton from './LoginButton'

interface AccountSwitcherProps {
	isCollapsed: boolean
	accounts: {
		label: string
		email: string
		icon: React.ReactNode
	}[]
}

export function AccountSwitcher({
	isCollapsed,
	accounts
}: AccountSwitcherProps) {
	const [selectedAccount, setSelectedAccount] = React.useState<string>(
		accounts[0].email
	)

	const handleOnNewUser = async () => {
		const port = await start()

		const GOOGLE_CLIENT_ID =
			'482323581679-ho9ubqllfa4a2p5n4ph2s395h3p14qsi.apps.googleusercontent.com'
		const REDIRECT_URI = encodeURIComponent(`http://localhost:${port}/callback`) // Update with your redirect URI

		onUrl((url) => {
			console.log(url)
		})
	}

	return (
		<>
			<Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
				<SelectTrigger
					className={cn(
						'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
						isCollapsed &&
							'flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden'
					)}
					aria-label='Select account'
				>
					<SelectValue placeholder='Select an account'>
						{
							accounts.find((account) => account.email === selectedAccount)
								?.icon
						}
						<span className={cn('ml-2', isCollapsed && 'hidden')}>
							{
								accounts.find((account) => account.email === selectedAccount)
									?.label
							}
						</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{accounts.map((account) => (
						<SelectItem key={account.email} value={account.email}>
							<div className='flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground'>
								{account.icon}
								{account.email}
							</div>
						</SelectItem>
					))}
					<div
						className={cn(
							'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
						)}
					>
						<LoginButton />
					</div>
				</SelectContent>
			</Select>
		</>
	)
}

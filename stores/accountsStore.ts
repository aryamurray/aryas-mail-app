import create from 'zustand'
import { persist } from 'zustand/middleware'

type accountsStoreT = {}

export const accountsStore = create<accountsStoreT>(
	persist((set) => ({}), { name: 'accounts' })
)

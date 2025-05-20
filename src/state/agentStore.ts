import { create } from 'zustand'
import type { Product } from '@/components/ProductCard'

export interface Message {
  id: string
  text: string
  sentByUser: boolean
}

interface AgentStore {
  messages: Message[]
  step: number
  isOpen: boolean
  products: Product[]
  addMessage: (msg: Omit<Message, 'id'>) => void
  setStep: (step: number) => void
  setIsOpen: (open: boolean) => void
  setProducts: (products: Product[]) => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  messages: [],
  step: 0,
  isOpen: false,
  products: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: Math.random().toString(36).slice(2) },
      ],
    })),
  setStep: (step) => set({ step }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setProducts: (products) => set({ products }),
})) 
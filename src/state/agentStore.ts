import { create } from 'zustand'

export interface Message {
  id: string
  text: string
  sentByUser: boolean
}

interface AgentStore {
  messages: Message[]
  step: number
  isOpen: boolean
  addMessage: (msg: Omit<Message, 'id'>) => void
  setStep: (step: number) => void
  setIsOpen: (open: boolean) => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  messages: [],
  step: 0,
  isOpen: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: Math.random().toString(36).slice(2) },
      ],
    })),
  setStep: (step) => set({ step }),
  setIsOpen: (isOpen) => set({ isOpen }),
})) 
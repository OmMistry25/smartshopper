import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { userId, question, response: agentResponse } = req.body
  if (!question || !agentResponse) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const { error } = await supabase.from('interactions').insert([
    {
      user_id: userId || null,
      question,
      response: agentResponse,
    },
  ])
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  return res.status(200).json({ success: true })
} 
import dotenv from 'dotenv'
import OpenAI from 'openai'
import type { ChatHistoryItem } from './types/index.js'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function getGptMessage(userMessageHistory: ChatHistoryItem[]): Promise<string | null> {
  try {
    const res = await openai.responses.create({
      model: 'gpt-5-nano',
      input: userMessageHistory
    })
    return res.output_text
  } catch (e) {
    console.error(e)
    return null
  }
}

export { getGptMessage }

export type ChatHistoryItem = {
  role: 'user' | 'assistant' | 'system' | 'developer'
  content: string
}
export type UserChatData = {
  userId: string
  history: ChatHistoryItem[]
  createdAt: Date
}

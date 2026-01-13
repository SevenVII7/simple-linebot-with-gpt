import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import type { UserChatData, ChatHistoryItem } from './types/index.js'

dotenv.config()

const client = new MongoClient(process.env.MONGO_URI as string)
const dbName = 'lineBotDB'
const collectionName = 'users'

// 連接資料庫
async function connectDB() {
  await client.connect()
  return client.db(dbName).collection(collectionName)
}

// 1. 檢查並取得對話紀錄
export async function getChatHistory(userId: string): Promise<ChatHistoryItem[]> {
  const collection = await connectDB()
  const user = await collection.findOne({ userId: userId })

  if (!user) {
    // 如果沒有該用戶，新建一筆，並回傳空陣列（對應 AI 的格式）
    await collection.insertOne({
      userId: userId,
      history: [
        {
          role: 'system',
          content: process.env.DEFAULT_CONTENT
        }
      ],
      createdAt: new Date()
    } as UserChatData)
    return []
  }

  return user.history // 回傳存儲的對話陣列
}

// 2. 更新對話紀錄 (覆蓋舊有的紀錄)
export async function updateChatHistory(userId: string, newHistory: ChatHistoryItem[]) {
  const collection = await connectDB()
  await collection.updateOne(
    { userId: userId },
    { $set: { history: newHistory, updatedAt: new Date() } }
  )
}

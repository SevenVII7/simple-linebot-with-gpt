import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
const dbName = 'lineBotDB';
const collectionName = 'users';

// 連接資料庫
async function connectDB() {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

// 1. 檢查並取得對話紀錄
export async function getChatHistory(userId) {
  const collection = await connectDB();
  const user = await collection.findOne({ userId: userId });

  if (!user) {
    // 如果沒有該用戶，新建一筆，並回傳空陣列（對應 AI 的格式）
    await collection.insertOne({
      userId: userId,
      history: [],
      createdAt: new Date()
    });
    return [];
  }

  return user.history; // 回傳存儲的對話陣列
}

// 2. 更新對話紀錄 (覆蓋舊有的紀錄)
export async function updateChatHistory(userId, newHistory) {
  const collection = await connectDB();
  await collection.updateOne(
    { userId: userId },
    { $set: { history: newHistory, updatedAt: new Date() } }
  );
}

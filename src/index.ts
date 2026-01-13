import express from 'express'
import dotenv from 'dotenv'
import * as line from '@line/bot-sdk'
import { getGptMessage } from './openai.js'
import { getChatHistory, updateChatHistory } from './mongo.js'

dotenv.config()

const app = express()

const setting = {
  callName: '77'
}

const MessagingApiClient = line.messagingApi.MessagingApiClient
const client = new MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string
})

app.post(
  '/linewebhook',
  line.middleware({
    channelSecret: process.env.CHANNEL_SECRET as string
  }),
  async (req, res) => {
    const events = req.body.events // webhook event objects from LINE Platform
    // const userId = req.body.destination // user ID of the bot

    const event = events[0]
    const sourceType: 'group' | 'user' = event.source.type
    // const groupId = event.source.groupId
    const userId = event.source.userId
    console.log('收到的事件:', event)

    try {
      // 只處理文字訊息，且必須以 "77" 開頭
      const callNameRegex = new RegExp(`^${setting.callName}\\s`)
      if (!event.message.text || !callNameRegex.test(event.message.text)) return
      const str = event.message.text.replace(callNameRegex, '')

      if (/^\/gpt\s/.test(str)) {
        const message = str.replace(/^\/gpt\s/, '')

        // 取得歷史紀錄
        let history = await getChatHistory(userId)
        console.log('歷史紀錄:', history)

        // 更新使用者訊息到歷史紀錄
        history.push({ role: 'user', content: message })

        // 顯示輸入中動畫 (僅限私聊)
        if (sourceType === 'user') {
          await client.showLoadingAnimation({
            chatId: userId,
            loadingSeconds: 20 // 動畫持續時間 (最多 60 秒)
          })
        }

        // 取得 GPT 回覆
        const aiMessage = await getGptMessage(history)

        // 回覆使用者
        client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: aiMessage || '(GPT 抽風)'
            }
          ]
        })

        // 更新歷史紀錄
        if (aiMessage) {
          history.push({ role: 'assistant', content: aiMessage })
          await updateChatHistory(userId, history)
        }
      } else if (/^\/gpt-reset$/.test(str)) {
        // 重設對話紀錄
        await updateChatHistory(userId, [])
        // 回覆使用者
        client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: '對話紀錄已重設'
            }
          ]
        })
      } else if (/^\/help$/.test(str) || /^\/h$/.test(str)) {
        // 回覆使用者
        client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: `
                    指令說明:\n
                    /gpt <問題> - 問問題\n
                    /gpt-reset - 重設對話紀錄\n
                    /help - 顯示此說明
                `
                .replace(/^\s+/gm, '')
                .trim()
            }
          ]
        })
      }
    } catch (e) {
      console.error(`/linewebhook error: ${e}`)
      // 回覆使用者
      client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: '(壞了)'
          }
        ]
      })
    }
  }
)

app.listen(process.env.PORT)

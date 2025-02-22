import dotenv from "dotenv";
import linebot from "linebot";
import { getGptMessage } from "./openai.js";

dotenv.config()

// 用於辨識Line Channel的資訊
var bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// 當有人傳送訊息給Bot時
bot.on('message', async function (event) {
  // event.message.text是使用者傳給bot的訊息
  // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
  const aiMessage = await getGptMessage(event.message.text)
  event.reply(aiMessage.content)
  // console.log(event, event.message.text, event.message.stickerId, aiMessage)
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT, function () {
  console.log('[BOT已準備就緒]');
});
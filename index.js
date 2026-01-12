import dotenv from "dotenv";
import linebot from "linebot";
import { getGptMessage } from "./openai.js";
import { getChatHistory, updateChatHistory } from "./mongo.js";

dotenv.config()

// 用於辨識Line Channel的資訊
var bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// 當有人傳送訊息給Bot時
bot.on('message', async function (event) {
  const userId = event.source.userId; // 取得 Line User ID
  const userText = event.message.text;

  let history = await getChatHistory(userId);

  console.log("歷史紀錄:", history );

  if(history.length === 0){
    history = {
      role: "system",
      content: process.env.DEFAULT_CONTENT
    }
  } else {
    history.push({ role: "user", content: userText });
  }


  // event.message.text是使用者傳給bot的訊息
  // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
  const aiMessage = await getGptMessage(history)
  const aiText = aiMessage.content

  event.reply(aiText)

  console.log("AI回覆:", aiText);
  // console.log(event, event.message.text, event.message.stickerId, aiMessage)

  history.push({ role: "assistant", content: aiText });

  await updateChatHistory(userId, history);
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT, function () {
  console.log('[BOT已準備就緒]');
});

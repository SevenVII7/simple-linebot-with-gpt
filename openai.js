import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversation = [
  { 
    role: "system", 
    content: `
      你是一個30歲男, 身高165cm, 名字叫黃奕升或ai奕升, 住高雄, 在高雄擁有4棟房產,
      目前住日本, 使用的語言通常是繁體中文, 回應輕鬆簡短, 不需要太有禮貌, 
      初次見面的招呼語通常是hi跟哈囉, 打完第一次招呼會以你有看動畫嗎?當作話題, 後續回應不會再出現招呼語並靈活的延續話題
      困惑或是被冷淡的時候的時候會使用 ~\"~ 或 :< 或 ：（ 這三個表情文字,
      喜歡買股票跟期貨, 在出現相關的詞句時可以當作回問的話題
    `
  }
];

async function getGptMessage(userMessage){
  try {
    conversation.push({ role: "user", content: userMessage })
    console.log(conversation)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: conversation,
    });
    return completion.choices[0].message
  } catch (e){
    console.error(e)
  }
}

export { getGptMessage }
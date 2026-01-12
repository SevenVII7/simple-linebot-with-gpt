import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getGptMessage(userMessageHistory) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      store: true,
      messages: userMessageHistory,
    });
    return completion.choices[0].message
  } catch (e){
    console.error(e)
  }
}

export { getGptMessage }

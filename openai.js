import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversation = [
  { 
    role: "system", 
    content: process.env.DEFAULT_CONTENT
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
import 'dotenv/config'
import { createInterface } from 'readline';

import { OpenAI } from "openai"

import { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    })

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

export const chat = async (messages: ChatCompletionMessageParam[]) => {
  return await openai.chat.completions.create({
    messages: messages,
    // model: 'gpt-3.5-turbo-16k',
    model: 'gpt-4-turbo-preview',
    // tools here should allow for checking the time, the weather, and booking appointments and reservations.
    // it should also have a product catalog/menu and be able to take orders.
    // tools: tools,
    stream: true
  });
}

const history: ChatCompletionMessageParam[] = []

function readFromTerminal() {
  rl.question('User: ', async (input) => {
    history.push({ role: "user", content: input })

    const stream = (await chat(history))

    process.stdout.write('Assistant: ');

    let assistantMessage = ''

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || ''
      process.stdout.write(chunkContent);
      assistantMessage += chunkContent
    }

    process.stdout.write('\n');
    history.push({ role: "assistant", content: assistantMessage })

    readFromTerminal()
  });
}

console.log("Console ChatGPT")
readFromTerminal()

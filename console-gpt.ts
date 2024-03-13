import 'dotenv/config'
import { createInterface } from 'readline';

import { OpenAI } from "openai"

import { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";
import { marked } from 'marked';

import { markedTerminal } from 'marked-terminal';
import ora from 'ora';

if (typeof process.env.OPENAI_API_KEY !== "string" || process.env.OPENAI_API_KEY === "") {
    throw new Error("Please make sure that the OPENAI_API_KEY is set in the environment variables")
}

marked.use(markedTerminal())

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
    model: 'gpt-3.5-turbo-16k',
    // model: 'gpt-4-turbo-preview',
    // tools here should allow for checking the time, the weather, and booking appointments and reservations.
    // it should also have a product catalog/menu and be able to take orders.
    // tools: tools,
    stream: true
  });
}

const history: ChatCompletionMessageParam[] = []

const ASSISTANT_PREFIX = "Assistant: "

function readFromTerminal() {
  rl.question('🙋 User: ', async (input) => {
    history.push({ role: "user", content: input })

    const stream = (await chat(history))

    let assistantMessage = ''

    const spinner = ora({
      text: ASSISTANT_PREFIX, 
      discardStdin: false,
      hideCursor: false, // Cntl+C will not stop the spinner unless this is set https://github.com/sindresorhus/ora/issues/156
  }).start()
    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || ''
      // process.stdout.write(chunkContent);
      assistantMessage += chunkContent
      spinner.text = (ASSISTANT_PREFIX + marked(assistantMessage)).trim();
    }
    spinner.stopAndPersist({
      symbol: '🤖',
      text: (ASSISTANT_PREFIX + marked(assistantMessage)).trim(),
    })

    history.push({ role: "assistant", content: assistantMessage })

    readFromTerminal()
  });
}

console.log("Console ChatGPT")
readFromTerminal()

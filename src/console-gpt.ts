import { createInterface, CompleterResult } from 'readline';

import { OpenAI } from "openai"

import { ChatCompletionMessageParam } from "openai/resources";
import { marked } from 'marked';

import { markedTerminal } from 'marked-terminal';
import ora from 'ora';
import { config } from './parser';

if (typeof process.env.OPENAI_API_KEY !== "string" || process.env.OPENAI_API_KEY === "") {
    throw new Error("Please make sure that the OPENAI_API_KEY is set in the environment variables")
}

marked.use(markedTerminal())

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const getPromptCompletions = (line: string) => `
Given the context of the conversation between the user and the assistant, make 5 guesses what you think the user's next prompt should be.
Respond only with a JSON object of \`{ guesses: <array of strings here> }\`. Each string should be a guess of the user's next prompt.

The user's next prompt should start with the following:

${line}
`.trim()

let suggestedCompletions: string[] = []

let lastTab: {
  time: Date
  line: string
} | undefined = undefined

const getOpenAiCompletions = async (line: string, model: string) => {
  const response = await openai.chat.completions.create({
    messages: [
      ...history,
      {
        role: 'system',
        content: getPromptCompletions(line)
      }
    ],
    model: model,
    response_format: {type: "json_object"},
  });
  const content = response.choices[0].message.content

  if (typeof content !== 'string') {
    return []
  }
  // console.log("CONTENT", content)

  const completions: {guesses: string[]} = JSON.parse(content)
  // console.log('COMPLETIONS', completions)

  return completions.guesses
}

let lastLineCheck: string | undefined = undefined

const completerBase = async (line: string, config: { model: string }) => {
  if (!lastLineCheck || line === "" || line === lastLineCheck) {
    const guesses = await getOpenAiCompletions(line, config.model)
    suggestedCompletions.push(...guesses)
    const hits = suggestedCompletions.filter((c) => c.startsWith(line))
    lastLineCheck = line
    return [hits.length ? hits : guesses, line] satisfies [string[], string]
  } else {
    const hits = suggestedCompletions.filter((c) => c.startsWith(line))
    lastLineCheck = line
    return [hits.length ? hits : suggestedCompletions, line] satisfies [string[], string]
  }
}

const completer = (line: string, callback: (err?: null | Error, result?: CompleterResult) => void) => {
  completerBase(line).then((completions) => {
    callback(null, completions)
  }).catch((err) => {
    callback(err)
  })
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer
});

const chat = async (messages: ChatCompletionMessageParam[], model: string) => {
  return await openai.chat.completions.create({
    messages: messages,
    model: model,
    // model: 'gpt-4-turbo-preview',
    // tools here should allow for checking the time, the weather, and booking appointments and reservations.
    // it should also have a product catalog/menu and be able to take orders.
    // tools: tools,
    stream: true
  });
}

const history: ChatCompletionMessageParam[] = []

const ASSISTANT_PREFIX = "Assistant: "

const getText = (assistantMessage: string, useMarkdown: boolean) => {
  if (useMarkdown) {
    return (ASSISTANT_PREFIX + marked(assistantMessage)).trim()
  } else {
    return (ASSISTANT_PREFIX + assistantMessage).trim()
  }
}

function readFromTerminal(config: { useMarkdown: boolean, model: string }) {
  rl.question('🙋 User: ', async (input) => {
    history.push({ role: "user", content: input })

    const stream = (await chat(history, config.model))

    let assistantMessage = ''

    const spinner = ora({
      text: ASSISTANT_PREFIX, 

      // Cntl+C will not stop the spinner unless this is set https://github.com/sindresorhus/ora/issues/156
      discardStdin: false,
      hideCursor: false, 
    }).start()

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || ''
      // process.stdout.write(chunkContent);
      assistantMessage += chunkContent
      spinner.text = getText(assistantMessage, config.useMarkdown);
    }
    spinner.stopAndPersist({
      symbol: '🤖',
      text: getText(assistantMessage, config.useMarkdown),
    })

    history.push({ role: "assistant", content: assistantMessage })
    lastLineCheck = undefined
    suggestedCompletions = []

    readFromTerminal(config)
  });
}

export const start = async () => {
  readFromTerminal(await config())
}
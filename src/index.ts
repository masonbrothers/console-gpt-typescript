#!/usr/bin/env npx tsx

import 'dotenv/config'

import { argv } from './parser'
import { readFromTerminal } from './console-gpt'

const getModel = (argvValue: string) => {
  if (argvValue === "3.5") {
    return "gpt-3.5-turbo-0125"
  } else if (argvValue === "4") {
    return "gpt-4-turbo-preview"
  }
  throw new Error("Invalid model")
}

const getFormat = (argvValue: string) => {
  if (argvValue === "text") {
    return "text"
  } else if (argvValue === "markdown") {
    return "markdown"
  }
  throw new Error("Invalid format")
}

const main = async () => {
  console.log("Console GPT")

  const props = (await argv)

  const model: 'gpt-4-turbo-preview' | 'gpt-3.5-turbo-0125' = getModel(props.model)

  readFromTerminal({
    useMarkdown: getFormat(props.format) === "markdown",
    model, 
  })
}

main()
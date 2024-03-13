#!/usr/bin/env npx tsx

import 'dotenv/config'

import { start } from './console-gpt'

const main = async () => {
  console.log("Console GPT")
  start()
}

main()
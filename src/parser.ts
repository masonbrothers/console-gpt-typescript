import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

export const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
    .example('$0 -f markdown -m 4', 'Run with GPT-4 and output in markdown')
    .version('0.1.0')
    .option('format', {
      description: 'Choose the format type of the output',
      choices: ['markdown', 'text'],
      demandOption: false,
      describe: "The format that will be outputted by the assistant",
      alias: "f",
      default: 'markdown',
      type: 'string' // Specify the type of the argument
    })
    .option('model', {
      description: 'Choose a model',
      choices: ['3.5', '4'],
      demandOption: false,
      describe: "The model to use with OpenAI. 3.5 is GPT-3.5 and 4 is GPT-4",
      alias: "m",
      default: '4',
      type: 'string' // Specify the type of the argument
    })
    .parse();

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


export const config = async () => {
  const props = await argv

  const model: 'gpt-4-turbo-preview' | 'gpt-3.5-turbo-0125' = getModel(props.model)
  return {
    useMarkdown: getFormat(props.format) === "markdown",
    model, 
  }
}
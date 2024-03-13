import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

export const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
    .command('text', 'output in plaintext instead of markdown')
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

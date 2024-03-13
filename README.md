# ConsoleGPT in TypeScript

Sometimes you want to use GPT-4 in your console. This allows you to do that!

## Setup

### Quickstart

```bash
npm i git+https://github.com/masonbrothers/console-gpt-typescript.git -g
```

Set your `OPENAI_API_KEY` in `.env` or as an environment variable. You can copy `.env.example` as a template. If you use the `.env` file, the script will only work in the current directory.

Then run:
```bash
console-gpt
```

### Usage
```
Usage: console-gpt <command> [options]

Commands:
  console-gpt text  output in plaintext instead of markdown

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -f, --format   The format that will be outputted by the assistant
                    [string] [choices: "markdown", "text"] [default: "markdown"]
  -m, --model    The model to use with OpenAI. 3.5 is GPT-3.5 and 4 is GPT-4
                                   [string] [choices: "3.5", "4"] [default: "4"]

Examples:
  console-gpt -f markdown -m 4  Run with GPT-4 and output in markdown
```

### Development
```bash
pnpm install
pnpm start
```

# 🔢 tokmeter

> **Ultra-fast token counter for files and text - supports GPT models, Claude, and more!**

[![npm version](https://badge.fury.io/js/tokmeter.svg)](https://badge.fury.io/js/tokmeter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)

**tokmeter** is the simplest, fastest, and most beautiful CLI tool for counting tokens in your files. Perfect for developers working with AI models, managing token budgets, and optimizing prompts.

## ✨ Features

- ⚡ **Ultra-simple** - No subcommands! Just `tokmeter file.txt` or `tokmeter "text"`
- 🚀 **Ultra-fast** - Built on the fastest JavaScript tokenizer
- 🎯 **Accurate** - Uses OpenAI's official tokenization (via [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer))
- 🌈 **Beautiful output** - Colorful, clear, and informative displays
- 📁 **Batch processing** - Count tokens in files, directories, or entire projects
- 🎛️ **Flexible** - Support for multiple AI models (GPT-4o, Claude, etc.)
- 💰 **Cost estimation** - See estimated API costs for your tokens
- 🔧 **Customizable** - Ignore patterns, file extensions, recursive scanning
- 📊 **Multiple formats** - Human-readable or JSON output
- 🪶 **Lightweight** - Minimal dependencies, fast installation

## 🚀 Quick Start

```bash
# Install globally
npm install -g tokmeter

# Count tokens in files
tokmeter file1.txt file2.js

# Count tokens in directories
tokmeter ./src --recursive

# Count tokens in text
tokmeter "Hello, world!"

# Count tokens from stdin
echo "Hello, world!" | tokmeter

# See all options
tokmeter --help
```

## 📦 Installation

```bash
# Global installation (recommended)
npm install -g tokmeter

# Local installation
npm install tokmeter

# Use without installation
npx tokmeter count myfile.txt
```

## 🎯 Usage Examples

### Count tokens in files

```bash
# Count tokens in a single file
tokmeter README.md

# Multiple files
tokmeter src/app.js src/utils.js

# Entire directory (non-recursive)
tokmeter ./src

# Recursive directory scanning
tokmeter ./src --recursive

# Specific file extensions only
tokmeter ./src --recursive --extensions ".js,.ts,.jsx"
```

### Count tokens in text

```bash
# Direct text input
tokmeter "Hello, world! How are you today?"

# From stdin
echo "Your text here" | tokmeter

# From file content
cat myfile.txt | tokmeter
```

### Advanced usage

```bash
# Use different AI model
tokmeter ./docs --model gpt-4

# JSON output for automation
tokmeter ./src --json > tokens.json

# Summary only (no file details)
tokmeter ./large-project --summary

# Custom ignore patterns
tokmeter ./ --ignore "*.min.js,dist,build"

# Verbose output
tokmeter ./src --verbose

# List supported models
tokmeter --models
```

## 🤖 Supported Models

```bash
# See all supported models
tokmeter --models
```

Currently supported:

- **GPT models**: `gpt-4o`, `gpt-4o-mini`, `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`
- **Legacy models**: `text-davinci-003`, `text-davinci-002`
- **Claude models**: `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`

## 📊 Sample Output

```bash
$ tokmeter README.md src/app.js src/utils.js

🔢 TOKMETER - File Token Counter
Using model: gpt-4o
──────────────────────────────────────────────────

📄 File Details:
  /home/user/project/README.md
    Tokens: 1,247 | Size: 4.2 KB
  /home/user/project/src/app.js
    Tokens: 892 | Size: 3.1 KB
  /home/user/project/src/utils.js
    Tokens: 445 | Size: 1.8 KB

📊 Summary:
  Files processed: 3
  Total tokens: 2,584
  Estimated cost: $0.0065
```

## 🛠️ CLI Reference

### Usage

```bash
tokmeter [inputs...] [options]
```

**inputs**: Files, directories, or text to count tokens in (reads from stdin if empty)

### Options

| Option                    | Description                  | Default                                 |
| ------------------------- | ---------------------------- | --------------------------------------- |
| `-m, --model <model>`     | Model for tokenization       | `gpt-4o`                                |
| `-r, --recursive`         | Scan directories recursively | `false`                                 |
| `-e, --extensions <exts>` | File extensions to include   | Auto-detect                             |
| `-i, --ignore <patterns>` | Patterns to ignore           | `node_modules,*.min.js,.git,dist,build` |
| `-s, --summary`           | Show summary only            | `false`                                 |
| `-j, --json`              | Output as JSON               | `false`                                 |
| `-v, --verbose`           | Verbose output               | `false`                                 |
| `--models`                | List supported models        | -                                       |

## 🔧 Programmatic Usage

You can also use tokmeter as a library in your Node.js projects:

```javascript
const { countTokensInText, countTokensInFiles } = require('tokmeter')

// Count tokens in text
const result = countTokensInText('Hello, world!', 'gpt-4o')
console.log(`Tokens: ${result.tokens}`)

// Count tokens in files
const fileResults = await countTokensInFiles(['./src'], {
  model: 'gpt-4o',
  recursive: true,
  extensions: ['.js', '.ts']
})
console.log(`Total tokens: ${fileResults.summary.totalTokens}`)
```

### API Reference

#### `countTokensInText(text, model)`

- **text** `string` - Text to count tokens in
- **model** `string` - Model to use (default: 'gpt-4o')
- **Returns** `object` - Result with token count, characters, and cost estimate

#### `countTokensInFiles(paths, options)`

- **paths** `string[]` - Array of file or directory paths
- **options** `object` - Configuration options
  - `model` `string` - Model to use
  - `recursive` `boolean` - Scan directories recursively
  - `extensions` `string[]` - File extensions to include
  - `ignore` `string[]` - Patterns to ignore
  - `verbose` `boolean` - Enable verbose output
- **Returns** `Promise<object>` - Results with file details and summary

## 💡 Use Cases

- **AI Development** - Count tokens before sending to APIs
- **Cost Management** - Estimate API costs for large documents
- **Content Analysis** - Analyze token distribution in codebases
- **Prompt Engineering** - Optimize prompts within token limits
- **Documentation** - Track documentation size and complexity
- **Code Review** - Understand token impact of changes

## 🎨 Why tokmeter?

| Feature         | tokmeter      | Others        |
| --------------- | ------------- | ------------- |
| Speed           | ⚡ Ultra-fast | 🐌 Slow       |
| Output          | 🌈 Beautiful  | 📝 Plain text |
| Models          | 🤖 10+ models | 🤖 Limited    |
| Cost estimation | 💰 Built-in   | ❌ Missing    |
| File handling   | 📁 Advanced   | 📄 Basic      |
| CLI experience  | ✨ Modern     | 🔧 Basic      |

## 🔍 File Type Support

tokmeter automatically detects and processes these file types:

**Programming**: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`, `.h`, `.go`, `.rs`, `.php`, `.rb`, `.swift`, `.kt`, `.scala`, `.cs`, `.vb`

**Web**: `.html`, `.css`, `.json`, `.xml`

**Data**: `.yaml`, `.yml`, `.sql`

**Documentation**: `.md`, `.txt`

**Scripts**: `.sh`, `.bash`

**Others**: `.r`, `.m`

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **🐛 Report bugs** - Found an issue? [Open an issue](https://github.com/sandy-mount/tokmeter/issues)
2. **💡 Suggest features** - Have an idea? [Start a discussion](https://github.com/sandy-mount/tokmeter/discussions)
3. **🔧 Submit PRs** - Fix bugs or add features
4. **📖 Improve docs** - Help make our documentation better
5. **⭐ Star us** - Show your support!

## 📄 License

MIT © [Sandy Mount](https://github.com/sandy-mount)

## 🙏 Credits

- Built with [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer) - The fastest JavaScript tokenizer
- Inspired by the need for simple, beautiful token counting tools
- Made with ❤️ for the AI developer community

---

**⭐ If tokmeter helped you, please star the repo!**

[![GitHub stars](https://img.shields.io/github/stars/sandy-mount/tokmeter.svg?style=social&label=Star)](https://github.com/sandy-mount/tokmeter)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/sandy-mount/tokmeter.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20tokmeter%20-%20the%20fastest%20token%20counter%20for%20AI%20developers!&url=https://github.com/sandy-mount/tokmeter)

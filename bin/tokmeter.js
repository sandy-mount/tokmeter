#!/usr/bin/env node

const { program } = require('commander');
const { countTokensInFiles, countTokensInText, getSupportedModels } = require('../lib/index.js');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const package = require('../package.json');

program
  .name('tokmeter')
  .description('🔢 Ultra-fast token counter for files and text')
  .version(package.version)
  .argument('[inputs...]', 'Files, directories, or text to count tokens in (reads from stdin if empty)')
  .option('-m, --model <model>', 'Model to use for tokenization', 'gpt-4o')
  .option('-r, --recursive', 'Recursively search directories')
  .option('-e, --extensions <exts>', 'File extensions to include (comma-separated)', '')
  .option('-i, --ignore <patterns>', 'Patterns to ignore (comma-separated)', 'node_modules,*.min.js,.git,dist,build')
  .option('-s, --summary', 'Show summary only')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Verbose output')
  .option('--models', 'List supported models')
  .action(async (inputs, options) => {
    try {
      // Handle --models flag
      if (options.models) {
        const models = getSupportedModels();
        console.log(chalk.blue.bold('🤖 Supported Models:'));
        console.log(chalk.gray('─'.repeat(50)));
        models.forEach(model => {
          console.log(chalk.green(`  ${model}`));
        });
        return;
      }

      // If no inputs provided, read from stdin
      if (!inputs || inputs.length === 0) {
        const stdinText = await readStdin();
        if (!stdinText.trim()) {
          console.log(chalk.red.bold('❌ No input provided. Use --help for usage information.'));
          process.exit(1);
        }
        await handleTextInput(stdinText, options);
        return;
      }

      // Determine if inputs are files/directories or text
      const isTextInput = await determineInputType(inputs);

      if (isTextInput) {
        // Treat as text input
        const text = inputs.join(' ');
        await handleTextInput(text, options);
      } else {
        // Treat as file/directory paths
        await handleFileInput(inputs, options);
      }

    } catch (error) {
      console.error(chalk.red.bold('❌ Error:'), error.message);
      process.exit(1);
    }
  });

async function determineInputType (inputs) {
  // If any input looks like a file path that exists, treat as files
  for (const input of inputs) {
    try {
      if (fs.existsSync(input)) {
        return false; // It's a file/directory
      }
    } catch (error) {
      // Ignore errors, continue checking
    }
  }

  // If inputs contain file-like patterns, treat as files
  for (const input of inputs) {
    if (input.includes('/') || input.includes('\\') || input.includes('.')) {
      // Could be a file path that doesn't exist yet
      return false;
    }
  }

  // Otherwise, treat as text
  return true;
}

async function handleTextInput (text, options) {
  const result = countTokensInText(text, options.model);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(chalk.blue.bold('🔢 TOKMETER - Text Token Count'));
  console.log(chalk.gray(`Using model: ${options.model}`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`Text length: ${chalk.green.bold(text.length.toLocaleString())} characters`));
  console.log(chalk.white(`Token count: ${chalk.green.bold(result.tokens.toLocaleString())} tokens`));

  if (result.estimatedCost) {
    console.log(chalk.white(`Estimated cost: ${chalk.green.bold('$' + result.estimatedCost.toFixed(4))}`));
  }
}

async function handleFileInput (paths, options) {
  console.log(chalk.blue.bold('🔢 TOKMETER - File Token Counter'));
  console.log(chalk.gray(`Using model: ${options.model}`));
  console.log(chalk.gray('─'.repeat(50)));

  const results = await countTokensInFiles(paths, {
    model: options.model,
    recursive: options.recursive,
    extensions: options.extensions ? options.extensions.split(',').map(e => e.trim()) : [],
    ignore: options.ignore ? options.ignore.split(',').map(p => p.trim()) : [],
    verbose: options.verbose
  });

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Display results
  let totalTokens = 0;
  let totalFiles = 0;

  if (!options.summary) {
    console.log(chalk.yellow.bold('\n📄 File Details:'));
    results.files.forEach(file => {
      const tokens = file.tokens.toLocaleString();
      const size = formatBytes(file.size);
      console.log(chalk.green(`  ${file.path}`));
      console.log(chalk.gray(`    Tokens: ${tokens} | Size: ${size}`));
      totalTokens += file.tokens;
      totalFiles++;
    });
  } else {
    totalTokens = results.summary.totalTokens;
    totalFiles = results.summary.totalFiles;
  }

  // Summary
  console.log(chalk.blue.bold('\n📊 Summary:'));
  console.log(chalk.white(`  Files processed: ${chalk.green.bold(totalFiles.toLocaleString())}`));
  console.log(chalk.white(`  Total tokens: ${chalk.green.bold(totalTokens.toLocaleString())}`));

  if (results.summary.estimatedCost) {
    console.log(chalk.white(`  Estimated cost: ${chalk.green.bold('$' + results.summary.estimatedCost.toFixed(4))}`));
  }

  if (results.errors && results.errors.length > 0) {
    console.log(chalk.red.bold('\n⚠️  Errors:'));
    results.errors.forEach(error => {
      console.log(chalk.red(`  ${error}`));
    });
  }
}

// Helper functions
function formatBytes (bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function readStdin () {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

program.parse(); 
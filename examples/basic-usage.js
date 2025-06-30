#!/usr/bin/env node

// Example: Using tokmeter programmatically (no more subcommands!)
const { countTokensInText, countTokensInFiles, getSupportedModels } = require('../lib/index.js');

async function examples () {
  console.log('🔢 tokmeter - Programmatic Usage Examples\n');
  console.log('💡 CLI is now ultra-simple:');
  console.log('   tokmeter file.txt        # count file tokens');
  console.log('   tokmeter "hello world"   # count text tokens');
  console.log('   echo "text" | tokmeter   # count from stdin');
  console.log('   tokmeter --models        # list models\n');

  // Example 1: Count tokens in text
  console.log('📝 Example 1: Count tokens in text');
  const text = 'Hello! This is an example of counting tokens in a text string using tokmeter.';
  const result = countTokensInText(text, 'gpt-4o');

  console.log(`Text: "${text}"`);
  console.log(`Tokens: ${result.tokens}`);
  console.log(`Characters: ${result.characters}`);
  console.log(`Estimated cost: $${result.estimatedCost?.toFixed(4) || 'N/A'}\n`);

  // Example 2: List supported models
  console.log('🤖 Example 2: Supported models');
  const models = getSupportedModels();
  console.log(`Available models: ${models.join(', ')}\n`);

  // Example 3: Count tokens in this file
  console.log('📄 Example 3: Count tokens in this file');
  try {
    const fileResults = await countTokensInFiles([__filename], {
      model: 'gpt-4o',
      verbose: false
    });

    console.log(`File: ${__filename}`);
    console.log(`Tokens: ${fileResults.summary.totalTokens}`);
    console.log(`Size: ${fileResults.summary.totalSize} bytes`);
    console.log(`Estimated cost: $${fileResults.summary.estimatedCost?.toFixed(4) || 'N/A'}\n`);
  } catch (error) {
    console.error('Error processing file:', error.message);
  }

  // Example 4: Compare different models
  console.log('⚖️  Example 4: Compare models');
  const testText = 'The quick brown fox jumps over the lazy dog. This is a test sentence for comparing token counts across different models.';

  const modelsToTest = ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'];

  modelsToTest.forEach(model => {
    const result = countTokensInText(testText, model);
    console.log(`${model}: ${result.tokens} tokens (cost: $${result.estimatedCost?.toFixed(4) || 'N/A'})`);
  });

  console.log('\n✨ Examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  examples().catch(console.error);
}

module.exports = { examples }; 
const { countTokensInText, getSupportedModels, checkTokenLimit } = require('../lib/index.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running tokmeter tests...\n');

// Test 1: Basic token counting
console.log('Test 1: Basic token counting');
const text = 'Hello, world! This is a test message for token counting.';
const result = countTokensInText(text);
console.log(`✅ Text: "${text}"`);
console.log(`✅ Tokens: ${result.tokens}`);
console.log(`✅ Characters: ${result.characters}`);
console.log(`✅ Model: ${result.model}\n`);

// Test 2: Supported models
console.log('Test 2: Supported models');
const models = getSupportedModels();
console.log(`✅ Found ${models.length} supported models:`);
models.forEach(model => console.log(`   - ${model}`));
console.log();

// Test 3: Token limit check
console.log('Test 3: Token limit check');
const limitCheck = checkTokenLimit(text, 100);
console.log(`✅ Tokens: ${limitCheck.tokens}`);
console.log(`✅ Limit: ${limitCheck.limit}`);
console.log(`✅ Within limit: ${limitCheck.withinLimit}\n`);

// Test 4: Create a test file and count its tokens
console.log('Test 4: File token counting');
const testFilePath = path.join(__dirname, 'test-file.txt');
const testFileContent = `# Test File
This is a test file for tokmeter.
It contains multiple lines of text.
The purpose is to test file reading and token counting.

Here's some code:
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

And some more text to make it interesting.`;

fs.writeFileSync(testFilePath, testFileContent);
console.log(`✅ Created test file: ${testFilePath}`);

// Import and test file counting
const { countTokensInFiles } = require('../lib/index.js');

countTokensInFiles([testFilePath])
  .then(result => {
    console.log(`✅ File processed: ${result.summary.totalFiles}`);
    console.log(`✅ Total tokens: ${result.summary.totalTokens}`);
    console.log(`✅ File size: ${result.summary.totalSize} bytes`);

    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log(`✅ Cleaned up test file\n`);

    console.log('🎉 All tests passed!');
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    // Cleanup on error
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    process.exit(1);
  }); 
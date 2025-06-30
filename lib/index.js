const { encode, decode, countTokens, isWithinTokenLimit } = require('gpt-tokenizer');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Supported models and their approximate costs per 1K tokens (input)
const MODEL_COSTS = {
  'gpt-4o': 0.0025,
  'gpt-4o-mini': 0.00015,
  'gpt-4': 0.03,
  'gpt-4-turbo': 0.01,
  'gpt-3.5-turbo': 0.0015,
  'text-davinci-003': 0.02,
  'text-davinci-002': 0.02,
  'claude-3-opus': 0.015,
  'claude-3-sonnet': 0.003,
  'claude-3-haiku': 0.00025
};

// Default file extensions to process
const DEFAULT_EXTENSIONS = [
  '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
  '.css', '.html', '.json', '.xml', '.yaml', '.yml', '.go', '.rs', '.php', '.rb',
  '.swift', '.kt', '.scala', '.sh', '.bash', '.sql', '.r', '.m', '.cs', '.vb'
];

/**
 * Count tokens in text using specified model
 * @param {string} text - Text to count tokens in
 * @param {string} model - Model to use for tokenization
 * @returns {object} Result object with token count and metadata
 */
function countTokensInText (text, model = 'gpt-4o') {
  try {
    const tokens = countTokens(text);
    const estimatedCost = calculateCost(tokens, model);

    return {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      tokens,
      characters: text.length,
      model,
      estimatedCost
    };
  } catch (error) {
    throw new Error(`Failed to count tokens: ${error.message}`);
  }
}

/**
 * Count tokens in files
 * @param {string[]} paths - Array of file or directory paths
 * @param {object} options - Options for processing
 * @returns {Promise<object>} Results object with file details and summary
 */
async function countTokensInFiles (paths, options = {}) {
  const {
    model = 'gpt-4o',
    recursive = false,
    extensions = DEFAULT_EXTENSIONS,
    ignore = ['node_modules', '*.min.js', '.git', 'dist', 'build'],
    verbose = false
  } = options;

  const files = [];
  const errors = [];
  let totalTokens = 0;
  let totalFiles = 0;
  let totalSize = 0;

  // Get all files to process
  const filesToProcess = await getFilesToProcess(paths, {
    recursive,
    extensions,
    ignore,
    verbose
  });

  if (verbose) {
    console.log(`Found ${filesToProcess.length} files to process`);
  }

  // Process each file
  for (const filePath of filesToProcess) {
    try {
      const result = await processFile(filePath, model);
      files.push(result);
      totalTokens += result.tokens;
      totalFiles++;
      totalSize += result.size;

      if (verbose) {
        console.log(`Processed: ${filePath} (${result.tokens} tokens)`);
      }
    } catch (error) {
      errors.push(`${filePath}: ${error.message}`);
      if (verbose) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  }

  const estimatedCost = calculateCost(totalTokens, model);

  return {
    files,
    summary: {
      totalFiles,
      totalTokens,
      totalSize,
      model,
      estimatedCost
    },
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Get list of files to process based on paths and options
 */
async function getFilesToProcess (paths, options) {
  const { recursive, extensions, ignore } = options;
  const allFiles = new Set();

  for (const inputPath of paths) {
    try {
      const stat = fs.statSync(inputPath);

      if (stat.isFile()) {
        if (shouldProcessFile(inputPath, extensions, ignore)) {
          allFiles.add(path.resolve(inputPath));
        }
      } else if (stat.isDirectory()) {
        const pattern = recursive ? '**/*' : '*';
        const globPattern = path.join(inputPath, pattern);

        const files = glob.sync(globPattern, {
          nodir: true,
          ignore: ignore.map(pattern =>
            pattern.includes('/') ? pattern : `**/${pattern}/**`
          )
        });

        files.forEach(file => {
          if (shouldProcessFile(file, extensions, ignore)) {
            allFiles.add(path.resolve(file));
          }
        });
      }
    } catch (error) {
      throw new Error(`Cannot access path "${inputPath}": ${error.message}`);
    }
  }

  return Array.from(allFiles).sort();
}

/**
 * Check if file should be processed based on extension and ignore patterns
 */
function shouldProcessFile (filePath, extensions, ignore) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  // Check ignore patterns
  for (const pattern of ignore) {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(basename) || regex.test(filePath)) {
        return false;
      }
    } else if (filePath.includes(pattern) || basename === pattern) {
      return false;
    }
  }

  // Check extensions
  if (extensions.length > 0) {
    return extensions.some(allowedExt =>
      allowedExt.toLowerCase() === ext
    );
  }

  // Default: process common text file extensions
  return DEFAULT_EXTENSIONS.includes(ext);
}

/**
 * Process a single file and return token count information
 */
async function processFile (filePath, model) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const stat = fs.statSync(filePath);
    const tokens = countTokens(content);

    return {
      path: filePath,
      tokens,
      size: stat.size,
      model,
      lastModified: stat.mtime
    };
  } catch (error) {
    if (error.code === 'EISDIR') {
      throw new Error('Is a directory');
    } else if (error.code === 'ENOENT') {
      throw new Error('File not found');
    } else if (error.code === 'EACCES') {
      throw new Error('Permission denied');
    } else {
      throw new Error(`Cannot read file: ${error.message}`);
    }
  }
}

/**
 * Calculate estimated cost based on token count and model
 */
function calculateCost (tokens, model) {
  const costPer1K = MODEL_COSTS[model];
  if (!costPer1K) {
    return null; // Unknown model
  }
  return (tokens / 1000) * costPer1K;
}

/**
 * Get list of supported models
 */
function getSupportedModels () {
  return Object.keys(MODEL_COSTS);
}

/**
 * Check if text is within token limit for a model
 */
function checkTokenLimit (text, limit = 4096, model = 'gpt-4o') {
  const tokens = countTokens(text);
  return {
    tokens,
    limit,
    withinLimit: tokens <= limit,
    model
  };
}

module.exports = {
  countTokensInText,
  countTokensInFiles,
  getSupportedModels,
  checkTokenLimit,
  encode,
  decode,
  countTokens,
  isWithinTokenLimit
}; 
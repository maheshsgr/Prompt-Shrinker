import { estimateTokens, SlimResult } from './jsonSlimmer';

export interface LogSlimOptions {
  compressionLevel: 'low' | 'medium' | 'aggressive';
  preservePatterns: string[];
  maxStackDepth: number;
}

// Common patterns for different types of logs
const ERROR_PATTERNS = [
  /^.*?Error:/i,
  /^.*?Exception:/i,
  /^.*?Failed:/i,
  /^.*?Fatal:/i,
  /^\s*at\s+.*?\(.*?:\d+:\d+\)/,  // Stack trace lines
  /^\s*at\s+.*?:\d+:\d+/,         // Simple stack lines
  /File ".*?", line \d+/,         // Python traceback
  /^\s*\^\s*$/,                   // Error pointer lines
];

const FRAMEWORK_NOISE = [
  /node_modules/,
  /webpack/i,
  /babel/i,
  /internal\/process/,
  /internal\/modules/,
  /^\s*at\s+Module\._/,
  /^\s*at\s+Object\.<anonymous>/,
  /^\s*at\s+require\s*\(/,
  /^\s*at\s+Function\.Module\._load/,
];

const TIMESTAMP_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/,
  /^\[\d{4}-\d{2}-\d{2}/,
  /^\d{2}:\d{2}:\d{2}/,
];

function extractErrorInfo(line: string): { isError: boolean; isStackTrace: boolean; isFrameworkNoise: boolean } {
  const isError = ERROR_PATTERNS.some(pattern => pattern.test(line));
  const isStackTrace = /^\s*at\s+/.test(line);
  const isFrameworkNoise = FRAMEWORK_NOISE.some(pattern => pattern.test(line));
  
  return { isError, isStackTrace, isFrameworkNoise };
}

function cleanTimestamp(line: string): string {
  return line.replace(TIMESTAMP_PATTERNS[0], '')
             .replace(TIMESTAMP_PATTERNS[1], '')
             .replace(TIMESTAMP_PATTERNS[2], '')
             .trim();
}

function findRelevantLines(lines: string[], options: LogSlimOptions): string[] {
  const relevantLines: string[] = [];
  const { compressionLevel, maxStackDepth } = options;
  
  let stackDepth = 0;
  let foundMainError = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const { isError, isStackTrace, isFrameworkNoise } = extractErrorInfo(line);
    
    // Always keep explicit error declarations
    if (isError && !isStackTrace) {
      relevantLines.push(line);
      foundMainError = true;
      stackDepth = 0;
      continue;
    }
    
    // Handle stack traces
    if (isStackTrace) {
      if (!foundMainError) {
        relevantLines.push(line);
        continue;
      }
      
      // Skip framework noise for medium/aggressive compression
      if (compressionLevel !== 'low' && isFrameworkNoise) {
        continue;
      }
      
      // Limit stack depth
      if (stackDepth < maxStackDepth) {
        relevantLines.push(line);
        stackDepth++;
      } else if (stackDepth === maxStackDepth) {
        relevantLines.push('    ... (remaining stack trace truncated)');
        stackDepth++;
      }
      continue;
    }
    
    // Check for user-defined preserve patterns
    if (options.preservePatterns.some(pattern => line.includes(pattern))) {
      relevantLines.push(line);
      continue;
    }
    
    // For aggressive compression, be very selective
    if (compressionLevel === 'aggressive') {
      // Only keep lines that seem like actual error messages
      if (line.toLowerCase().includes('error') || 
          line.toLowerCase().includes('failed') ||
          line.toLowerCase().includes('exception')) {
        relevantLines.push(line);
      }
    } else if (compressionLevel === 'medium') {
      // Keep more context but still filter noise
      if (!isFrameworkNoise) {
        relevantLines.push(line);
      }
    } else {
      // Low compression - keep most lines
      relevantLines.push(line);
    }
  }
  
  return relevantLines;
}

export function slimLogs(logText: string, options: LogSlimOptions): SlimResult {
  const lines = logText.split('\n');
  const relevantLines = findRelevantLines(lines, options);
  
  // Clean up timestamps and extra whitespace
  const cleanedLines = relevantLines.map(line => {
    let cleaned = cleanTimestamp(line);
    // Normalize whitespace but preserve indentation structure
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  });
  
  // Remove consecutive duplicate lines
  const deduplicatedLines = cleanedLines.filter((line, index) => {
    if (index === 0) return true;
    return line !== cleanedLines[index - 1];
  });
  
  const slimmedText = deduplicatedLines.join('\n');
  const originalTokens = estimateTokens(logText);
  const slimmedTokens = estimateTokens(slimmedText);
  
  return {
    original: logText,
    slimmed: slimmedText,
    originalTokens,
    slimmedTokens,
    compressionRatio: originalTokens > 0 ? (originalTokens - slimmedTokens) / originalTokens : 0
  };
}
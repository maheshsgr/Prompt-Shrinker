export interface JsonSlimOptions {
  compressionLevel: 'low' | 'medium' | 'aggressive';
  maxArraySamples: number;
  preserveKeys: string[];
}

export interface SlimResult {
  original: string;
  slimmed: string;
  originalTokens: number;
  slimmedTokens: number;
  compressionRatio: number;
}

// Simple token estimator (approximation for GPT models)
export function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  // JSON tends to be more token-dense, so we use 3.5 characters per token
  return Math.ceil(text.length / 3.5);
}

// Get unique object structure from array
function getUniqueStructures(arr: any[], maxSamples: number): any[] {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  
  const structures = new Map<string, any>();
  
  for (let i = 0; i < Math.min(arr.length, maxSamples * 3); i++) {
    const item = arr[i];
    if (typeof item === 'object' && item !== null) {
      const signature = JSON.stringify(Object.keys(item).sort());
      if (!structures.has(signature)) {
        structures.set(signature, item);
      }
    } else {
      // For primitive types, just keep unique values
      const signature = typeof item + ':' + String(item);
      if (!structures.has(signature)) {
        structures.set(signature, item);
      }
    }
    
    if (structures.size >= maxSamples) break;
  }
  
  return Array.from(structures.values());
}

// Remove duplicate objects and slim arrays
function slimObject(obj: any, options: JsonSlimOptions): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return obj;
    
    const maxSamples = options.compressionLevel === 'low' ? 5 : 
                      options.compressionLevel === 'medium' ? 3 : 2;
    
    const uniqueStructures = getUniqueStructures(obj, maxSamples);
    
    if (uniqueStructures.length < obj.length) {
      const result = uniqueStructures.map(item => slimObject(item, options));
      if (obj.length > uniqueStructures.length) {
        result.push(`... and ${obj.length - uniqueStructures.length} more similar items`);
      }
      return result;
    }
    
    return obj.map(item => slimObject(item, options));
  }
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Always preserve explicitly requested keys
    if (options.preserveKeys.includes(key)) {
      result[key] = value;
      continue;
    }
    
    // For aggressive compression, remove some common noise
    if (options.compressionLevel === 'aggressive') {
      const noisyKeys = ['metadata', 'debug', 'trace', '__typename', '_links', 'etag'];
      if (noisyKeys.some(noisy => key.toLowerCase().includes(noisy))) {
        continue;
      }
    }
    
    result[key] = slimObject(value, options);
  }
  
  return result;
}

export function slimJson(jsonString: string, options: JsonSlimOptions): SlimResult {
  try {
    const originalData = JSON.parse(jsonString);
    const slimmedData = slimObject(originalData, options);
    
    const slimmedString = JSON.stringify(slimmedData, null, 2);
    const originalTokens = estimateTokens(jsonString);
    const slimmedTokens = estimateTokens(slimmedString);
    
    return {
      original: jsonString,
      slimmed: slimmedString,
      originalTokens,
      slimmedTokens,
      compressionRatio: originalTokens > 0 ? (originalTokens - slimmedTokens) / originalTokens : 0
    };
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export interface ValueAnalysis {
  type: 'boolean' | 'number' | 'string' | 'object' | 'array' | 'null';
  uniqueValues: any[];
  uniqueCount: number;
  range?: { min: number; max: number; };
  commonPatterns?: string[];
  examples: any[];
}

export interface SchemaField {
  name: string;
  analysis: ValueAnalysis;
  isRequired: boolean;
  frequency: number; // How often this field appears
}

export interface SchemaAnalysis {
  type: 'object' | 'array' | 'primitive';
  fields?: SchemaField[];
  arrayItemSchema?: SchemaAnalysis;
  primitiveAnalysis?: ValueAnalysis;
  samples: number;
}

export interface AnalysisResult {
  original: string;
  schema: SchemaAnalysis;
  summary: string;
  originalTokens: number;
  schemaTokens: number;
  compressionRatio: number;
}

// Analyze values to determine their type and characteristics
function analyzeValues(values: any[]): ValueAnalysis {
  const uniqueValues = [...new Set(values.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));
  const uniqueCount = uniqueValues.length;
  
  if (values.length === 0) {
    return {
      type: 'null',
      uniqueValues: [],
      uniqueCount: 0,
      examples: []
    };
  }

  // Determine the primary type
  const types = values.map(v => {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
  });
  
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const primaryType = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0][0] as ValueAnalysis['type'];

  const analysis: ValueAnalysis = {
    type: primaryType,
    uniqueValues: uniqueCount <= 20 ? uniqueValues : uniqueValues.slice(0, 5),
    uniqueCount,
    examples: uniqueValues.slice(0, 3)
  };

  // Special analysis for numbers
  if (primaryType === 'number') {
    const numbers = values.filter(v => typeof v === 'number');
    if (numbers.length > 0) {
      analysis.range = {
        min: Math.min(...numbers),
        max: Math.max(...numbers)
      };
    }
  }

  // Pattern analysis for strings
  if (primaryType === 'string') {
    const strings = values.filter(v => typeof v === 'string');
    const patterns = new Set<string>();
    
    strings.forEach(str => {
      // Detect common patterns
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) patterns.add('date');
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str)) patterns.add('email');
      if (/^https?:\/\//.test(str)) patterns.add('url');
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)) patterns.add('uuid');
      if (/^\d+$/.test(str)) patterns.add('numeric-string');
    });
    
    if (patterns.size > 0) {
      analysis.commonPatterns = Array.from(patterns);
    }
  }

  return analysis;
}

// Analyze object schema
function analyzeObjectSchema(objects: any[]): SchemaAnalysis {
  if (objects.length === 0) {
    return { type: 'object', fields: [], samples: 0 };
  }

  const fieldMap = new Map<string, any[]>();
  const fieldFrequency = new Map<string, number>();
  
  // Collect all field values
  objects.forEach(obj => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.entries(obj).forEach(([key, value]) => {
        if (!fieldMap.has(key)) {
          fieldMap.set(key, []);
          fieldFrequency.set(key, 0);
        }
        fieldMap.get(key)!.push(value);
        fieldFrequency.set(key, fieldFrequency.get(key)! + 1);
      });
    }
  });

  // Analyze each field
  const fields: SchemaField[] = Array.from(fieldMap.entries()).map(([name, values]) => {
    const frequency = fieldFrequency.get(name)! / objects.length;
    const isRequired = frequency > 0.9; // Consider required if present in >90% of objects
    
    return {
      name,
      analysis: analyzeValues(values),
      isRequired,
      frequency
    };
  });

  // Sort fields by frequency (most common first)
  fields.sort((a, b) => b.frequency - a.frequency);

  return {
    type: 'object',
    fields,
    samples: objects.length
  };
}

// Analyze array schema
function analyzeArraySchema(arrays: any[]): SchemaAnalysis {
  const allItems: any[] = [];
  
  arrays.forEach(arr => {
    if (Array.isArray(arr)) {
      allItems.push(...arr);
    }
  });

  if (allItems.length === 0) {
    return { type: 'array', samples: arrays.length };
  }

  // Check if all items are objects
  const objectItems = allItems.filter(item => item && typeof item === 'object' && !Array.isArray(item));
  
  if (objectItems.length > allItems.length * 0.8) {
    // Mostly objects - analyze as object schema
    return {
      type: 'array',
      arrayItemSchema: analyzeObjectSchema(objectItems),
      samples: arrays.length
    };
  } else {
    // Mixed or primitive items
    return {
      type: 'array',
      primitiveAnalysis: analyzeValues(allItems),
      samples: arrays.length
    };
  }
}

// Main analysis function
function analyzeData(data: any): SchemaAnalysis {
  if (Array.isArray(data)) {
    return analyzeArraySchema([data]);
  } else if (data && typeof data === 'object') {
    return analyzeObjectSchema([data]);
  } else {
    return {
      type: 'primitive',
      primitiveAnalysis: analyzeValues([data]),
      samples: 1
    };
  }
}

// Generate human-readable summary
function generateSummary(schema: SchemaAnalysis): string {
  if (schema.type === 'object' && schema.fields) {
    const requiredFields = schema.fields.filter(f => f.isRequired);
    const optionalFields = schema.fields.filter(f => !f.isRequired);
    
    let summary = `Object with ${schema.fields.length} fields:\n`;
    
    if (requiredFields.length > 0) {
      summary += `\nRequired fields (${requiredFields.length}):\n`;
      requiredFields.slice(0, 10).forEach(field => {
        const analysis = field.analysis;
        let fieldDesc = `• ${field.name}: ${analysis.type}`;
        
        if (analysis.type === 'number' && analysis.range) {
          fieldDesc += ` (${analysis.range.min} to ${analysis.range.max})`;
        } else if (analysis.uniqueCount <= 20) {
          fieldDesc += ` (possible values: ${analysis.uniqueValues.map(v => JSON.stringify(v)).join(', ')})`;
        } else if (analysis.commonPatterns && analysis.commonPatterns.length > 0) {
          fieldDesc += ` (patterns: ${analysis.commonPatterns.join(', ')})`;
        }
        
        summary += fieldDesc + '\n';
      });
    }
    
    if (optionalFields.length > 0) {
      summary += `\nOptional fields (${optionalFields.length}):\n`;
      optionalFields.slice(0, 5).forEach(field => {
        const analysis = field.analysis;
        let fieldDesc = `• ${field.name}: ${analysis.type} (${(field.frequency * 100).toFixed(0)}% present)`;
        
        if (analysis.type === 'number' && analysis.range) {
          fieldDesc += ` (${analysis.range.min} to ${analysis.range.max})`;
        } else if (analysis.uniqueCount <= 20) {
          fieldDesc += ` (possible values: ${analysis.uniqueValues.map(v => JSON.stringify(v)).join(', ')})`;
        }
        
        summary += fieldDesc + '\n';
      });
      
      if (optionalFields.length > 5) {
        summary += `... and ${optionalFields.length - 5} more optional fields\n`;
      }
    }
    
    return summary;
  } else if (schema.type === 'array') {
    if (schema.arrayItemSchema) {
      return `Array containing objects:\n${generateSummary(schema.arrayItemSchema)}`;
    } else if (schema.primitiveAnalysis) {
      const analysis = schema.primitiveAnalysis;
      let summary = `Array of ${analysis.type} values`;
      
      if (analysis.uniqueCount <= 20) {
        summary += `\nPossible values: ${analysis.uniqueValues.map(v => JSON.stringify(v)).join(', ')}`;
      } else if (analysis.type === 'number' && analysis.range) {
        summary += `\nRange: ${analysis.range.min} to ${analysis.range.max}`;
      } else if (analysis.commonPatterns && analysis.commonPatterns.length > 0) {
        summary += `\nPatterns: ${analysis.commonPatterns.join(', ')}`;
      }
      
      return summary;
    }
    return 'Array (empty or mixed types)';
  } else {
    const analysis = schema.primitiveAnalysis;
    if (!analysis) return 'Unknown type';
    
    let summary = `${analysis.type} value`;
    
    if (analysis.uniqueCount <= 20) {
      summary += `\nPossible values: ${analysis.uniqueValues.map(v => JSON.stringify(v)).join(', ')}`;
    } else if (analysis.type === 'number' && analysis.range) {
      summary += `\nRange: ${analysis.range.min} to ${analysis.range.max}`;
    } else if (analysis.commonPatterns && analysis.commonPatterns.length > 0) {
      summary += `\nPatterns: ${analysis.commonPatterns.join(', ')}`;
    }
    
    return summary;
  }
}

// Simple token estimator
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

export function analyzeJson(jsonString: string): AnalysisResult {
  try {
    const data = JSON.parse(jsonString);
    const schema = analyzeData(data);
    const summary = generateSummary(schema);
    
    const originalTokens = estimateTokens(jsonString);
    const schemaTokens = estimateTokens(summary);
    
    return {
      original: jsonString,
      schema,
      summary,
      originalTokens,
      schemaTokens,
      compressionRatio: originalTokens > 0 ? (originalTokens - schemaTokens) / originalTokens : 0
    };
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
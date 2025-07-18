export function detectLanguage(content: string): string {
  if (!content || !content.trim()) {
    return 'plaintext';
  }

  const trimmed = content.trim();

  // JSON detection
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // XML/HTML detection
  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    return 'xml';
  }

  // YAML detection
  if (/^[a-zA-Z_][a-zA-Z0-9_]*:\s*/.test(trimmed) || 
      trimmed.includes('---') || 
      /^\s*-\s+/.test(trimmed)) {
    return 'yaml';
  }

  // CSS detection
  if (trimmed.includes('{') && trimmed.includes('}') && 
      /[a-zA-Z-]+\s*:\s*[^;]+;/.test(trimmed)) {
    return 'css';
  }

  // JavaScript/TypeScript detection
  if (/\b(function|const|let|var|class|import|export|interface|type)\b/.test(trimmed) ||
      trimmed.includes('=>') || 
      trimmed.includes('console.log')) {
    return 'javascript';
  }

  // Python detection
  if (/\b(def|class|import|from|if __name__|print)\b/.test(trimmed) ||
      /^\s*(def|class|import|from)\s+/.test(trimmed)) {
    return 'python';
  }

  // SQL detection
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(trimmed)) {
    return 'sql';
  }

  // Log file detection
  if (/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/.test(trimmed) || // timestamp
      /\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/.test(trimmed) || // log levels
      /at\s+\w+.*\([^)]+:\d+:\d+\)/.test(trimmed)) { // stack traces
    return 'log';
  }

  // Markdown detection
  if (trimmed.includes('# ') || trimmed.includes('## ') || 
      trimmed.includes('```') || trimmed.includes('*') ||
      trimmed.includes('[') && trimmed.includes('](')) {
    return 'markdown';
  }

  // Default to plaintext
  return 'plaintext';
}

export function formatContent(content: string, language: string): string {
  if (!content) return content;

  try {
    switch (language) {
      case 'json':
        return JSON.stringify(JSON.parse(content), null, 2);
      case 'xml':
      case 'html':
        // Basic XML formatting (could be enhanced with a proper XML formatter)
        return content.replace(/></g, '>\n<').replace(/^\s+|\s+$/gm, '');
      default:
        return content;
    }
  } catch {
    return content;
  }
}
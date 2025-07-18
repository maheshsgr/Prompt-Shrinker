# Prompt Slimmer

A desktop application that helps you preprocess large inputs (like JSON payloads or error logs) before sending them to AI agents. Reduces token count while retaining essential context.

## Features

### 🚀 Core Functionality
- **100% Offline Processing** - No internet required, all processing happens locally
- **JSON Payload Slimming** - Compress API responses showing only unique structures
- **Error Log Simplification** - Extract key information from stack traces and error logs
- **Token Estimation** - See before/after token counts and compression ratios
- **Multiple Compression Levels** - Low, Medium, and Aggressive compression modes

### 📱 User Interface
- Modern, responsive design with TailwindCSS
- Side-by-side input/output view
- Drag & drop file upload support
- One-click copy to clipboard
- Real-time processing with debounced input

### 🎯 Use Cases

#### JSON API Payload Slimming
- Input: Large JSON API response with repeated structures
- Output: Deduplicated version showing only unique object structures and types
- Perfect for: Understanding API formats without token waste

#### Error Stack Simplifier  
- Input: Long error logs or stack traces
- Output: Essential error information (error message, file, line number)
- Perfect for: Debugging assistance without framework noise

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- Rust (for Tauri)
- Linux dependencies for Tauri (if on Linux)

### Development
```bash
# Clone and install dependencies
cd prompt-slimmer
npm install

# Run in development mode
npm run tauri dev
```

### Build for Production
```bash
# Build the desktop app
npm run tauri build
```

## Usage

1. **Choose Processing Mode**
   - Select "Slim JSON" for API payloads and JSON data
   - Select "Simplify Logs" for error logs and stack traces

2. **Set Compression Level**
   - **Low**: Minimal compression, preserves most content
   - **Medium**: Balanced compression, removes common noise  
   - **Aggressive**: Maximum compression, keeps only essentials

3. **Input Your Data**
   - Paste content directly into the input area
   - Or drag & drop a file (.json, .txt, .log)

4. **Review Results**
   - See real-time token reduction statistics
   - Copy optimized output with one click
   - View before/after comparison

## Examples

### JSON Slimming Example

**Before (234 tokens):**
```json
{
  "users": [
    {"id": 1, "name": "John", "email": "john@example.com", "active": true},
    {"id": 2, "name": "Jane", "email": "jane@example.com", "active": true},
    {"id": 3, "name": "Bob", "email": "bob@example.com", "active": false}
  ]
}
```

**After (67 tokens, 71% reduction):**
```json
{
  "users": [
    {"id": 1, "name": "John", "email": "john@example.com", "active": true},
    "... and 2 more similar items"
  ]
}
```

### Log Simplification Example

**Before (189 tokens):**
```
2024-01-15 10:30:45 ERROR: Database connection failed
    at connectToDatabase (/app/db.js:45:12)
    at Object.<anonymous> (/app/server.js:15:3)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
```

**After (34 tokens, 82% reduction):**
```
ERROR: Database connection failed
at connectToDatabase (/app/db.js:45:12)
at Object.<anonymous> (/app/server.js:15:3)
```

## Architecture

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Tauri (Rust)
- **Processing**: Pure JavaScript algorithms (no external APIs)
- **Token Estimation**: Character-based approximation for GPT models

## Compression Algorithms

### JSON Slimming
- Deduplication of array objects with identical structures
- Removal of metadata and debug fields (aggressive mode)
- Preservation of essential keys (id, name, type, etc.)
- Smart sampling of array contents

### Log Simplification  
- Pattern recognition for error messages and stack traces
- Framework noise filtering (node_modules, webpack, etc.)
- Timestamp normalization
- Stack depth limiting based on compression level

## Contributing

This is an MVP (v0.1). Future enhancements could include:
- Additional processing modes (code, markdown, etc.)
- Custom regex patterns for log filtering
- Export functionality (save processed files)
- Plugin system for extensibility
- Advanced token estimation models

## License

MIT License - feel free to use and modify for your needs.

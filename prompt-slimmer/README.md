# Prompt Slimmer

A powerful desktop application that analyzes and preprocesses large inputs (like JSON payloads or error logs) before sending them to AI agents. Features advanced schema analysis, intelligent compression, and comprehensive data type detection.

## 🆕 Latest Features

### 🔬 Schema Analysis Mode (**NEW**)
- **Deep Type Analysis** - Automatically detects booleans, numbers with ranges, strings with patterns
- **Value Enumeration** - Lists all possible values when ≤20 unique values exist
- **Pattern Recognition** - Identifies emails, URLs, dates, UUIDs, and other common patterns
- **Smart Schema Generation** - Creates generalized schemas instead of removing duplicates
- **Frequency Analysis** - Shows how often each field appears (required vs optional)
- **Range Detection** - Automatically calculates min/max for numeric fields

### 🎨 Improved User Interface
- **Modern Dialog System** - Settings organized in clean modal dialogs
- **Collapsible Sections** - Better organization for complex schemas
- **Interactive Schema Viewer** - Visual representation with expandable field details
- **Enhanced Navigation** - Clear mode indicators and improved workflow
- **Better Visual Hierarchy** - Cards, badges, and improved typography

## Features

### 🚀 Core Functionality
- **100% Offline Processing** - No internet required, all processing happens locally
- **Schema Analysis** - Comprehensive data type and pattern analysis with value enumeration
- **JSON Payload Slimming** - Compress API responses showing only unique structures
- **Error Log Simplification** - Extract key information from stack traces and error logs
- **Token Estimation** - See before/after token counts and compression ratios
- **Multiple Processing Modes** - Schema analysis, JSON slimming, and log simplification

### 📱 User Interface
- Modern, responsive design with TailwindCSS and Radix UI components
- Side-by-side input/analysis view with schema visualization
- Drag & drop file upload support
- One-click copy to clipboard for outputs
- Real-time processing with debounced input
- Settings dialog for easy mode switching

### 🎯 Use Cases

#### Schema Analysis Mode (**NEW**)
- **Input**: Any JSON data structure
- **Output**: Comprehensive schema analysis with:
  - Field types (boolean, number, string, object, array)
  - Value ranges for numbers (min/max)
  - All possible values for fields with ≤20 unique values
  - Pattern detection (email, URL, date, UUID, etc.)
  - Required vs optional field analysis
  - Human-readable summary optimized for AI prompts

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

### Getting Started

1. **Launch the Application**
   - The app opens in Schema Analysis mode by default
   - Use the Settings dialog to switch between modes

2. **Choose Processing Mode**
   - **Schema Analysis**: Analyze data types, ranges, and create schemas
   - **Slim JSON**: Compress JSON by removing duplicate structures
   - **Simplify Logs**: Extract key information from error logs

3. **Input Your Data**
   - Paste content directly into the input area
   - Or drag & drop a file (.json, .txt, .log)
   - Real-time processing begins automatically

4. **Review Results**
   - Schema Analysis: Interactive schema viewer + human-readable summary
   - JSON/Log Modes: Optimized output with compression statistics
   - Copy results with one click

### Schema Analysis Features

#### Type Detection
The schema analyzer automatically identifies:
- **Booleans**: true/false values
- **Numbers**: With automatic range calculation (min/max)
- **Strings**: With pattern recognition for common formats
- **Objects**: With nested field analysis
- **Arrays**: With item type analysis

#### Pattern Recognition
Automatically detects common string patterns:
- **Email addresses**: user@domain.com
- **URLs**: http/https links
- **Dates**: ISO date formats
- **UUIDs**: Universally unique identifiers
- **Numeric strings**: String-encoded numbers

#### Value Enumeration
For fields with ≤20 unique values:
- Lists all possible values
- Shows frequency of occurrence
- Helps understand data constraints
- Perfect for enum-like fields

#### Field Analysis
Each field shows:
- **Type**: Primary data type
- **Required/Optional**: Based on frequency analysis (>90% = required)
- **Frequency**: Percentage of records containing this field
- **Range**: For numeric fields (min to max)
- **Possible Values**: When ≤20 unique values exist
- **Patterns**: Detected string patterns

## Examples

### Schema Analysis Example

**Input JSON (458 tokens):**
```json
{
  "users": [
    {"id": 1, "name": "John", "email": "john@example.com", "active": true, "role": "admin"},
    {"id": 2, "name": "Jane", "email": "jane@example.com", "active": true, "role": "user"},
    {"id": 3, "name": "Bob", "email": "bob@example.com", "active": false, "role": "user"}
  ],
  "metadata": {
    "total": 3,
    "page": 1,
    "hasMore": false
  }
}
```

**Schema Analysis Output (124 tokens, 73% reduction):**
```
Object with 2 fields:

Required fields (2):
• users: array (Array containing objects)
  - Item Schema: Object with 5 fields
    • id: number (1 to 3)
    • name: string (possible values: "John", "Jane", "Bob")
    • email: string (patterns: email)
    • active: boolean (possible values: true, false)
    • role: string (possible values: "admin", "user")

• metadata: object
  - total: number (3 to 3)
  - page: number (1 to 1)
  - hasMore: boolean (possible values: false)
```

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

## UI Improvements

### Enhanced Navigation
- **Mode Banner**: Clear indication of current processing mode
- **Settings Dialog**: Centralized configuration with better organization
- **Quick Actions**: File upload and reprocessing in sidebar
- **Statistics Panel**: Real-time token reduction metrics

### Better Visual Organization
- **Schema Viewer**: Interactive collapsible sections for field analysis
- **Badge System**: Visual indicators for field types and requirements
- **Pattern Icons**: Visual representation of detected patterns
- **Progress Indicators**: Clear feedback during processing

### Improved Workflow
- **Auto-processing**: Real-time analysis as you type (debounced)
- **Copy Integration**: One-click copying of any output
- **File Support**: Drag & drop for common file types
- **Error Handling**: Clear error messages with helpful context

## Architecture

- **Frontend**: React + TypeScript + TailwindCSS + Radix UI
- **Backend**: Tauri (Rust)
- **Processing**: Pure JavaScript algorithms (no external APIs)
- **Token Estimation**: Character-based approximation for GPT models
- **UI Components**: Modern component library with accessibility support

## Schema Analysis Algorithms

### Type Detection
- **Statistical Analysis**: Determines primary type based on frequency
- **Pattern Matching**: Regex-based detection for common formats
- **Range Calculation**: Automatic min/max for numeric values
- **Frequency Analysis**: Required vs optional field determination

### Value Enumeration
- **Threshold-based**: Lists all values when ≤20 unique values
- **Sampling**: Shows examples for high-cardinality fields
- **Deduplication**: Efficient unique value tracking
- **JSON-safe Serialization**: Proper handling of complex values

### Pattern Recognition
Currently detects:
- Email addresses (RFC-compliant regex)
- HTTP/HTTPS URLs
- ISO date formats (YYYY-MM-DD patterns)
- UUID v4 format
- Numeric strings

## Traditional Compression Algorithms

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

## Configuration Options

### Schema Analysis
- **No configuration needed** - Automatically analyzes all aspects
- **Pattern threshold**: 20 unique values (configurable in code)
- **Required threshold**: 90% frequency for required fields

### JSON Slimming
- **Compression levels**: Low (5 samples), Medium (3 samples), Aggressive (2 samples)
- **Preserve keys**: Configurable list of important field names
- **Array sampling**: Smart selection of representative items

### Log Simplification
- **Stack depth**: Configurable based on compression level
- **Pattern preservation**: Customizable regex patterns
- **Noise filtering**: Framework-specific filters

## Contributing

This project has been significantly enhanced from v0.1 to v1.0 with:
- New schema analysis engine
- Modern UI components and better UX
- Enhanced type detection and pattern recognition
- Improved data visualization and organization

Future enhancements could include:
- Custom pattern definitions for domain-specific data
- Export functionality for schema definitions
- Advanced statistical analysis (percentiles, distributions)
- Plugin system for custom data processors
- Integration with popular schema validation libraries

## License

MIT License - feel free to use and modify for your needs.

## Changelog

### v1.0.0 (Current)
- ✨ **NEW**: Schema Analysis mode with comprehensive type detection
- ✨ **NEW**: Value enumeration for fields with ≤20 unique values
- ✨ **NEW**: Pattern recognition (email, URL, date, UUID)
- ✨ **NEW**: Interactive schema viewer with collapsible sections
- ✨ **NEW**: Modern dialog-based settings
- 🎨 **IMPROVED**: Complete UI overhaul with better organization
- 🎨 **IMPROVED**: Enhanced navigation and workflow
- 🎨 **IMPROVED**: Better visual hierarchy and component design
- 🔧 **UPDATED**: New component library with Radix UI
- 📝 **UPDATED**: Comprehensive documentation

### v0.1.0 (Previous)
- Basic JSON slimming functionality
- Log simplification
- Simple compression levels
- Basic UI with sidebar controls

import React, { useState, useCallback } from "react";
import { ModeSelector, ProcessingMode } from "./components/ModeSelector";
import { CompressionSlider, CompressionLevel } from "./components/CompressionSlider";
import { InputArea } from "./components/InputArea";
import { OutputArea } from "./components/OutputArea";
import { slimJson, JsonSlimOptions, SlimResult } from "./utils/jsonSlimmer";
import { slimLogs, LogSlimOptions } from "./utils/logSlimmer";
import "./App.css";

function App() {
  const [mode, setMode] = useState<ProcessingMode>('json');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SlimResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processInput = useCallback(async () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let processedResult: SlimResult;

      if (mode === 'json') {
        const options: JsonSlimOptions = {
          compressionLevel,
          maxArraySamples: compressionLevel === 'low' ? 5 : compressionLevel === 'medium' ? 3 : 2,
          preserveKeys: ['id', 'name', 'type', 'status', 'error', 'message']
        };
        processedResult = slimJson(input, options);
      } else {
        const options: LogSlimOptions = {
          compressionLevel,
          preservePatterns: ['error', 'exception', 'failed', 'warning'],
          maxStackDepth: compressionLevel === 'low' ? 10 : compressionLevel === 'medium' ? 6 : 3
        };
        processedResult = slimLogs(input, options);
      }

      setResult(processedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [input, mode, compressionLevel]);

  // Auto-process when input changes (with debounce)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      processInput();
    }, 500);

    return () => clearTimeout(timer);
  }, [processInput]);

  const handleFileUpload = (content: string) => {
    setInput(content);
  };

  const getPlaceholder = () => {
    if (mode === 'json') {
      return 'Paste your JSON payload here...\n\nExample:\n{\n  "users": [\n    {"id": 1, "name": "John"},\n    {"id": 2, "name": "Jane"}\n  ]\n}';
    }
    return 'Paste your error logs or stack trace here...\n\nExample:\nError: Something went wrong\n    at function1 (file.js:10:5)\n    at function2 (file.js:20:3)';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✂️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Prompt Slimmer</h1>
              <p className="text-sm text-gray-600">Reduce token count while preserving context</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ModeSelector value={mode} onChange={setMode} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CompressionSlider 
                value={compressionLevel} 
                onChange={setCompressionLevel} 
              />
            </div>

            {/* Processing Info */}
            {result && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">Processing Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="capitalize">{mode === 'json' ? 'JSON Slimming' : 'Log Simplification'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compression:</span>
                    <span className="capitalize">{compressionLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reduction:</span>
                    <span className="text-green-600 font-medium">
                      {(result.compressionRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Offline Badge */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">100% Offline</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                All processing happens locally on your device
              </p>
            </div>
          </div>

          {/* Input/Output */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="text-sm font-medium">❌ Processing Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Input */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <InputArea
                value={input}
                onChange={setInput}
                placeholder={getPlaceholder()}
                onFileUpload={handleFileUpload}
              />
            </div>

            {/* Output */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <OutputArea result={result} isProcessing={isProcessing} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { CodeEditor } from "./components/CodeEditor";
import { ModelDownloader } from "./components/ModelDownloader";
import { ModeSelector, ProcessingMode } from "./components/ModeSelector";
import { CompressionSlider, CompressionLevel } from "./components/CompressionSlider";
import { slimJson, JsonSlimOptions, SlimResult } from "./utils/jsonSlimmer";
import { slimLogs, LogSlimOptions } from "./utils/logSlimmer";
import { formatContent } from "./utils/languageDetector";
import { 
  Scissors, 
  Copy, 
  FileText, 
  Download, 
  Zap, 
  Shield, 
  BarChart3,
  Sparkles,
  Upload,
  RefreshCw
} from "lucide-react";
import "./App.css";

function App() {
  const [mode, setMode] = useState<ProcessingMode>('json');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SlimResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    if (result?.slimmed) {
      try {
        await navigator.clipboard.writeText(result.slimmed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const formatOutput = () => {
    if (!result?.slimmed) return '';
    return formatContent(result.slimmed, mode === 'json' ? 'json' : 'plaintext');
  };

  const getPlaceholder = () => {
    if (mode === 'json') {
      return `Paste your JSON payload here...

Example:
{
  "users": [
    {"id": 1, "name": "John", "email": "john@example.com"},
    {"id": 2, "name": "Jane", "email": "jane@example.com"}
  ],
  "metadata": {
    "total": 2,
    "page": 1,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}`;
    }
    return `Paste your error logs or stack trace here...

Example:
Error: Something went wrong
    at function1 (file.js:10:5)
    at function2 (file.js:20:3)
    at Object.<anonymous> (file.js:30:1)
    
2024-01-01 10:30:45 ERROR: Database connection failed
2024-01-01 10:30:46 INFO: Retrying connection...`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Prompt Slimmer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Reduce token count while preserving context
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
                <Shield className="h-4 w-4" />
                <span className="font-medium">100% Offline</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Processing Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModeSelector value={mode} onChange={setMode} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Compression Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CompressionSlider 
                      value={compressionLevel} 
                      onChange={setCompressionLevel} 
                    />
                  </CardContent>
                </Card>

                {/* Processing Stats */}
                {result && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Original:</span>
                          <span className="font-medium">{result.originalTokens.toLocaleString()} tokens</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Optimized:</span>
                          <span className="font-medium text-green-600">{result.slimmedTokens.toLocaleString()} tokens</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reduction:</span>
                          <span className="font-bold text-green-600">
                            {(result.compressionRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${result.compressionRatio * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Saved {(result.originalTokens - result.slimmedTokens).toLocaleString()} tokens
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <label htmlFor="file-upload">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json,.txt,.log,.js,.py,.xml,.yaml,.yml"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" className="w-full" asChild>
                        <span className="flex items-center gap-2 cursor-pointer">
                          <Upload className="h-4 w-4" />
                          Upload File
                        </span>
                      </Button>
                    </label>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => processInput()}
                      disabled={isProcessing || !input}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                      {isProcessing ? 'Processing...' : 'Reprocess'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Editor Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Error Display */}
                {error && (
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                        <span className="text-lg">⚠️</span>
                        <span className="font-medium">Processing Error</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Input Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Input
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {input.length.toLocaleString()} characters
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Paste your {mode === 'json' ? 'JSON data' : 'error logs'} here or upload a file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeEditor
                      value={input}
                      onChange={setInput}
                      placeholder={getPlaceholder()}
                      height="500px"
                      theme="vs-dark"
                    />
                  </CardContent>
                </Card>

                {/* Output Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-green-600" />
                        Optimized Output
                      </span>
                      <div className="flex items-center gap-2">
                        {result && (
                          <span className="text-sm font-normal text-muted-foreground">
                            {result.slimmedTokens.toLocaleString()} tokens
                          </span>
                        )}
                        <Button
                          size="sm"
                          onClick={handleCopy}
                          disabled={!result?.slimmed}
                          className="h-8"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Processed and optimized content with reduced token count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeEditor
                      value={formatOutput()}
                      readOnly
                      height="500px"
                      theme="vs-dark"
                      placeholder={isProcessing ? 'Processing your input...' : 'Optimized content will appear here'}
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center gap-3 text-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-sm font-medium">Processing your {mode}...</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models">
            <ModelDownloader />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-blue-600" />
                    Smart Compression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Intelligently reduces JSON and log files while preserving essential information and structure.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Privacy First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All processing happens locally on your device. No data is sent to external servers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Syntax Highlighting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Automatic language detection with beautiful syntax highlighting for better readability.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-indigo-600" />
                    AI Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Download and experiment with popular open-source AI models from Hugging Face.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    Real-time Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See token count reduction in real-time with detailed compression statistics.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-600" />
                    Multi-format Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Supports JSON, logs, XML, YAML, and other common developer file formats.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;

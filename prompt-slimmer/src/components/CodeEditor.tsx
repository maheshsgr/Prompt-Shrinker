import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { detectLanguage } from '../utils/languageDetector';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  height = '400px',
  language,
  theme = 'vs-dark'
}) => {
  const editorRef = useRef<any>(null);
  const detectedLanguage = language || detectLanguage(value);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (onChange && newValue !== undefined) {
      onChange(newValue);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-slate-900">
      <Editor
        height={height}
        language={detectedLanguage}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
          lineHeight: 22,
          padding: { top: 16, bottom: 16 },
          suggest: {
            showKeywords: false,
            showSnippets: false,
            showFunctions: false,
          },
          quickSuggestions: false,
          parameterHints: { enabled: false },
          hover: { enabled: false },
          contextmenu: true,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          cursorBlinking: 'blink',
          smoothScrolling: true,
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Loading editor...</div>
          </div>
        }
      />
      {!value && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900 text-gray-400">
          <div className="text-center space-y-2">
            <div className="text-2xl">📝</div>
            <div className="text-sm">{placeholder}</div>
          </div>
        </div>
      )}
    </div>
  );
};
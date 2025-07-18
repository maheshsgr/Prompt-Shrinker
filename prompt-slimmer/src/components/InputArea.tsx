import React, { useRef } from 'react';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onFileUpload?: (content: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  onFileUpload 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && onFileUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Input
        </label>
        {onFileUpload && (
          <button
            onClick={triggerFileUpload}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            📁 Upload File
          </button>
        )}
      </div>
      
      <div
        className="relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-2">📋</div>
              <div>Paste content or drag & drop a file here</div>
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".json,.txt,.log"
        className="hidden"
      />
    </div>
  );
};
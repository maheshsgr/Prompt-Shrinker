import React, { useState } from 'react';
import { SlimResult } from '../utils/jsonSlimmer';

interface OutputAreaProps {
  result: SlimResult | null;
  isProcessing: boolean;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ result, isProcessing }) => {
  const [copied, setCopied] = useState(false);

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

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (ratio: number) => {
    return (ratio * 100).toFixed(1);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Optimized Output
        </label>
        
        {result && (
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-600">
              {formatNumber(result.originalTokens)} → {formatNumber(result.slimmedTokens)} tokens 
              <span className="text-green-600 font-medium">
                (-{formatPercentage(result.compressionRatio)}%)
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={!result.slimmed}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
      
      <div className="relative">
        <textarea
          value={isProcessing ? 'Processing...' : (result?.slimmed || '')}
          readOnly
          className="w-full h-64 p-3 border border-gray-300 rounded-md resize-none bg-gray-50 font-mono text-sm"
          placeholder="Processed output will appear here..."
        />
        
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin text-2xl mb-2">⚙️</div>
              <div className="text-gray-600">Processing...</div>
            </div>
          </div>
        )}
        
        {!result && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-2">✨</div>
              <div>Optimized content will appear here</div>
            </div>
          </div>
        )}
      </div>
      
      {result && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Original</div>
            <div className="font-medium">{formatNumber(result.originalTokens)} tokens</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-gray-600">Optimized</div>
            <div className="font-medium text-green-700">{formatNumber(result.slimmedTokens)} tokens</div>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-gray-600">Saved</div>
            <div className="font-medium text-blue-700">
              {formatNumber(result.originalTokens - result.slimmedTokens)} tokens
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
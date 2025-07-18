import React from 'react';

export type ProcessingMode = 'json' | 'logs';

interface ModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
}

const modes: { value: ProcessingMode; label: string; icon: string; description: string }[] = [
  { 
    value: 'json', 
    label: 'Slim JSON', 
    icon: '📄', 
    description: 'Compress API responses and JSON payloads' 
  },
  { 
    value: 'logs', 
    label: 'Simplify Logs', 
    icon: '🔍', 
    description: 'Extract key information from error logs and stack traces' 
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Processing Mode
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              value === mode.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{mode.icon}</span>
              <span className="font-medium">{mode.label}</span>
            </div>
            <p className="text-xs text-gray-600">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
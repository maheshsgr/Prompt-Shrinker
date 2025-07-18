import React from 'react';

export type CompressionLevel = 'low' | 'medium' | 'aggressive';

interface CompressionSliderProps {
  value: CompressionLevel;
  onChange: (level: CompressionLevel) => void;
}

const levels: { value: CompressionLevel; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Minimal compression, preserves most content' },
  { value: 'medium', label: 'Medium', description: 'Balanced compression, removes common noise' },
  { value: 'aggressive', label: 'Aggressive', description: 'Maximum compression, keeps only essentials' },
];

export const CompressionSlider: React.FC<CompressionSliderProps> = ({ value, onChange }) => {
  const currentIndex = levels.findIndex(level => level.value === value);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Compression Level
      </label>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange(level.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                value === level.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
        
        {/* Visual slider */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${((currentIndex + 1) / levels.length) * 100}%` }}
            />
          </div>
          <div 
            className="absolute top-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-y-1 -translate-x-2 transition-all duration-200"
            style={{ left: `${(currentIndex / (levels.length - 1)) * 100}%` }}
          />
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          {levels[currentIndex].description}
        </p>
      </div>
    </div>
  );
};
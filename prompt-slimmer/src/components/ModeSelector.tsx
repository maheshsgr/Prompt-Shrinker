import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export type ProcessingMode = 'json' | 'logs' | 'schema';

interface ModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
}

const modes: { 
  value: ProcessingMode; 
  label: string; 
  icon: string; 
  description: string;
  isNew?: boolean;
}[] = [
  { 
    value: 'json', 
    label: 'Slim JSON', 
    icon: '📄', 
    description: 'Compress API responses and JSON payloads' 
  },
  { 
    value: 'schema', 
    label: 'Schema Analysis', 
    icon: '🔬', 
    description: 'Analyze data types, ranges, and create generalized schemas',
    isNew: true
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
      <div className="grid grid-cols-1 gap-3">
        {modes.map((mode) => (
          <Card
            key={mode.value}
            className={`cursor-pointer transition-all ${
              value === mode.value
                ? 'border-primary shadow-md bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => onChange(mode.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{mode.label}</span>
                      {mode.isNew && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  value === mode.value
                    ? 'bg-primary border-primary'
                    : 'border-gray-300'
                }`}>
                  {value === mode.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Trash2, HardDrive, Globe, CheckCircle } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  type: 'language' | 'embedding' | 'classification';
  downloadUrl: string;
  isDownloaded?: boolean;
  downloadProgress?: number;
}

const POPULAR_MODELS: Model[] = [
  {
    id: 'microsoft/DialoGPT-small',
    name: 'DialoGPT Small',
    description: 'Small conversational AI model perfect for beginners',
    size: '117MB',
    type: 'language',
    downloadUrl: 'https://huggingface.co/microsoft/DialoGPT-small'
  },
  {
    id: 'distilbert-base-uncased',
    name: 'DistilBERT Base',
    description: 'Lightweight BERT model for text understanding',
    size: '268MB',
    type: 'language',
    downloadUrl: 'https://huggingface.co/distilbert-base-uncased'
  },
  {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'MiniLM Sentence Transformer',
    description: 'Fast sentence embedding model',
    size: '91MB',
    type: 'embedding',
    downloadUrl: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2'
  },
  {
    id: 'cardiffnlp/twitter-roberta-base-sentiment',
    name: 'RoBERTa Sentiment',
    description: 'Sentiment analysis model trained on tweets',
    size: '499MB',
    type: 'classification',
    downloadUrl: 'https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment'
  },
  {
    id: 'gpt2',
    name: 'GPT-2 Small',
    description: 'Original GPT-2 model for text generation',
    size: '548MB',
    type: 'language',
    downloadUrl: 'https://huggingface.co/gpt2'
  }
];

export const ModelDownloader: React.FC = () => {
  const [models, setModels] = useState<Model[]>(POPULAR_MODELS);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    // Load downloaded models from localStorage
    const downloadedModels = JSON.parse(localStorage.getItem('downloadedModels') || '[]');
    setModels(prev => prev.map(model => ({
      ...model,
      isDownloaded: downloadedModels.includes(model.id)
    })));
  }, []);

  const simulateDownload = async (modelId: string) => {
    setDownloading(modelId);
    
    // Simulate download progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, downloadProgress: progress } : model
      ));
    }

    // Mark as downloaded
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, isDownloaded: true, downloadProgress: undefined } : model
    ));

    // Save to localStorage
    const downloadedModels = JSON.parse(localStorage.getItem('downloadedModels') || '[]');
    downloadedModels.push(modelId);
    localStorage.setItem('downloadedModels', JSON.stringify(downloadedModels));

    setDownloading(null);
  };

  const removeModel = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, isDownloaded: false } : model
    ));

    // Remove from localStorage
    const downloadedModels = JSON.parse(localStorage.getItem('downloadedModels') || '[]');
    const filtered = downloadedModels.filter((id: string) => id !== modelId);
    localStorage.setItem('downloadedModels', JSON.stringify(filtered));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'language': return '🤖';
      case 'embedding': return '🔗';
      case 'classification': return '📊';
      default: return '🎯';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'language': return 'bg-blue-100 text-blue-800';
      case 'embedding': return 'bg-green-100 text-green-800';
      case 'classification': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          AI Model Library
        </CardTitle>
        <CardDescription>
          Download popular open-source models to enhance your coding experience. 
          Perfect for beginners to explore different AI capabilities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {models.map((model) => (
            <div key={model.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(model.type)}</span>
                    <h3 className="font-medium">{model.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(model.type)}`}>
                      {model.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{model.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {model.size}
                    </span>
                    <a 
                      href={model.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <Globe className="h-3 w-3" />
                      View on Hugging Face
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {model.isDownloaded ? (
                    <>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Downloaded
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeModel(model.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => simulateDownload(model.id)}
                      disabled={downloading === model.id}
                      className="min-w-[100px]"
                    >
                      {downloading === model.id ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {model.downloadProgress}%
                        </div>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {downloading === model.id && model.downloadProgress !== undefined && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${model.downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Downloading {model.name}... {model.downloadProgress}%
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">💡</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Getting Started with AI Models:</p>
              <ul className="space-y-1 text-xs">
                <li>• Language models: Great for text generation and completion</li>
                <li>• Embedding models: Perfect for semantic search and similarity</li>
                <li>• Classification models: Ideal for sentiment analysis and categorization</li>
                <li>• All models run locally - no internet required after download!</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
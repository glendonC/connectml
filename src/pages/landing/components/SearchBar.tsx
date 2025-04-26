import React from 'react';
import { Search, Upload } from 'lucide-react';

interface SearchBarProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function SearchBar({ prompt, setPrompt, onKeyPress }: SearchBarProps) {
  return (
    <div className="relative search-shadow rounded-full bg-white transition-all">
      <div className="flex items-center px-6 py-3">
        <Search className="w-5 h-5 text-gray-400 mr-4" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Describe your ML problem..."
          className="w-full bg-transparent text-gray-800 placeholder-gray-500/60"
        />
        <div className="flex items-center gap-2 ml-4">
          <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-gray-500" />
            <input type="file" className="hidden" accept=".csv,.json" />
          </label>
        </div>
      </div>
    </div>
  );
}
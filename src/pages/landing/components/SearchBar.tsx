import React, { useState, useRef, useEffect } from 'react';
import { Search, Upload, Zap, Brain, ChevronDown } from 'lucide-react';

export type AIMode = 'quick' | 'agentic';

interface SearchBarProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  mode: 'fast' | 'precise';  // This is for clarification mode
  aiMode: AIMode;
  setAIMode: (mode: AIMode) => void;
  onFileUpload: (files: FileList) => void;
}

export function SearchBar({ 
  prompt, 
  setPrompt, 
  onKeyPress, 
  mode, 
  aiMode, 
  setAIMode,
  onFileUpload
}: SearchBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-shadow rounded-full bg-white transition-all">
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {aiMode === 'quick' ? (
                <Zap className="w-4 h-4" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 z-50">
                <button
                  onClick={() => { setAIMode('quick'); setShowDropdown(false); }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                    aiMode === 'quick' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <div>
                    <div>Quick Mode</div>
                    <div className="text-xs text-gray-500">Fast matching</div>
                  </div>
                </button>
                <button
                  onClick={() => { setAIMode('agentic'); setShowDropdown(false); }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                    aiMode === 'agentic' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <div>
                    <div>Agentic Mode</div>
                    <div className="text-xs text-gray-500">Research-based</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-gray-200 mx-1" />
          
          <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-gray-500" />
            <input 
              type="file" 
              className="hidden" 
              accept=".py,.ipynb,.csv,.json"
              multiple
              onChange={(e) => e.target.files && onFileUpload(e.target.files)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
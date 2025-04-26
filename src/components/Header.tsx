import React from 'react';
import { Zap, Clock } from 'lucide-react';

interface HeaderProps {
  mode: 'fast' | 'precise';
  setMode: (mode: 'fast' | 'precise') => void;
}

export function Header({ mode, setMode }: HeaderProps) {
  return (
    <header className="flex items-center justify-end px-6 py-3 border-b border-gray-100">
      <div className="mode-toggle bg-white rounded-full p-1 flex items-center">
        <button
          onClick={() => setMode('fast')}
          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
            mode === 'fast'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Zap className="w-4 h-4 inline-block mr-1.5" />
          Fast
        </button>
        <button
          onClick={() => setMode('precise')}
          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
            mode === 'precise'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-1.5" />
          Precise
        </button>
      </div>
    </header>
  );
}
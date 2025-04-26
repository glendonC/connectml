import React from 'react';
import { Moon, Sun, MessageSquare } from 'lucide-react';

interface ActionButtonsProps {
  code: string;
  theme: 'vs-dark' | 'light';
  setTheme: (theme: 'vs-dark' | 'light') => void;
  showRecommendations: boolean;
  setShowRecommendations: (show: boolean) => void;
}

export function ActionButtons({
  theme,
  setTheme,
  showRecommendations,
  setShowRecommendations
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'vs-dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={() => setShowRecommendations(!showRecommendations)}
        className={`p-2 rounded-lg transition-colors ${
          showRecommendations ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Toggle recommendations"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  );
}
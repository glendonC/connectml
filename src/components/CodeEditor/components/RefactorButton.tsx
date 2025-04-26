import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ChevronDown, Sparkles, MessageSquare, Zap, Code } from 'lucide-react';
import { RefactorOption } from '../types';

interface RefactorButtonProps {
  code: string;
  onRefactor: (option: RefactorOption, customPrompt?: string) => void;
}

export function RefactorButton({ code, onRefactor }: RefactorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const refactorOptions = [
    {
      id: 'simplify' as const,
      label: 'Simplify Code',
      description: 'Remove unnecessary complexity and improve code structure',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'addComments' as const,
      label: 'Add Comments',
      description: 'Add detailed comments explaining the code',
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      id: 'optimize' as const,
      label: 'Optimize for Readability',
      description: 'Improve code formatting and naming',
      icon: <Code className="w-4 h-4" />
    },
    {
      id: 'custom' as const,
      label: 'Custom Refactor',
      description: 'Write your own refactoring request',
      icon: <Zap className="w-4 h-4" />
    }
  ];

  const handleOptionClick = (option: RefactorOption) => {
    if (option === 'custom') {
      setShowCustomPrompt(true);
    } else {
      onRefactor(option);
      setIsOpen(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onRefactor('custom', customPrompt);
      setShowCustomPrompt(false);
      setIsOpen(false);
      setCustomPrompt('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Wand2 className="w-4 h-4" />
        Refactor
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && !showCustomPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {refactorOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  {option.icon}
                  <span className="font-['Google_Sans'] text-gray-900">{option.label}</span>
                </div>
                <p className="text-xs text-gray-600 pl-6">{option.description}</p>
              </button>
            ))}
          </motion.div>
        )}

        {showCustomPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <form onSubmit={handleCustomSubmit} className="p-4">
              <h3 className="font-['Google_Sans'] text-gray-900 mb-2">Custom Refactor</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe how you want to refactor the code..."
                className="w-full h-24 p-3 text-sm border border-gray-200 rounded-lg focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomPrompt(false);
                    setCustomPrompt('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customPrompt.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Apply
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
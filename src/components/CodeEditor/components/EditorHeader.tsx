import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Settings2, X } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { FrameworkSelector } from './FrameworkSelector';
import { RefactorButton } from './RefactorButton';
import { ActionButtons } from './ActionButtons';
import { Language, Framework, RefactorOption } from '../types';

interface EditorHeaderProps {
  code: string;
  language: Language;
  framework: Framework;
  theme: 'vs-dark' | 'light';
  setTheme: (theme: 'vs-dark' | 'light') => void;
  onLanguageChange: (language: Language) => void;
  onFrameworkChange: (framework: Framework) => void;
  showRecommendations: boolean;
  setShowRecommendations: (show: boolean) => void;
  onRefactor: (option: RefactorOption, customPrompt?: string) => void;
  onClose: () => void;
}

export function EditorHeader({
  code,
  language,
  framework,
  theme,
  setTheme,
  onLanguageChange,
  onFrameworkChange,
  showRecommendations,
  setShowRecommendations,
  onRefactor,
  onClose
}: EditorHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-['Google_Sans'] text-gray-900">Generated Code</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings2 className="w-5 h-5" />
          </button>

          <RefactorButton code={code} onRefactor={onRefactor} />
          
          <ActionButtons
            code={code}
            theme={theme}
            setTheme={setTheme}
            showRecommendations={showRecommendations}
            setShowRecommendations={setShowRecommendations}
          />

          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-6 py-2">
              <LanguageSelector
                language={language}
                onLanguageChange={onLanguageChange}
              />

              {language === 'python' && (
                <FrameworkSelector
                  framework={framework}
                  onFrameworkChange={onFrameworkChange}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
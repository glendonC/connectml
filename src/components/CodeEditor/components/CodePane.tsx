import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from "@monaco-editor/react";
import { RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface CodePaneProps {
  code: string;
  language: Language;
  theme: 'vs-dark' | 'light';
  isRefactoring: boolean;
}

export function CodePane({ code, language, theme, isRefactoring }: CodePaneProps) {
  return (
    <div className="flex-1 relative">
      <AnimatePresence>
        {isRefactoring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 backdrop-blur-sm z-10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-900">Refactoring code...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={theme}
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
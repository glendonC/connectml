import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface CodePaneProps {
  code: string;
  language: string;
  theme: 'vs-dark' | 'light';
  isLoading: boolean;
  isAIGenerated?: boolean;
}

function cleanGeneratedCode(code: string): string {
  // Remove markdown code blocks if present
  if (code.startsWith('```')) {
    const lines = code.split('\n');
    // Find the language line and remove it along with the backticks
    const startIndex = lines[0].includes('python') ? 1 : 0;
    const endIndex = lines.length - (lines[lines.length - 1].trim() === '```' ? 1 : 0);
    return lines.slice(startIndex, endIndex).join('\n');
  }
  return code;
}

export function CodePane({ code, language, theme, isLoading, isAIGenerated }: CodePaneProps) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Reset displayed code when switching between AI and template
  useEffect(() => {
    if (!isAIGenerated) {
      setDisplayedCode(cleanGeneratedCode(code));
      setIsTyping(false);
    }
  }, [isAIGenerated, code]);

  // Handle typing animation for AI-generated code
  useEffect(() => {
    if (!isLoading && isAIGenerated && code) {
      const cleanedCode = cleanGeneratedCode(code);
      if (cleanedCode === displayedCode) return;

      setIsTyping(true);
      let currentIndex = 0;
      const codeArray = cleanedCode.split('');
      
      const typingInterval = setInterval(() => {
        if (currentIndex < codeArray.length) {
          setDisplayedCode(cleanedCode.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 2); // Fast typing speed

      return () => clearInterval(typingInterval);
    }
  }, [code, isLoading, isAIGenerated]);

  return (
    <div className="relative h-full">
      <AnimatePresence>
        {(isLoading || isTyping) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] z-10"
          >
            <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-700">
                {isTyping ? 'Writing code...' : 'Generating AI code...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Editor
        height="100%"
        language={language.toLowerCase()}
        theme={theme}
        value={displayedCode}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipeline } from '../../App';
import { Code, X } from 'lucide-react';
import { EditorHeader } from './components/EditorHeader';
import { CodePane } from './components/CodePane';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { useCodeGeneration } from './hooks/useCodeGeneration';
import { useRefactor } from './hooks/useRefactor';
import { RefactorOption } from './types';

interface CodeEditorProps {
  pipeline: Pipeline;
  onClose: () => void;
}

export function CodeEditor({ pipeline, onClose }: CodeEditorProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { code, language, framework, theme, setTheme, handleLanguageChange, handleFrameworkChange } = useCodeGeneration(pipeline);
  const { isRefactoring, handleRefactor } = useRefactor();

  const handleRefactorCode = async (option: RefactorOption, customPrompt?: string) => {
    const newCode = await handleRefactor(option, code, customPrompt);
    // Update code with refactored version
    // This will be implemented when we connect to the AI backend
    console.log('Refactored code:', newCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-[90vw] h-[90vh] overflow-hidden flex"
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorHeader
            code={code}
            language={language}
            framework={framework}
            theme={theme}
            setTheme={setTheme}
            onLanguageChange={handleLanguageChange}
            onFrameworkChange={handleFrameworkChange}
            showRecommendations={showRecommendations}
            setShowRecommendations={setShowRecommendations}
            onRefactor={handleRefactorCode}
            onClose={onClose}
          />

          <CodePane
            code={code}
            language={language}
            theme={theme}
            isRefactoring={isRefactoring}
          />
        </div>

        {/* Side Panel for Recommendations */}
        <AnimatePresence>
          {showRecommendations && (
            <RecommendationsPanel pipeline={pipeline} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
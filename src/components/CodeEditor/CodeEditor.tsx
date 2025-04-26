import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EditorHeader } from './components/EditorHeader';
import { CodePane } from './components/CodePane';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { useCodeGeneration } from './hooks/useCodeGeneration';
import { useRefactor } from './hooks/useRefactor';
import { Pipeline } from '../../App';
import { RefactorOption } from './types';

interface CodeEditorProps {
  pipeline: Pipeline;
  onClose: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ pipeline, onClose }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [useAIGeneration, setUseAIGeneration] = useState(false);
  const [refactorError, setRefactorError] = useState<string | null>(null);
  
  const {
    code,
    language,
    framework,
    isLoading,
    error,
    setLanguage,
    setFramework,
    setCode,
  } = useCodeGeneration({
    pipeline,
    useAIGeneration,
  });

  const { isRefactoring, selectedRefactorOption, handleRefactor } = useRefactor();

  const handleRefactorCode = async (option: RefactorOption, customPrompt?: string) => {
    try {
      setRefactorError(null);
      const refactoredCode = await handleRefactor(option, code, customPrompt);
      setCode(refactoredCode);
    } catch (error) {
      console.error('Error refactoring code:', error);
      setRefactorError('Failed to refactor code. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-[90vw] h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
      >
        <EditorHeader
          code={code}
          language={language}
          framework={framework}
          theme={theme}
          setTheme={setTheme}
          onLanguageChange={setLanguage}
          onFrameworkChange={setFramework}
          showRecommendations={showRecommendations}
          setShowRecommendations={setShowRecommendations}
          onRefactor={handleRefactorCode}
          onClose={onClose}
          useAIGeneration={useAIGeneration}
          setUseAIGeneration={setUseAIGeneration}
          error={error || refactorError}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 h-full">
            <CodePane
              code={code}
              language={language}
              theme={theme}
              isLoading={isLoading || isRefactoring}
              isAIGenerated={useAIGeneration || selectedRefactorOption !== null}
            />
          </div>
          
          {showRecommendations && (
            <div className="w-80 border-l border-gray-200">
              <RecommendationsPanel
                code={code}
                isLoading={isLoading || isRefactoring}
                onRefactor={handleRefactorCode}
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
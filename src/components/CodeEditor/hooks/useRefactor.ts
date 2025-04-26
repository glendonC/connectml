import { useState } from 'react';
import { RefactorOption } from '../types';

interface RefactorRequest {
  code: string;
  option: RefactorOption;
  customPrompt?: string;
}

const REFACTOR_PROMPTS = {
  simplify: "Simplify this code by removing unnecessary complexity while maintaining its functionality. Focus on making it more concise and easier to understand.",
  addComments: "Add detailed, professional comments to this code explaining what each section does. Include docstrings for functions and classes.",
  optimize: "Optimize this code for readability by improving variable names, function names, and code structure. Ensure it follows best practices and style guidelines.",
};

export function useRefactor() {
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [selectedRefactorOption, setSelectedRefactorOption] = useState<RefactorOption | null>(null);

  const handleRefactor = async (option: RefactorOption, code: string, customPrompt?: string) => {
    setIsRefactoring(true);
    setSelectedRefactorOption(option);

    try {
      const prompt = option === 'custom' 
        ? customPrompt 
        : REFACTOR_PROMPTS[option];

      if (!prompt) {
        throw new Error('Invalid refactor option');
      }

      const response = await fetch('http://localhost:8000/refactor-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to refactor code');
      }

      const data = await response.json();
      if (!data.refactored_code) {
        throw new Error('No refactored code received from server');
      }

      return data.refactored_code;
    } catch (error) {
      console.error('Error in refactoring:', error);
      throw error;
    } finally {
      // Add a small delay before removing loading state to ensure animation is visible
      setTimeout(() => {
        setIsRefactoring(false);
        setSelectedRefactorOption(null);
      }, 500);
    }
  };

  return {
    isRefactoring,
    selectedRefactorOption,
    handleRefactor,
  };
}
import { useState, useEffect } from 'react';
import { Pipeline } from '../../../App';
import { generateCode } from '../utils/codeGenerator';
import { Language, Framework, UseCodeGenerationProps, UseCodeGenerationReturn } from '../types';

export function useCodeGeneration({
  pipeline,
  useAIGeneration,
}: UseCodeGenerationProps): UseCodeGenerationReturn {
  const [language, setLanguage] = useState<Language>('python');
  const [framework, setFramework] = useState<Framework>('pytorch');
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate initial template code
  useEffect(() => {
    if (pipeline) {
      try {
        const templateCode = generateCode(pipeline, language, framework);
        setCode(templateCode);
      } catch (err) {
        console.error('Error generating template code:', err);
        setError('Failed to generate template code');
      }
    }
  }, [pipeline, language, framework]);

  // Handle AI generation when the toggle is switched on
  useEffect(() => {
    const generateAICode = async () => {
      if (!useAIGeneration || !pipeline) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Calling AI generation endpoint...');
        const response = await fetch('http://localhost:8000/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pipeline, 
            language, 
            framework,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate code using AI');
        }

        const data = await response.json();
        console.log('Received AI generated code');
        setCode(data.code);
      } catch (err) {
        console.error('Error generating code:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate code');
        
        // Fallback to template-based generation
        try {
          const templateCode = generateCode(pipeline, language, framework);
          setCode(templateCode);
          setError('AI generation failed. Using template-based generation instead.');
        } catch (fallbackErr) {
          setError('Failed to generate code using both AI and templates.');
        }
      } finally {
        // Keep loading state for a moment to ensure animation is visible
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    if (useAIGeneration) {
      generateAICode();
    }
  }, [useAIGeneration, pipeline, language, framework]);

  return {
    code,
    language,
    framework,
    isLoading,
    error,
    setLanguage,
    setFramework,
    setCode,
  };
}
import { useState } from 'react';
import { Pipeline } from '../../../App';
import { Language, Framework } from '../types';
import { generateCode } from '../utils/codeGenerator';

export function useCodeGeneration(pipeline: Pipeline) {
  const [language, setLanguage] = useState<Language>('python');
  const [framework, setFramework] = useState<Framework>('pytorch');
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [code, setCode] = useState(() => generateCode(pipeline, language, framework));

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(generateCode(pipeline, newLanguage, framework));
  };

  const handleFrameworkChange = (newFramework: Framework) => {
    setFramework(newFramework);
    setCode(generateCode(pipeline, language, newFramework));
  };

  return {
    code,
    language,
    framework,
    theme,
    setTheme,
    handleLanguageChange,
    handleFrameworkChange,
  };
}
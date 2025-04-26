import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="text-sm font-medium text-gray-700">
        Language:
      </label>
      <select
        id="language"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
      </select>
    </div>
  );
}
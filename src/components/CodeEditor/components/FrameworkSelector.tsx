import React from 'react';
import { Framework } from '../types';

interface FrameworkSelectorProps {
  framework: Framework;
  onFrameworkChange: (framework: Framework) => void;
}

export function FrameworkSelector({ framework, onFrameworkChange }: FrameworkSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="framework" className="text-sm font-medium text-gray-700">
        Framework:
      </label>
      <select
        id="framework"
        value={framework}
        onChange={(e) => onFrameworkChange(e.target.value as Framework)}
        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="pytorch">PyTorch</option>
        <option value="tensorflow">TensorFlow</option>
        <option value="sklearn">scikit-learn</option>
      </select>
    </div>
  );
}
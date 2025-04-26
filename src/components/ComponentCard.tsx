import React from 'react';
import { motion } from 'framer-motion';
import { MLComponent } from '../types/components';
import { Database, Sparkles, Code, Brain, LineChart, Activity, Search, Package, ChevronRight } from 'lucide-react';

interface ComponentCardProps {
  component: MLComponent;
  isSelected?: boolean;
  onClick?: () => void;
}

const getIconByType = (type: string) => {
  switch (type) {
    case 'preprocessing': return <Database className="w-5 h-5" />;
    case 'model': return <Sparkles className="w-5 h-5" />;
    case 'postprocessing': return <Code className="w-5 h-5" />;
    case 'feature': return <LineChart className="w-5 h-5" />;
    case 'transformation': return <Activity className="w-5 h-5" />;
    case 'monitoring': return <Search className="w-5 h-5" />;
    case 'explainability': return <Brain className="w-5 h-5" />;
    default: return <Database className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'preprocessing': return 'bg-blue-100 text-blue-600';
    case 'model': return 'bg-purple-100 text-purple-600';
    case 'postprocessing': return 'bg-green-100 text-green-600';
    case 'feature': return 'bg-orange-100 text-orange-600';
    case 'transformation': return 'bg-yellow-100 text-yellow-600';
    case 'monitoring': return 'bg-red-100 text-red-600';
    case 'explainability': return 'bg-indigo-100 text-indigo-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export function ComponentCard({ component, isSelected, onClick }: ComponentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden transition-all cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-100' 
          : 'border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Component Type Banner */}
      <div className={`px-4 py-2 border-b ${getTypeColor(component.type)} border-opacity-20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIconByType(component.type)}
            <span className="text-sm font-medium">
              {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
            </span>
          </div>
          <span className="text-2xl">{component.icon}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-['Google_Sans'] text-lg text-gray-900">
            {component.displayName}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {component.description}
          </p>
        </div>

        {/* Requirements */}
        {component.requirements && (
          <div className="space-y-3">
            {/* Dependencies */}
            <div className="flex flex-wrap gap-1">
              {component.requirements.dependencies.slice(0, 3).map((dep, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-600"
                >
                  <Package className="w-3 h-3" />
                  {dep.split('>=')[0]}
                </span>
              ))}
              {component.requirements.dependencies.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-600">
                  +{component.requirements.dependencies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Code Preview */}
        {component.codeSnippet && (
          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
            <pre className="text-xs text-gray-300 font-mono">
              {component.codeSnippet}
            </pre>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isSelected
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isSelected ? 'Selected' : 'Add to Pipeline'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
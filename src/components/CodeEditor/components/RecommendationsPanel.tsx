import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Wand2 } from 'lucide-react';
import { useRecommendations } from '../hooks/useRecommendations';
import { RefactorOption } from '../types';

interface RecommendationsPanelProps {
  code: string;
  isLoading: boolean;
  onRefactor: (option: RefactorOption, customPrompt?: string) => void;
}

export function RecommendationsPanel({ code, isLoading, onRefactor }: RecommendationsPanelProps) {
  const recommendations = useRecommendations(code);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Refactoring Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Code Improvements</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => onRefactor('simplify')}
                  className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <Wand2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Simplify Code</div>
                      <div className="text-sm text-gray-600">Make the code more concise and readable</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onRefactor('addComments')}
                  className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Add Comments</div>
                      <div className="text-sm text-gray-600">Explain the code with detailed comments</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onRefactor('optimize')}
                  className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium text-gray-900">Optimize Performance</div>
                      <div className="text-sm text-gray-600">Improve code efficiency and speed</div>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Training Requirements */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Training Requirements</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-yellow-500" />
            {recommendations.requiresTraining
              ? "This pipeline requires training. Consider using the recommended hardware for optimal performance."
              : "This pipeline can run inference without training. Pre-trained models will be used."}
          </div>
        </div>

        {/* Hardware Recommendations */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Hardware</h3>
          <div className="space-y-3">
            {recommendations.hardware.map((hw, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img src={hw.icon} alt={hw.provider} className="w-6 h-6" />
                  <div>
                    <div className="font-medium text-gray-900">{hw.name}</div>
                    <div className="text-sm text-gray-600">{hw.description}</div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-blue-600">{hw.cost}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{hw.provider}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Recommendations */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Platforms</h3>
          <div className="space-y-3">
            {recommendations.platforms.map((platform, i) => (
              <a
                key={i}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img src={platform.icon} alt={platform.name} className="w-6 h-6" />
                  <div>
                    <div className="font-medium text-gray-900">{platform.name}</div>
                    <div className="text-sm text-gray-600">{platform.description}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {platform.features.map((feature, j) => (
                        <span
                          key={j}
                          className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
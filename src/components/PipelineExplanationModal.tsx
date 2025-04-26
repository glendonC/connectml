import React from 'react';
import { motion } from 'framer-motion';
import { Pipeline } from '../App';
import { 
  Brain, 
  X, 
  ArrowRight,
  Database,
  Sparkles,
  Code,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';

interface PipelineExplanationModalProps {
  pipeline: Pipeline;
  onClose: () => void;
}

export function PipelineExplanationModal({ pipeline, onClose }: PipelineExplanationModalProps) {
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
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-['Google_Sans'] text-gray-900">How This Pipeline Works</h2>
                <p className="text-sm text-gray-600">A clear explanation of your solution</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
            {/* Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-['Google_Sans'] text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-700">{pipeline.description}</p>
                </div>
              </div>
            </div>

            {/* Pipeline Steps */}
            <div className="space-y-4">
              {pipeline.components.map((component, index) => (
                <div key={component.id} className="relative">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Step Header */}
                    <div className={`px-4 py-2 border-b ${
                      component.type === 'preprocessing' ? 'bg-blue-50 border-blue-100' :
                      component.type === 'model' ? 'bg-purple-50 border-purple-100' :
                      'bg-green-50 border-green-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {component.type === 'preprocessing' ? <Database className="w-4 h-4" /> :
                           component.type === 'model' ? <Sparkles className="w-4 h-4" /> :
                           <Code className="w-4 h-4" />}
                          <span className="text-sm font-['Google_Sans']">Step {index + 1}</span>
                        </div>
                        <span className="text-sm opacity-75">{component.type}</span>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-4">
                      <div className="space-y-3">
                        <h4 className="font-['Google_Sans'] text-gray-900">{component.name}</h4>
                        <p className="text-gray-600">{component.description}</p>

                        {component.agentReasoning && (
                          <div className="mt-4 space-y-3">
                            {/* Why This Step */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div>
                                  <div className="font-['Google_Sans'] text-sm text-gray-900 mb-1">Why this step?</div>
                                  <p className="text-sm text-gray-600">{component.agentReasoning.why}</p>
                                </div>
                              </div>
                            </div>

                            {/* Key Benefits */}
                            {component.agentReasoning.note && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                  <div>
                                    <div className="font-['Google_Sans'] text-sm text-gray-900 mb-1">Key Benefits</div>
                                    <p className="text-sm text-green-700">{component.agentReasoning.note}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < pipeline.components.length - 1 && (
                    <div className="h-8 w-px bg-gray-200 absolute left-1/2 -bottom-8" />
                  )}
                </div>
              ))}
            </div>

            {/* Integration Notes */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Zap className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-['Google_Sans'] text-gray-900 mb-2">Integration Notes</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span>Integrates with existing systems via standard APIs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span>Automated monitoring reduces maintenance needs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span>Scales to handle increased data volumes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
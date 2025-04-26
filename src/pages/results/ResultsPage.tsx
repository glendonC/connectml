import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipeline, PipelineComponent } from '../../App';
import { ArrowLeft, Code, Brain, Library, X } from 'lucide-react';
import { FlowView } from './views/FlowView';
import { AgentReasoningView } from './views/AgentReasoningView';
import { ThreeDView } from './views/ThreeDView';
import { ViewTab, ViewType, tabs } from './types';
import { CodeEditor } from '../../components/CodeEditor/CodeEditor';
import { PipelineExplanationModal } from '../../components/PipelineExplanationModal';
import { ComponentCatalog } from '../../components/ComponentCatalog';
import { usePipeline } from '../../context/PipelineContext';

interface ResultsPageProps {
  pipeline: Pipeline;
  onBack: () => void;
}

export function ResultsPage({ pipeline, onBack }: ResultsPageProps) {
  const [activeView, setActiveView] = useState<ViewType>('flow');
  const [hoveredTab, setHoveredTab] = useState<ViewType | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const { setPipeline } = usePipeline();

  const handleAddComponents = (newComponents: PipelineComponent[]) => {
    setPipeline({
      ...pipeline,
      components: [...pipeline.components, ...newComponents]
    });
  };

  const isModalOpen = showCodeEditor || showExplanation || showCatalog;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-1">
              <button
                onClick={onBack}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Search
              </button>
              <h1 className="text-xl font-['Google_Sans'] text-gray-900">
                {pipeline.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCatalog(!showCatalog)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Library className="w-4 h-4" />
                <span className="text-sm">Add Components</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExplanation(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm">Explain This Plan</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCodeEditor(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Code className="w-4 h-4" />
                <span className="text-sm">Export Code</span>
              </motion.button>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="relative flex items-stretch border-t border-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-4 text-sm transition-all ${
                    activeView === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </div>

                  {/* Active Tab Indicator */}
                  {activeView === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredTab === tab.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
                      >
                        {tab.description}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'agent' && (
              <AgentReasoningView pipeline={pipeline} />
            )}
            {activeView === 'flow' && (
              <FlowView pipeline={pipeline} />
            )}
            {activeView === '3d' && (
              <ThreeDView pipeline={pipeline} hideLabels={isModalOpen} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCodeEditor && (
          <CodeEditor
            pipeline={pipeline}
            onClose={() => setShowCodeEditor(false)}
          />
        )}
        {showExplanation && (
          <PipelineExplanationModal
            pipeline={pipeline}
            onClose={() => setShowExplanation(false)}
          />
        )}
        {showCatalog && (
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
              className="bg-white rounded-xl shadow-xl w-full max-w-[90vw] h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Library className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-['Google_Sans'] text-gray-900">Component Catalog</h2>
                    <p className="text-sm text-gray-600">Add components to enhance your pipeline</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCatalog(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[calc(90vh-73px)] overflow-y-auto">
                <ComponentCatalog
                  pipeline={pipeline}
                  onAddComponents={handleAddComponents}
                  onClose={() => setShowCatalog(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
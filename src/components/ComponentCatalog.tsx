import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MLComponent, componentCatalog } from '../types/components';
import { ComponentCard } from './ComponentCard';
import { Search, Filter, HelpCircle, Package, Plus } from 'lucide-react';
import { PipelinePreview } from './PipelinePreview';
import { Pipeline, PipelineComponent } from '../App';

interface ComponentCatalogProps {
  pipeline: Pipeline;
  onAddComponents: (components: PipelineComponent[]) => void;
  onClose: () => void;
}

export function ComponentCatalog({ pipeline, onAddComponents, onClose }: ComponentCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<MLComponent[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Get unique types and environments
  const types = Array.from(new Set(componentCatalog.map(c => c.type)));
  const environments = Array.from(new Set(
    componentCatalog.flatMap(c => c.requirements?.environments || [])
  ));
  const allDependencies = Array.from(new Set(
    componentCatalog.flatMap(c => 
      c.requirements?.dependencies.map(d => d.split('>=')[0]) || []
    )
  ));

  const filteredComponents = componentCatalog.filter(component => {
    const matchesSearch = component.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || component.type === selectedType;
    const matchesEnvironment = !selectedEnvironment || 
                             component.requirements?.environments.includes(selectedEnvironment);
    const matchesDependencies = selectedDependencies.length === 0 || 
                               selectedDependencies.every(dep => 
                                 component.requirements?.dependencies.some(d => d.includes(dep))
                               );
    return matchesSearch && matchesType && matchesEnvironment && matchesDependencies;
  });

  const handleComponentClick = (component: MLComponent) => {
    setSelectedComponents(prev => {
      const isSelected = prev.some(c => c.id === component.id);
      return isSelected
        ? prev.filter(c => c.id !== component.id)
        : [...prev, component];
    });
  };

  const handlePreviewConfirm = () => {
    const newComponents: PipelineComponent[] = selectedComponents.map((component, index) => ({
      id: component.id,
      name: component.displayName,
      description: component.description,
      type: component.type,
      requirements: component.requirements,
      agentReasoning: {
        agentName: component.agent.name,
        role: component.agent.role,
        quote: component.agent.quote,
        componentTitle: component.displayName,
        description: component.description,
        why: `Added to enhance pipeline capabilities with ${component.displayName.toLowerCase()}`,
        performanceImpact: {
          accuracy: '+0%',
          latency: '0ms',
          reliability: '+0%'
        }
      },
      flowNode: {
        stepId: component.id,
        title: component.displayName,
        nodeType: component.type,
        position: { 
          x: (pipeline.components.length + index + 1) * 300, 
          y: 100 
        },
        agent: component.agent.name,
        shortSummary: component.description,
        impactMetric: 'New Component',
        connections: []
      },
      threeDNode: {
        title: component.displayName,
        nodeType: component.type,
        agent: component.agent.name,
        impact: 'New Component',
        tooltip: component.description,
        position3D: { 
          x: (pipeline.components.length + index + 1) * 6, 
          y: 0, 
          z: 0 
        }
      }
    }));

    onAddComponents(newComponents);
    setShowPreview(false);
    onClose();
  };

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedEnvironment(null);
    setSelectedDependencies([]);
  };

  return (
    <>
      <div className="bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search components..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-full"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {(selectedType || selectedEnvironment || selectedDependencies.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              disabled={selectedComponents.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedComponents.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
              Preview Add ({selectedComponents.length})
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Google_Sans'] text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Component Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Component Type
                      </label>
                      <select
                        value={selectedType || ''}
                        onChange={(e) => setSelectedType(e.target.value || null)}
                        className="w-full rounded-lg border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      >
                        <option value="">All Types</option>
                        {types.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Environment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Environment
                      </label>
                      <select
                        value={selectedEnvironment || ''}
                        onChange={(e) => setSelectedEnvironment(e.target.value || null)}
                        className="w-full rounded-lg border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      >
                        <option value="">All Environments</option>
                        {environments.map(env => (
                          <option key={env} value={env}>{env}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dependencies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Dependencies
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allDependencies.map(dep => (
                        <button
                          key={dep}
                          onClick={() => setSelectedDependencies(prev => 
                            prev.includes(dep)
                              ? prev.filter(d => d !== dep)
                              : [...prev, dep]
                          )}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedDependencies.includes(dep)
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Package className="w-4 h-4" />
                          {dep}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Component Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredComponents.map((component) => (
                <motion.div
                  key={component.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ComponentCard
                    component={component}
                    isSelected={selectedComponents.some(c => c.id === component.id)}
                    onClick={() => handleComponentClick(component)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredComponents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <HelpCircle className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-['Google_Sans'] text-gray-900 mb-2">
                No components found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <PipelinePreview
            pipeline={pipeline}
            selectedComponents={selectedComponents}
            onClose={() => setShowPreview(false)}
            onConfirm={handlePreviewConfirm}
          />
        )}
      </AnimatePresence>
    </>
  );
}
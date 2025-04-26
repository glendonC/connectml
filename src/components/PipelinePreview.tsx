import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pipeline, PipelineComponent } from '../App';
import { X, ArrowRight, Check, Database, Sparkles, Code, Package, AlertTriangle, Wand2 } from 'lucide-react';

interface PipelinePreviewProps {
  pipeline: Pipeline;
  selectedComponents: PipelineComponent[];
  onClose: () => void;
  onConfirm: (validatedComponents?: PipelineComponent[]) => void;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  message?: string;
  suggestedOrder?: PipelineComponent[] | null;
  restructuringNotes?: string[];
}

const getIconByType = (type: string) => {
  switch (type) {
    case 'preprocessing': return <Database className="w-4 h-4" />;
    case 'model': return <Sparkles className="w-4 h-4" />;
    case 'postprocessing': return <Code className="w-4 h-4" />;
    default: return <Database className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'preprocessing': return 'bg-blue-100 text-blue-600';
    case 'model': return 'bg-purple-100 text-purple-600';
    case 'postprocessing': return 'bg-green-100 text-green-600';
    case 'feature': return 'bg-orange-100 text-orange-600';
    case 'transformation': return 'bg-cyan-100 text-cyan-600';
    case 'monitoring': return 'bg-yellow-100 text-yellow-600';
    case 'explainability': return 'bg-rose-100 text-rose-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export function PipelinePreview({ pipeline, selectedComponents, onClose, onConfirm }: PipelinePreviewProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    warnings: [],
    errors: [],
  });
  const [components, setComponents] = useState([...pipeline.components, ...selectedComponents]);

  const validatePipeline = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('http://localhost:8000/validate-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_components: pipeline.components,
          new_components: selectedComponents,
        }),
      });

      const data = await response.json();
      
      if (data.suggested_order) {
        setComponents(data.suggested_order);
      }
      
      setValidationResult({
        isValid: data.valid,
        warnings: [],
        errors: data.valid ? [] : [data.message],
        message: data.message,
        suggestedOrder: data.suggested_order,
        restructuringNotes: data.restructuring_notes,
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        warnings: [],
        errors: ['Failed to validate pipeline'],
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Validation Rules
  const validation = useMemo((): ValidationResult => {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: []
    };

    const allComponents = [...pipeline.components, ...selectedComponents];

    // Rule 1: Check component order (preprocessing -> model -> postprocessing)
    const hasModel = allComponents.some(c => c.type === 'model');
    const hasPostprocessing = allComponents.some(c => c.type === 'postprocessing');
    
    if (hasPostprocessing && !hasModel) {
      result.errors.push('Postprocessing components require a model component');
      result.isValid = false;
    }

    // Rule 2: Check for duplicate component types in sequence
    allComponents.forEach((component, index) => {
      if (index > 0 && component.type === allComponents[index - 1].type) {
        result.warnings.push(`Multiple ${component.type} components in sequence may impact performance`);
      }
    });

    // Rule 3: Check for dependency conflicts
    const allDependencies = new Map<string, string>();
    allComponents.forEach(component => {
      component.requirements?.dependencies.forEach(dep => {
        const [name, version] = dep.split('>=');
        if (allDependencies.has(name)) {
          const existingVersion = allDependencies.get(name);
          if (existingVersion !== version) {
            result.warnings.push(`Potential version conflict for dependency ${name}`);
          }
        } else {
          allDependencies.set(name, version);
        }
      });
    });

    // Rule 4: Check environment compatibility
    const environments = allComponents.map(c => c.requirements?.environments || []);
    const commonEnvironments = environments.reduce((acc, curr) => 
      acc.filter(env => curr.includes(env))
    );

    if (commonEnvironments.length === 0) {
      result.errors.push('No compatible environment found across components');
      result.isValid = false;
    }

    return result;
  }, [pipeline, selectedComponents]);

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
        className="bg-white rounded-xl shadow-xl w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-['Google_Sans'] text-gray-900">Preview Changes</h2>
            <p className="text-sm text-gray-600">
              Review how the selected components will fit into your pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Messages */}
        {(validationResult.errors.length > 0 || validationResult.warnings.length > 0 || validationResult.message) && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {validationResult.errors.map((error, index) => (
              <div key={`error-${index}`} className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            ))}
            {validationResult.warnings.map((warning, index) => (
              <div key={`warning-${index}`} className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{warning}</span>
              </div>
            ))}
            {validationResult.message && !validationResult.errors.includes(validationResult.message) && (
              <div className="flex items-center gap-2 text-blue-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">{validationResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Pipeline Flow */}
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Existing Pipeline */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Current Pipeline</h3>
              <div className="flex items-center gap-3">
                {pipeline.components.map((component, index) => (
                  <React.Fragment key={component.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${getTypeColor(component.type)}`}>
                            {getIconByType(component.type)}
                          </div>
                          <span className="font-['Google_Sans'] text-gray-900">
                            {component.name}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {component.description}
                        </p>
                      </div>
                    </motion.div>
                    {index < pipeline.components.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                  Adding {selectedComponents.length} new component{selectedComponents.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* New Components */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Updated Pipeline</h3>
              <div className="flex items-center gap-3">
                {components.map((component, index) => (
                  <React.Fragment key={component.id}>
                    <motion.div
                      initial={index >= pipeline.components.length ? { opacity: 0, scale: 0.9 } : false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white rounded-lg border shadow-sm ${
                        index >= pipeline.components.length
                          ? 'border-blue-200 shadow-blue-100'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`px-4 py-3 border-b ${
                        index >= pipeline.components.length
                          ? 'bg-blue-50 border-blue-100'
                          : 'border-gray-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${getTypeColor(component.type)}`}>
                            {getIconByType(component.type)}
                          </div>
                          <span className="font-['Google_Sans'] text-gray-900">
                            {index >= pipeline.components.length ? component.name : component.name}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {component.description}
                        </p>
                        {component.requirements?.dependencies && (
                          <div className="flex flex-wrap gap-1">
                            {component.requirements.dependencies.map((dep, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-600"
                              >
                                <Package className="w-3 h-3" />
                                {dep.split('>=')[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                    {index < (pipeline.components.length + selectedComponents.length - 1) && (
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={validatePipeline}
              disabled={isValidating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isValidating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              {isValidating ? 'Validating...' : 'Validate Pipeline'}
            </button>
            <button
              onClick={() => onConfirm(validationResult.suggestedOrder || undefined)}
              disabled={!validationResult.isValid}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                validationResult.isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Add to Pipeline
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
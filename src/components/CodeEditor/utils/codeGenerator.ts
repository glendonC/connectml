import { Pipeline, PipelineComponent } from '../../../App';
import { Language, Framework } from '../types';
import { tensorflowImports, generateModelClass as generateTensorflowModel, generateTrainingLoop as generateTensorflowTraining } from './templates/python/tensorflow';
import { sklearnImports, generateModelClass as generateSklearnModel, generateTrainingLoop as generateSklearnTraining } from './templates/python/sklearn';
import { pytorchImports, generateModelClass as generatePytorchModel, generateTrainingLoop as generatePytorchTraining } from './templates/python/pytorch';

export const generateCode = (pipeline: Pipeline, language: Language, framework: Framework): string => {
  if (language === 'json') {
    return JSON.stringify(pipeline, null, 2);
  }

  if (language === 'python') {
    const imports = [
      'import logging',
      'import numpy as np',
      'import pandas as pd',
      'from typing import Dict, List, Tuple, Any',
    ];

    const setupLogging = `
# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
`;

    let frameworkImports: string[] = [];
    let modelGenerator: (component: PipelineComponent) => string;
    let trainingGenerator: () => string;

    // Select framework-specific templates
    switch (framework) {
      case 'pytorch':
        frameworkImports = pytorchImports;
        modelGenerator = generatePytorchModel;
        trainingGenerator = generatePytorchTraining;
        break;
      case 'tensorflow':
        frameworkImports = tensorflowImports;
        modelGenerator = generateTensorflowModel;
        trainingGenerator = generateTensorflowTraining;
        break;
      case 'sklearn':
        frameworkImports = sklearnImports;
        modelGenerator = generateSklearnModel;
        trainingGenerator = generateSklearnTraining;
        break;
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }

    // Generate code for each component
    const components = pipeline.components.map(component => {
      switch (component.type) {
        case 'preprocessing':
          return `
class ${component.name.replace(/\s+/g, '')}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def process(self, data: Any) -> Any:
        """Process the input data.
        
        Args:
            data: Input data to process
            
        Returns:
            Processed data
        """
        self.logger.info("Processing data...")
        # TODO: Implement preprocessing logic
        return data
`;
        case 'model':
          return modelGenerator(component);
        case 'postprocessing':
          return `
class ${component.name.replace(/\s+/g, '')}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def process(self, predictions: Any) -> Any:
        """Process model predictions.
        
        Args:
            predictions: Raw model predictions
            
        Returns:
            Processed predictions
        """
        self.logger.info("Post-processing predictions...")
        # TODO: Implement post-processing logic
        return predictions
`;
        default:
          return '';
      }
    }).join('\n\n');

    // Generate main pipeline class
    const pipelineClass = `
class MLPipeline:
    """Main pipeline class that orchestrates the ML workflow."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        ${pipeline.components.map(c => 
          `self.${c.name.toLowerCase().replace(/\s+/g, '_')} = ${c.name.replace(/\s+/g, '')}()`
        ).join('\n        ')}
    
    def run(self, data: Any) -> Any:
        """Run the complete pipeline.
        
        Args:
            data: Input data
            
        Returns:
            Processed results
        """
        self.logger.info("Running pipeline...")
        
        # Process data through each component
        result = data
        ${pipeline.components.map(c => {
          const varName = c.name.toLowerCase().replace(/\s+/g, '_');
          if (c.type === 'model') {
            return `result = self.${varName}.predict(result)`;
          }
          return `result = self.${varName}.process(result)`;
        }).join('\n        ')}
        
        return result

if __name__ == "__main__":
    # Example usage
    pipeline = MLPipeline()
    
    # Load and prepare your data here
    data = None  # Replace with actual data loading
    
    # Run the pipeline
    result = pipeline.run(data)
    print("Pipeline execution completed.")
`;

    // Combine all code sections
    return [
      ...imports,
      ...frameworkImports,
      setupLogging,
      components,
      trainingGenerator(),
      pipelineClass
    ].join('\n\n');
  }

  throw new Error(`Unsupported language: ${language}`);
};
import { Pipeline, PipelineComponent } from '../../../../../App';

export const pythonBaseImports = {
  preprocessing: [
    'import numpy as np',
    'import pandas as pd',
    'from sklearn.preprocessing import StandardScaler, MinMaxScaler',
    'from sklearn.base import BaseEstimator, TransformerMixin',
  ],
  model: [],  // Framework-specific imports will be added
  postprocessing: [
    'import json',
    'from datetime import datetime',
    'from typing import Dict, List, Any',
  ],
  utils: [
    'import logging',
    'from pathlib import Path',
    'import yaml',
  ]
};

export const generatePreprocessingClass = (component: PipelineComponent) => `
class ${component.name.replace(/\s+/g, '')}(TransformerMixin, BaseEstimator):
    """${component.description}
    
    A preprocessing component that ${component.description.toLowerCase()}
    """
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        ${component.type === 'preprocessing' ? 'self.scaler = StandardScaler()' : ''}
    
    def fit(self, X, y=None):
        """Fit the preprocessing component.
        
        Args:
            X: Input features
            y: Target variable (optional)
            
        Returns:
            self: The fitted transformer
        """
        self.logger.info("Fitting ${component.name}")
        ${component.type === 'preprocessing' ? 'self.scaler.fit(X)' : 'pass'}
        return self
    
    def transform(self, X):
        """Transform the input data.
        
        Args:
            X: Input features to transform
            
        Returns:
            np.ndarray: Transformed features
        """
        self.logger.info("Transforming data with ${component.name}")
        ${component.type === 'preprocessing' ? 'return self.scaler.transform(X)' : 'return X'}
`;

export const generatePostprocessingClass = (component: PipelineComponent) => `
class ${component.name.replace(/\s+/g, '')}:
    """${component.description}
    
    A postprocessing component that handles the output formatting and validation.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def process(self, predictions: np.ndarray) -> Dict[str, Any]:
        """Process the model predictions.
        
        Args:
            predictions: Raw model predictions
            
        Returns:
            Dict[str, Any]: Formatted predictions with metadata
        """
        self.logger.info("Post-processing predictions")
        return {
            'predictions': predictions.tolist(),
            'timestamp': datetime.now().isoformat(),
            'metadata': {
                'component': '${component.name}',
                'version': '1.0.0'
            }
        }
`;

export const generateUtilityFunctions = () => `
def setup_logging(level=logging.INFO):
    """Set up logging configuration."""
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)
`;

export const generateMainFunction = (pipeline: Pipeline) => `
def main():
    """Main function to run the pipeline."""
    setup_logging()
    
    # Initialize pipeline components
    ${pipeline.components.map(c => 
      `${c.name.toLowerCase()} = ${c.name.replace(/\s+/g, '')}()`
    ).join('\n    ')}
    
    # Create pipeline
    pipeline = Pipeline([
        ${pipeline.components.map((c, i) => 
          `('${c.name.toLowerCase()}', ${c.name.toLowerCase()})`
        ).join(',\n        ')}
    ])
    
    return pipeline

if __name__ == '__main__':
    main()
`; 
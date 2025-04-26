import { Pipeline } from '../../../App';
import { Language, Framework } from '../types';

export function generateCode(pipeline: Pipeline, language: Language, framework: Framework): string {
  if (language === 'json') {
    return JSON.stringify(pipeline, null, 2);
  }

  const imports = {
    pytorch: [
      'import numpy as np',
      'import pandas as pd',
      'from sklearn.preprocessing import StandardScaler',
      'import torch',
      'import torch.nn as nn',
      ''
    ],
    tensorflow: [
      'import numpy as np',
      'import pandas as pd',
      'from sklearn.preprocessing import StandardScaler',
      'import tensorflow as tf',
      'from tensorflow.keras import layers, Model',
      ''
    ],
    sklearn: [
      'import numpy as np',
      'import pandas as pd',
      'from sklearn.preprocessing import StandardScaler',
      'from sklearn.pipeline import Pipeline',
      'from sklearn.base import BaseEstimator, TransformerMixin',
      ''
    ]
  };

  const components = pipeline.components.map(component => {
    switch (component.type) {
      case 'preprocessing':
        return `
class ${component.name.replace(/\s+/g, '')}:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def fit_transform(self, X):
        # ${component.description}
        return self.scaler.fit_transform(X)
        
    def transform(self, X):
        return self.scaler.transform(X)`;
      
      case 'model':
        if (framework === 'pytorch') {
          return `
class ${component.name.replace(/\s+/g, '')}(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, output_size)
        )
        
    def forward(self, x):
        # ${component.description}
        return self.layers(x)`;
        }
        
        if (framework === 'tensorflow') {
          return `
class ${component.name.replace(/\s+/g, '')}(Model):
    def __init__(self):
        super().__init__()
        self.layers_list = [
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(64, activation='relu'),
            layers.Dense(output_size)
        ]
        
    def call(self, x):
        # ${component.description}
        for layer in self.layers_list:
            x = layer(x)
        return x`;
        }
        
        return `
class ${component.name.replace(/\s+/g, '')}(BaseEstimator):
    def __init__(self):
        self.model = Pipeline([
            ('dense1', Dense(128)),
            ('relu1', ReLU()),
            ('dropout', Dropout(0.2)),
            ('dense2', Dense(64)),
            ('relu2', ReLU()),
            ('output', Dense(output_size))
        ])
        
    def fit(self, X, y):
        # ${component.description}
        return self.model.fit(X, y)
        
    def predict(self, X):
        return self.model.predict(X)`;
      
      case 'postprocessing':
        return `
class ${component.name.replace(/\s+/g, '')}:
    def __init__(self):
        pass
        
    def process(self, predictions):
        # ${component.description}
        return predictions`;
      
      default:
        return '';
    }
  });

  const pipelineClass = `
class ${pipeline.name.replace(/\s+/g, '')}:
    def __init__(self):
        ${pipeline.components.map(c => 
          `self.${c.name.toLowerCase().replace(/\s+/g, '_')} = ${c.name.replace(/\s+/g, '')}()`
        ).join('\n        ')}
        
    def predict(self, X):
        # Process input through the pipeline
        ${pipeline.components.map((c, i) => {
          if (i === 0) return `x = self.${c.name.toLowerCase().replace(/\s+/g, '_')}.fit_transform(X)`;
          if (c.type === 'model') return `x = self.${c.name.toLowerCase().replace(/\s+/g, '_')}(x)`;
          return `x = self.${c.name.toLowerCase().replace(/\s+/g, '_')}.process(x)`;
        }).join('\n        ')}
        return x`;

  return [...(imports[framework] || []), ...components, pipelineClass].join('\n');
}
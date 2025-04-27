import { Pipeline, PipelineComponent } from '../../../App';
import { ComponentType } from '../../../config/componentConfig';
import { Language, Framework } from '../types';
import { tensorflowImports, generateModelClass as generateTensorflowModel, generateTrainingLoop as generateTensorflowTraining } from './templates/python/tensorflow';
import { sklearnImports, generateModelClass as generateSklearnModel, generateTrainingLoop as generateSklearnTraining } from './templates/python/sklearn';
import { pytorchImports, generateModelClass as generatePytorchModel, generateTrainingLoop as generatePytorchTraining } from './templates/python/pytorch';

interface DatasetInfo {
  name: string;
  type: string;
  size: number;
  columns?: string[];
  sample?: any[];
  targetColumn?: string;
  problemType?: 'classification' | 'regression' | 'clustering' | 'other';
  dataCharacteristics?: {
    hasMissingValues?: boolean;
    hasCategoricalFeatures?: boolean;
    hasNumericalFeatures?: boolean;
    hasTextFeatures?: boolean;
    hasImageFeatures?: boolean;
  };
}

export const generateCode = (
  pipeline: Pipeline, 
  language: Language, 
  framework: Framework,
  dataset?: DatasetInfo,
  problemStatement?: string
): string => {
  if (language === 'json') {
    return JSON.stringify(pipeline, null, 2);
  }

  if (language === 'python') {
    const imports = [
      'import logging',
      'import numpy as np',
      'import pandas as pd',
      'from typing import Dict, List, Tuple, Any',
      'import os',
      'from pathlib import Path',
      'import matplotlib.pyplot as plt',
      'import seaborn as sns',
    ];

    const setupLogging = `
# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
`;

    const problemContext = problemStatement ? `
"""
Problem Statement:
${problemStatement}

This pipeline is designed to address the above problem using the following approach:
1. Data loading and validation
2. Feature engineering and preprocessing
3. Model training and evaluation
4. Results interpretation and deployment
"""
` : '';

    const dataLoading = `
def load_dataset(file_path: str) -> pd.DataFrame:
    """Load the dataset from the specified file path.
    
    Args:
        file_path: Path to the dataset file
        
    Returns:
        Loaded dataset as a pandas DataFrame
    """
    logger.info(f"Loading dataset from {file_path}")
    
    # Get file extension
    file_ext = Path(file_path).suffix.lower()
    
    # Load data based on file extension
    if file_ext == '.csv':
        data = pd.read_csv(file_path)
    elif file_ext == '.json':
        data = pd.read_json(file_path)
    elif file_ext == '.xlsx' or file_ext == '.xls':
        data = pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")
    
    logger.info(f"Dataset loaded successfully. Shape: {data.shape}")
    return data
`;

    const dataExploration = dataset ? `
def explore_dataset(data: pd.DataFrame) -> None:
    """Perform exploratory data analysis on the dataset.
    
    Args:
        data: DataFrame to explore
    """
    logger.info("Performing exploratory data analysis...")
    
    # Basic statistics
    logger.info("\\nDataset Statistics:")
    logger.info(f"Number of samples: {len(data)}")
    logger.info(f"Number of features: {len(data.columns)}")
    logger.info("\\nFeature types:")
    logger.info(data.dtypes)
    
    # Target variable analysis
    ${dataset.targetColumn ? `
    if "${dataset.targetColumn}" in data.columns:
        logger.info("\\nTarget variable distribution:")
        logger.info(data["${dataset.targetColumn}"].value_counts())
        plt.figure(figsize=(10, 6))
        sns.countplot(data=data, x="${dataset.targetColumn}")
        plt.title("Target Variable Distribution")
        plt.savefig("target_distribution.png")
        plt.close()
    ` : ''}
    
    # Missing values analysis
    ${dataset.dataCharacteristics?.hasMissingValues ? `
    missing_values = data.isnull().sum()
    if missing_values.any():
        logger.info("\\nMissing values per feature:")
        logger.info(missing_values[missing_values > 0])
        plt.figure(figsize=(10, 6))
        sns.heatmap(data.isnull(), cbar=False)
        plt.title("Missing Values Heatmap")
        plt.savefig("missing_values.png")
        plt.close()
    ` : ''}
    
    # Feature correlation analysis
    ${dataset.dataCharacteristics?.hasNumericalFeatures ? `
    numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
    if len(numerical_cols) > 1:
        plt.figure(figsize=(12, 8))
        sns.heatmap(data[numerical_cols].corr(), annot=True, cmap='coolwarm')
        plt.title("Feature Correlation Matrix")
        plt.savefig("correlation_matrix.png")
        plt.close()
    ` : ''}
    
    logger.info("Exploratory data analysis completed")
` : '';

    const dataPreprocessing = dataset ? `
def preprocess_data(data: pd.DataFrame) -> pd.DataFrame:
    """Preprocess the dataset based on its characteristics.
    
    Args:
        data: Input DataFrame
        
    Returns:
        Preprocessed DataFrame
    """
    logger.info("Preprocessing data...")
    
    # Handle missing values
    ${dataset.dataCharacteristics?.hasMissingValues ? `
    for col in data.columns:
        if data[col].isnull().any():
            if data[col].dtype in ['int64', 'float64']:
                data[col] = data[col].fillna(data[col].median())
            else:
                data[col] = data[col].fillna(data[col].mode()[0])
    ` : ''}
    
    # Handle categorical features
    ${dataset.dataCharacteristics?.hasCategoricalFeatures ? `
    categorical_cols = data.select_dtypes(include=['object', 'category']).columns
    for col in categorical_cols:
        if col != "${dataset.targetColumn}":
            data = pd.get_dummies(data, columns=[col], prefix=[col])
    ` : ''}
    
    # Scale numerical features
    ${dataset.dataCharacteristics?.hasNumericalFeatures ? `
    from sklearn.preprocessing import StandardScaler
    numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
    if "${dataset.targetColumn}" in numerical_cols:
        numerical_cols = numerical_cols.drop("${dataset.targetColumn}")
    if len(numerical_cols) > 0:
        scaler = StandardScaler()
        data[numerical_cols] = scaler.fit_transform(data[numerical_cols])
    ` : ''}
    
    logger.info("Data preprocessing completed")
    return data
` : '';

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
    const components = pipeline.components.map(component => 
      generateComponentImplementation(component, dataset)
    ).join('\n\n');

    // Generate main pipeline class
    const pipelineClass = `
class MLPipeline:
    """Main pipeline class that orchestrates the ML workflow."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        ${pipeline.components.map(c => 
          `self.${c.name.toLowerCase().replace(/\s+/g, '_')} = ${c.name.replace(/\s+/g, '')}()`
        ).join('\n        ')}
    
    def run(self, data: pd.DataFrame) -> Any:
        """Run the complete pipeline.
        
        Args:
            data: Input DataFrame
            
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
    
    # Load dataset
    dataset_path = "path/to/your/dataset.csv"  # Replace with actual dataset path
    data = load_dataset(dataset_path)
    
    ${dataset ? `
    # Explore dataset
    explore_dataset(data)
    
    # Preprocess data
    data = preprocess_data(data)
    ` : ''}
    
    # Run the pipeline
    result = pipeline.run(data)
    print("Pipeline execution completed.")
`;

    // Combine all code sections
    return [
      ...imports,
      ...frameworkImports,
      setupLogging,
      problemContext,
      dataLoading,
      dataExploration,
      dataPreprocessing,
      components,
      trainingGenerator(),
      pipelineClass
    ].join('\n\n');
  }

  throw new Error(`Unsupported language: ${language}`);
};

const generateComponentImplementation = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const type: ComponentType = component.type as ComponentType;
  switch (type) {
    case 'preprocessing':
      return generatePreprocessingComponent(component, dataset);
    case 'model':
      return generateModelComponent(component, dataset);
    case 'postprocessing':
      return generatePostprocessingComponent(component, dataset);
    case 'feature':
      return generateFeatureComponent(component, dataset);
    case 'transformation':
      return generateTransformationComponent(component, dataset);
    case 'monitoring':
      return generateMonitoringComponent(component, dataset);
    case 'explainability':
      return generateExplainabilityComponent(component, dataset);
    default:
      return '';
  }
};

const generatePreprocessingComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        ${dataset?.dataCharacteristics?.hasMissingValues ? `
        self.imputer = SimpleImputer(strategy='median')
        ` : ''}
        ${dataset?.dataCharacteristics?.hasCategoricalFeatures ? `
        self.encoder = OneHotEncoder(handle_unknown='ignore')
        ` : ''}
        ${dataset?.dataCharacteristics?.hasNumericalFeatures ? `
        self.scaler = StandardScaler()
        ` : ''}
    
    def fit(self, data: pd.DataFrame) -> None:
        """Fit the preprocessing steps to the data.
        
        Args:
            data: Training data
        """
        self.logger.info("Fitting preprocessing steps...")
        ${dataset?.dataCharacteristics?.hasMissingValues ? `
        if data.isnull().any().any():
            self.imputer.fit(data)
        ` : ''}
        ${dataset?.dataCharacteristics?.hasCategoricalFeatures ? `
        categorical_cols = data.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            self.encoder.fit(data[categorical_cols])
        ` : ''}
        ${dataset?.dataCharacteristics?.hasNumericalFeatures ? `
        numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
        if len(numerical_cols) > 0:
            self.scaler.fit(data[numerical_cols])
        ` : ''}
    
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Transform the data using fitted preprocessing steps.
        
        Args:
            data: Data to transform
            
        Returns:
            Transformed data
        """
        self.logger.info("Transforming data...")
        result = data.copy()
        
        ${dataset?.dataCharacteristics?.hasMissingValues ? `
        if data.isnull().any().any():
            result = pd.DataFrame(
                self.imputer.transform(result),
                columns=result.columns,
                index=result.index
            )
        ` : ''}
        
        ${dataset?.dataCharacteristics?.hasCategoricalFeatures ? `
        categorical_cols = data.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            encoded = self.encoder.transform(result[categorical_cols])
            encoded_df = pd.DataFrame(
                encoded.toarray(),
                columns=self.encoder.get_feature_names_out(categorical_cols),
                index=result.index
            )
            result = pd.concat([result.drop(categorical_cols, axis=1), encoded_df], axis=1)
        ` : ''}
        
        ${dataset?.dataCharacteristics?.hasNumericalFeatures ? `
        numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
        if len(numerical_cols) > 0:
            result[numerical_cols] = self.scaler.transform(result[numerical_cols])
        ` : ''}
        
        return result
    
    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Fit and transform the data in one step.
        
        Args:
            data: Data to fit and transform
            
        Returns:
            Transformed data
        """
        self.fit(data)
        return self.transform(data)
`;
};

const generateModelComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  const problemType = dataset?.problemType || 'classification';
  
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        ${problemType === 'classification' ? `
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=None,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42
        )
        ` : problemType === 'regression' ? `
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=None,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42
        )
        ` : problemType === 'clustering' ? `
        self.model = KMeans(
            n_clusters=3,
            random_state=42
        )
        ` : `
        self.model = None  # Custom model implementation needed
        `}
    
    def fit(self, X: pd.DataFrame, y: pd.Series = None) -> None:
        """Fit the model to the training data.
        
        Args:
            X: Training features
            y: Training labels (optional for unsupervised learning)
        """
        self.logger.info("Training model...")
        ${problemType === 'clustering' ? `
        self.model.fit(X)
        ` : `
        self.model.fit(X, y)
        `}
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions on new data.
        
        Args:
            X: Features to make predictions on
            
        Returns:
            Model predictions
        """
        return self.model.predict(X)
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predict class probabilities (for classification only).
        
        Args:
            X: Features to make predictions on
            
        Returns:
            Class probabilities
        """
        ${problemType === 'classification' ? `
        return self.model.predict_proba(X)
        ` : `
        raise NotImplementedError("Probability predictions not available for this model type")
        `}
    
    def score(self, X: pd.DataFrame, y: pd.Series) -> float:
        """Calculate model score.
        
        Args:
            X: Test features
            y: Test labels
            
        Returns:
            Model score
        """
        ${problemType === 'classification' ? `
        return accuracy_score(y, self.predict(X))
        ` : problemType === 'regression' ? `
        return -mean_squared_error(y, self.predict(X))
        ` : `
        return silhouette_score(X, self.predict(X))
        `}
`;
};

const generatePostprocessingComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def process(self, predictions: np.ndarray) -> np.ndarray:
        """Process model predictions.
        
        Args:
            predictions: Raw model predictions
            
        Returns:
            Processed predictions
        """
        self.logger.info("Post-processing predictions...")
        ${dataset?.problemType === 'classification' ? `
        # For classification, we might want to apply a threshold
        return (predictions > 0.5).astype(int)
        ` : dataset?.problemType === 'regression' ? `
        # For regression, we might want to clip predictions
        return np.clip(predictions, 0, None)
        ` : `
        # Default processing (identity function)
        return predictions
        `}
`;
};

const generateFeatureComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def extract(self, data: pd.DataFrame) -> pd.DataFrame:
        """Extract features from the data.
        
        Args:
            data: Input data
            
        Returns:
            Extracted features
        """
        self.logger.info("Extracting features...")
        result = data.copy()
        
        # Add feature extraction logic here
        ${dataset?.dataCharacteristics?.hasNumericalFeatures ? `
        # Example: Create interaction features
        numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
        for i, col1 in enumerate(numerical_cols):
            for col2 in numerical_cols[i+1:]:
                result[f"{col1}_{col2}_interaction"] = result[col1] * result[col2]
        ` : ''}
        
        ${dataset?.dataCharacteristics?.hasCategoricalFeatures ? `
        # Example: Create frequency encoding
        categorical_cols = data.select_dtypes(include=['object', 'category']).columns
        for col in categorical_cols:
            freq = data[col].value_counts(normalize=True)
            result[f"{col}_freq"] = data[col].map(freq)
        ` : ''}
        
        return result
`;
};

const generateTransformationComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Transform the data.
        
        Args:
            data: Input data
            
        Returns:
            Transformed data
        """
        self.logger.info("Transforming data...")
        result = data.copy()
        
        # Add transformation logic here
        ${dataset?.dataCharacteristics?.hasNumericalFeatures ? `
        # Example: Apply log transformation to numerical features
        numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
        for col in numerical_cols:
            if data[col].min() > 0:  # Only apply log to positive values
                result[col] = np.log1p(data[col])
        ` : ''}
        
        ${dataset?.dataCharacteristics?.hasCategoricalFeatures ? `
        # Example: Apply target encoding
        categorical_cols = data.select_dtypes(include=['object', 'category']).columns
        for col in categorical_cols:
            if "${dataset?.targetColumn}" in data.columns:
                target_mean = data.groupby(col)["${dataset?.targetColumn}"].mean()
                result[f"{col}_target_encoded"] = data[col].map(target_mean)
        ` : ''}
        
        return result
`;
};

const generateMonitoringComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.reference_data = None
        self.metrics_history = []
    
    def set_reference(self, data: pd.DataFrame) -> None:
        """Set reference data for monitoring.
        
        Args:
            data: Reference data
        """
        self.logger.info("Setting reference data...")
        self.reference_data = data.copy()
    
    def monitor(self, data: pd.DataFrame) -> dict:
        """Monitor data drift and anomalies.
        
        Args:
            data: Current data to monitor
            
        Returns:
            Dictionary of monitoring metrics
        """
        self.logger.info("Monitoring data...")
        metrics = {}
        
        if self.reference_data is not None:
            # Data drift detection
            ${dataset?.dataCharacteristics?.hasNumericalFeatures ? `
            numerical_cols = data.select_dtypes(include=['int64', 'float64']).columns
            for col in numerical_cols:
                ks_stat, p_value = ks_2samp(
                    self.reference_data[col],
                    data[col]
                )
                metrics[f"{col}_drift_pvalue"] = p_value
            ` : ''}
            
            # Feature distribution monitoring
            ${dataset?.dataCharacteristics?.hasCategoricalFeatures ? `
            categorical_cols = data.select_dtypes(include=['object', 'category']).columns
            for col in categorical_cols:
                ref_counts = self.reference_data[col].value_counts(normalize=True)
                curr_counts = data[col].value_counts(normalize=True)
                metrics[f"{col}_distribution_distance"] = wasserstein_distance(
                    ref_counts,
                    curr_counts
                )
            ` : ''}
        
        self.metrics_history.append(metrics)
        return metrics
`;
};

const generateExplainabilityComponent = (component: PipelineComponent, dataset?: DatasetInfo) => {
  const componentName = component.name.replace(/\s+/g, '');
  return `
class ${componentName}:
    """${component.description}"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.explainer = None
    
    def fit(self, model, X: pd.DataFrame) -> None:
        """Fit the explainer to the model and data.
        
        Args:
            model: Trained model to explain
            X: Training data
        """
        self.logger.info("Fitting explainer...")
        ${dataset?.problemType === 'classification' ? `
        self.explainer = shap.TreeExplainer(model)
        ` : dataset?.problemType === 'regression' ? `
        self.explainer = shap.KernelExplainer(model.predict, X)
        ` : `
        self.explainer = None  # Custom explainer needed
        `}
    
    def explain(self, X: pd.DataFrame) -> dict:
        """Generate explanations for predictions.
        
        Args:
            X: Data to explain
            
        Returns:
            Dictionary of explanations
        """
        self.logger.info("Generating explanations...")
        if self.explainer is None:
            raise ValueError("Explainer has not been fitted yet!")
        
        ${dataset?.problemType === 'classification' ? `
        shap_values = self.explainer.shap_values(X)
        return {
            'shap_values': shap_values,
            'feature_importance': np.abs(shap_values).mean(axis=0)
        }
        ` : dataset?.problemType === 'regression' ? `
        shap_values = self.explainer.shap_values(X)
        return {
            'shap_values': shap_values,
            'feature_importance': np.abs(shap_values).mean(axis=0)
        }
        ` : `
        return {}  # Custom explanation needed
        `}
`;
};
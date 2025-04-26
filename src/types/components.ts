import { ComponentType } from '../App';

export type MLComponentType = ComponentType | 'feature' | 'transformation' | 'monitoring' | 'explainability';

export interface AgentInfo {
  name: string;
  role: string;
  quote: string;
}

export interface MLComponent {
  id: string;
  displayName: string;
  type: MLComponentType;
  description: string;
  codeSnippet: string;
  modelAsset?: string;
  icon: string;
  suggestedAlternatives?: string[];
  requirements?: {
    dependencies: string[];
    environments: string[];
  };
  agent: AgentInfo;
}

export const componentCatalog: MLComponent[] = [
  {
    id: "standard_scaler",
    displayName: "Standard Scaler",
    type: "preprocessing",
    description: "Normalizes numeric features to zero mean and unit variance.",
    codeSnippet: "from sklearn.preprocessing import StandardScaler",
    modelAsset: "/models/standard_scaler.glb",
    icon: "📊",
    suggestedAlternatives: ["min_max_scaler", "robust_scaler"],
    requirements: {
      dependencies: ["scikit-learn>=1.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "DataCleanerGPT",
      role: "Data Preprocessing Expert",
      quote: "Clean data is my jam! Let me handle those messy sensor readings."
    }
  },
  {
    id: "min_max_scaler",
    displayName: "Min-Max Scaler",
    type: "preprocessing",
    description: "Scales values to a 0–1 range. Useful for bounded inputs.",
    codeSnippet: "from sklearn.preprocessing import MinMaxScaler",
    modelAsset: "/models/min_max.glb",
    icon: "📈",
    requirements: {
      dependencies: ["scikit-learn>=1.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "NormalizerGPT",
      role: "Data Scaling Specialist",
      quote: "Let me squeeze those values into a nice, bounded range!"
    }
  },
  {
    id: "outlier_filter",
    displayName: "Outlier Detection",
    type: "preprocessing",
    description: "Removes anomalous data points using IQR or z-score methods.",
    codeSnippet: "df = df[(z_scores < 3).all(axis=1)]",
    modelAsset: "/models/outlier_filter.glb",
    icon: "🚨",
    requirements: {
      dependencies: ["numpy>=1.20.0", "pandas>=1.3.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "AnomalyHunterGPT",
      role: "Outlier Detection Expert",
      quote: "I've got a keen eye for data that doesn't belong!"
    }
  },
  {
    id: "time_alignment",
    displayName: "Time Alignment",
    type: "preprocessing",
    description: "Aligns multi-sensor time series to a shared timestamp index.",
    codeSnippet: "df = df.resample('1H').mean()",
    modelAsset: "/models/time_align.glb",
    icon: "⏱️",
    requirements: {
      dependencies: ["pandas>=1.3.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "TimeKeeperGPT",
      role: "Temporal Alignment Specialist",
      quote: "Time waits for no one, but I'll make sure your data stays in sync!"
    }
  },
  {
    id: "transformer_model",
    displayName: "Time Series Transformer",
    type: "model",
    description: "Captures long-term temporal patterns using attention mechanisms.",
    codeSnippet: "output = self.transformer(x)",
    modelAsset: "/models/transformer.glb",
    icon: "🔁",
    requirements: {
      dependencies: ["torch>=1.10.0", "transformers>=4.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "ModelArchitectGPT",
      role: "Neural Architecture Specialist",
      quote: "Time series data? Leave it to my transformer architecture!"
    }
  },
  {
    id: "json_exporter",
    displayName: "JSON Output Formatter",
    type: "postprocessing",
    description: "Formats predictions as JSON with timestamps and metadata.",
    codeSnippet: "json.dumps(predictions)",
    modelAsset: "/models/json_formatter.glb",
    icon: "📤",
    requirements: {
      dependencies: ["python-json-logger>=2.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "OutputOptimizerGPT",
      role: "Prediction Refinement Specialist",
      quote: "Let me format those predictions for easy integration!"
    }
  },
  {
    id: "pca",
    displayName: "PCA",
    type: "feature",
    description: "Applies Principal Component Analysis for dimensionality reduction.",
    codeSnippet: "from sklearn.decomposition import PCA; pca = PCA(n_components=10); X = pca.fit_transform(X)",
    modelAsset: "/models/pca.glb",
    icon: "📉",
    requirements: {
      dependencies: ["scikit-learn>=1.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "FeatureEngineerGPT",
      role: "Feature Engineering Specialist",
      quote: "Let's distill those features down to their essence!"
    }
  },
  {
    id: "data_validator",
    displayName: "Data Validator",
    type: "transformation",
    description: "Validates input data against a predefined schema.",
    codeSnippet: "jsonschema.validate(data, schema)",
    modelAsset: "/models/data_validator.glb",
    icon: "✅",
    requirements: {
      dependencies: ["jsonschema>=4.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "QualityControlGPT",
      role: "Data Quality Guardian",
      quote: "Ensuring your data is pristine and ready for analysis!"
    }
  },
  {
    id: "model_drift_detector",
    displayName: "Model Drift Detector",
    type: "monitoring",
    description: "Detects drift in model performance over time.",
    codeSnippet: "drift_detector.detect(predictions, actuals)",
    modelAsset: "/models/drift_detector.glb",
    icon: "⚙️",
    requirements: {
      dependencies: ["tensorflow>=2.0.0", "alibi_detect>=0.8.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "PerformanceMonitorGPT",
      role: "Model Performance Analyst",
      quote: "Keeping a vigilant eye on your model's health and stability."
    }
  },
  {
    id: "shap_explainer",
    displayName: "SHAP Explainer",
    type: "explainability",
    description: "Explains model predictions using SHAP values.",
    codeSnippet: "shap.summary_plot(shap_values, X)",
    modelAsset: "/models/shap_explainer.glb",
    icon: "💡",
    requirements: {
      dependencies: ["shap>=0.39.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "InsightfulAnalystGPT",
      role: "Model Interpretation Expert",
      quote: "Unlocking the secrets behind your model's decisions."
    }
  },
  {
    id: "robust_scaler",
    displayName: "Robust Scaler",
    type: "preprocessing",
    description: "Scales data using statistics that are robust to outliers.",
    codeSnippet: "from sklearn.preprocessing import RobustScaler; scaler = RobustScaler(); X = scaler.fit_transform(X)",
    modelAsset: "/models/robust_scaler.glb",
    icon: "💪",
    requirements: {
      dependencies: ["scikit-learn>=1.0.0"],
      environments: ["Python 3.7+"]
    },
    agent: {
      name: "DataResilienceGPT",
      role: "Outlier-Resistant Scaling Specialist",
      quote: "Making your data robust against the slings and arrows of outliers!"
    }
  }
];
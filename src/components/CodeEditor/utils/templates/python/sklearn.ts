import { PipelineComponent } from '../../../../../App';

export const sklearnImports = [
  'from sklearn.base import BaseEstimator, TransformerMixin',
  'from sklearn.pipeline import Pipeline',
  'from sklearn.model_selection import train_test_split, cross_val_score',
  'from sklearn.metrics import mean_squared_error, accuracy_score, classification_report',
];

export const generateModelClass = (component: PipelineComponent) => `
class ${component.name.replace(/\s+/g, '')}(BaseEstimator):
    """${component.description}
    
    A scikit-learn compatible estimator that implements the specified model.
    """
    
    def __init__(self, **kwargs):
        """Initialize the model with given parameters."""
        super().__init__()
        self.logger = logging.getLogger(self.__class__.__name__)
        self.model = None
        self.params = kwargs
        
    def fit(self, X, y=None):
        """Fit the model to the data.
        
        Args:
            X: Training data features
            y: Training data labels
            
        Returns:
            self: The fitted estimator
        """
        self.logger.info("Training model...")
        
        # Initialize and fit the underlying model
        # This is a placeholder - replace with actual model initialization
        self.model = self._initialize_model()
        self.model.fit(X, y)
        
        return self
        
    def predict(self, X):
        """Make predictions on new data.
        
        Args:
            X: Features to make predictions on
            
        Returns:
            array-like: Model predictions
        """
        if self.model is None:
            raise ValueError("Model has not been fitted yet!")
            
        return self.model.predict(X)
        
    def _initialize_model(self):
        """Initialize the underlying scikit-learn model.
        
        Returns:
            BaseEstimator: Initialized model
        """
        # This is a placeholder - replace with actual model initialization
        from sklearn.ensemble import RandomForestRegressor
        return RandomForestRegressor(**self.params)
`;

export const generateTrainingLoop = () => `
def train_model(
    model,
    X,
    y,
    test_size: float = 0.2,
    random_state: int = 42
):
    """Train and evaluate a scikit-learn model.
    
    Args:
        model: scikit-learn estimator
        X: Features
        y: Labels
        test_size: Proportion of data to use for testing
        random_state: Random seed for reproducibility
        
    Returns:
        tuple: (fitted_model, metrics_dict)
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state
    )
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    metrics = {
        'mse': mean_squared_error(y_test, y_pred),
        'cv_scores': cross_val_score(
            model, X, y,
            cv=5,
            scoring='neg_mean_squared_error'
        ).mean()
    }
    
    return model, metrics
`; 
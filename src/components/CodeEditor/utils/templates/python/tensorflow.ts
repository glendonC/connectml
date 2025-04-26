import { PipelineComponent } from '../../../../../App';

export const tensorflowImports = [
  'import tensorflow as tf',
  'from tensorflow.keras import layers, Model, optimizers',
  'from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint',
];

export const generateModelClass = (component: PipelineComponent) => `
class ${component.name.replace(/\s+/g, '')}(Model):
    """${component.description}
    
    A TensorFlow model that implements the specified architecture.
    """
    
    def __init__(self, input_shape: tuple, hidden_size: int = 128, output_size: int = 1):
        """Initialize the model.
        
        Args:
            input_shape: Shape of input features
            hidden_size: Size of hidden layers
            output_size: Number of output features
        """
        super().__init__()
        self.logger = logging.getLogger(self.__class__.__name__)
        
        self.layers_list = [
            layers.Input(shape=input_shape),
            layers.Dense(hidden_size, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(hidden_size // 2, activation='relu'),
            layers.Dense(output_size)
        ]
        
        # Build the model
        self.build_model()
    
    def build_model(self):
        """Build and compile the model."""
        x = self.layers_list[0]
        for layer in self.layers_list[1:]:
            x = layer(x)
        
        super().__init__(inputs=self.layers_list[0], outputs=x)
        
        self.compile(
            optimizer=optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
    
    def call(self, inputs):
        """Forward pass through the model.
        
        Args:
            inputs: Input tensor
            
        Returns:
            tf.Tensor: Model predictions
        """
        x = inputs
        for layer in self.layers_list[1:]:
            x = layer(x)
        return x
`;

export const generateTrainingLoop = () => `
def train_model(
    model: Model,
    train_dataset: tf.data.Dataset,
    val_dataset: tf.data.Dataset,
    epochs: int = 10,
    checkpoint_path: str = 'checkpoints/model.h5'
) -> Model:
    """Train the TensorFlow model.
    
    Args:
        model: TensorFlow model to train
        train_dataset: Training data
        val_dataset: Validation data
        epochs: Number of training epochs
        checkpoint_path: Path to save model checkpoints
        
    Returns:
        Model: Trained model
    """
    # Create callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        ModelCheckpoint(
            filepath=checkpoint_path,
            monitor='val_loss',
            save_best_only=True
        )
    ]
    
    # Train the model
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=epochs,
        callbacks=callbacks,
        verbose=1
    )
    
    return model, history
`; 
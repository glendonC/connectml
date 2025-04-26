import { PipelineComponent } from '../../../../../App';

export const pytorchImports = [
  'import torch',
  'import torch.nn as nn',
  'import torch.optim as optim',
  'from torch.utils.data import DataLoader, Dataset',
];

export const generateModelClass = (component: PipelineComponent) => `
class ${component.name.replace(/\s+/g, '')}(nn.Module):
    """${component.description}
    
    A PyTorch model that implements the specified architecture.
    """
    
    def __init__(self, input_size: int, hidden_size: int = 128, output_size: int = 1):
        """Initialize the model.
        
        Args:
            input_size: Number of input features
            hidden_size: Size of hidden layers
            output_size: Number of output features
        """
        super().__init__()
        self.logger = logging.getLogger(self.__class__.__name__)
        
        self.layers = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Linear(hidden_size // 2, output_size)
        )
        
        # Initialize weights
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        """Initialize layer weights."""
        if isinstance(module, nn.Linear):
            torch.nn.init.xavier_uniform_(module.weight)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through the model.
        
        Args:
            x: Input tensor
            
        Returns:
            torch.Tensor: Model predictions
        """
        return self.layers(x)
    
    def training_step(self, batch: tuple) -> torch.Tensor:
        """Perform a training step.
        
        Args:
            batch: Tuple of (inputs, targets)
            
        Returns:
            torch.Tensor: Loss value
        """
        x, y = batch
        y_hat = self(x)
        loss = nn.MSELoss()(y_hat, y)
        return loss
`;

export const generateTrainingLoop = () => `
def train_model(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    epochs: int = 10,
    learning_rate: float = 0.001
) -> nn.Module:
    """Train the PyTorch model.
    
    Args:
        model: PyTorch model to train
        train_loader: Training data loader
        val_loader: Validation data loader
        epochs: Number of training epochs
        learning_rate: Learning rate for optimization
        
    Returns:
        nn.Module: Trained model
    """
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.MSELoss()
    
    for epoch in range(epochs):
        # Training phase
        model.train()
        train_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            loss = model.training_step(batch)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                x, y = batch
                y_hat = model(x)
                val_loss += criterion(y_hat, y).item()
        
        print(f'Epoch {epoch+1}/{epochs}:')
        print(f'  Training Loss: {train_loss/len(train_loader):.4f}')
        print(f'  Validation Loss: {val_loss/len(val_loader):.4f}')
    
    return model
`; 
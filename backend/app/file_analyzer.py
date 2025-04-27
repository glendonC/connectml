from typing import List, Dict, Any
import base64
import json
import pandas as pd
from io import StringIO

def analyze_file_content(file: Dict[str, Any]) -> Dict[str, Any]:
    """Basic analysis of uploaded file content."""
    file_type = file["type"].lower()
    content = base64.b64decode(file["content"]).decode('utf-8')
    
    analysis = {
        "file_type": file_type,
        "name": file["name"],
        "insights": []
    }
    
    try:
        if file_type.endswith('csv'):
            # Basic CSV analysis
            df = pd.read_csv(StringIO(content))
            analysis["insights"].extend([
                f"Contains {len(df)} rows and {len(df.columns)} columns",
                f"Columns: {', '.join(df.columns[:5])}{'...' if len(df.columns) > 5 else ''}"
            ])
        elif file_type.endswith(('py', 'ipynb')):
            # Basic code file analysis
            analysis["insights"].append("Contains Python code")
            if 'sklearn' in content:
                analysis["insights"].append("Uses scikit-learn")
            elif 'tensorflow' in content:
                analysis["insights"].append("Uses TensorFlow")
            elif 'torch' in content:
                analysis["insights"].append("Uses PyTorch")
        elif file_type.endswith('json'):
            # Basic JSON analysis
            data = json.loads(content)
            if isinstance(data, dict):
                analysis["insights"].append(f"JSON object with keys: {', '.join(list(data.keys())[:5])}")
            elif isinstance(data, list):
                analysis["insights"].append(f"JSON array with {len(data)} items")
    except Exception as e:
        analysis["error"] = str(e)
    
    return analysis 
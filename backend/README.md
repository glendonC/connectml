# ML Pipeline Generator Backend

This is the backend service for the ML Pipeline Generator. It provides a FastAPI-based API that uses GPT-4 to intelligently select and compose ML pipeline components based on natural language queries.

## Setup

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

## Running the Server

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The server will run at `http://localhost:8000`

## API Endpoints

### POST /generate-pipeline
Generate a new ML pipeline based on a natural language prompt.

Request body:
```json
{
    "prompt": "Create a pipeline for time series prediction with data normalization"
}
```

### GET /components
Get the list of all available components in the catalog.

## Development

The main components of the backend are:

- `app/main.py`: FastAPI application and API endpoints
- `app/pipeline_generator.py`: Core pipeline generation logic
- `app/data/component_catalog.json`: Component definitions

## Testing

Run tests with pytest:
```bash
pytest
``` 
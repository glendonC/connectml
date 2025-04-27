# Pipeline — Instantly

Transform natural language into complete machine learning pipelines using AI agents.  
AgenticAI empowers you to design, visualize, and deploy ML workflows with ease—no manual coding required.

---

## ✨ Features

- **Explain this Plan**  
  AI-powered reasoning explains complex ML pipelines in simple terms.

- **Add Components**  
  Browse, select, and preview ML components from a curated catalog with visual pipeline validation.

- **Agentic Reasoning**  
  AI agents provide reasoning and recommendations for pipeline components.

- **2D Pipeline Builder**  
  Intuitive drag-and-drop interface for pipeline construction.

- **3D Visualization**  
  Explore your pipeline in an immersive 3D environment.

- **Export & Deploy**  
  Export pipeline code with framework-specific implementations.

---

## 🖥️ Tech Stack

**Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Flow (2D pipeline builder)
- Three.js & @react-three/fiber (3D visualization)
- Monaco Editor (code editing)
- Framer Motion (animations)
- Lucide React (icons)

**Backend**
- FastAPI (Python)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- OpenAI (AI integration)
- Tavily (AI/search)
- python-dotenv (env management)
- HTTPx (HTTP client)
- Pytest (testing)

---

## 🚦 Quickstart

1. **Clone the repository**
   ```bash
   git clone https://github.com/glendonC/connectml.git
   cd connectml
   
2. **Setup the backend**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
  
 3. **Setup the frontend**
    ```bash
    cd frontend
    npm install
    npm run dev

The frontend will be available at http://localhost:5173 (default Vite port).

## 🧠 How It Works

Prompt: Enter a natural language description of your ML task.

Agent: AI agents interpret your prompt and design a pipeline.

2D/3D Visualization: Interactively build and explore your pipeline.

Component Catalog: Add, preview, and validate new ML components.

Export: Download ready-to-run code for your chosen framework.

📝 License
MIT

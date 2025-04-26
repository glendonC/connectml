import React, { useState } from 'react';
import { LandingPage } from './pages/landing/LandingPage';
import { LoadingPage } from './pages/loading/LoadingPage';
import { ResultsPage } from './pages/results/ResultsPage';
import { PipelineProvider } from './context/PipelineContext';
import { componentCatalog } from './types/components';

export type Domain = 'fintech' | 'healthcare' | 'sustainability';
export type ComponentType = 'preprocessing' | 'model' | 'postprocessing';

export interface AgentReasoning {
  agentName: string;
  role: string;
  quote: string;
  componentTitle: string;
  description: string;
  why: string;
  performanceImpact: {
    accuracy: string;
    latency: string;
    reliability: string;
  };
  note?: string;
  codeSnippet?: string;
}

export interface FlowNode {
  stepId: string;
  title: string;
  nodeType: ComponentType;
  position: { x: number; y: number };
  agent: string;
  shortSummary: string;
  impactMetric: string;
  connections: Array<{ from: string; to: string }>;
}

export interface ThreeDNode {
  title: string;
  nodeType: ComponentType;
  agent: string;
  impact: string;
  tooltip: string;
  position3D: { x: number; y: number; z: number };
  modelAsset?: string;
}

export interface PipelineComponent {
  id: string;
  name: string;
  description: string;
  type: ComponentType;
  metrics?: {
    accuracy?: number;
    latency?: number;
    memory?: number;
    throughput?: number;
  };
  parameters?: number;
  huggingFaceId?: string;
  inputFormat?: string;
  outputFormat?: string;
  source?: {
    name: string;
    url: string;
    version: string;
    lastUpdated: string;
    organization?: string;
  };
  requirements?: {
    dependencies: string[];
    environments: string[];
    minCPU?: string;
    minRAM?: string;
    minGPU?: string;
  };
  selectionReason?: string;
  performanceNotes?: string;
  alternatives?: PipelineComponent[];
  agentReasoning?: AgentReasoning;
  flowNode?: FlowNode;
  threeDNode?: ThreeDNode;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  components: PipelineComponent[];
  connections: Connection[];
  totalModels: number;
  estimatedAccuracy: number;
  estimatedLatency: number;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

type AppState = 'landing' | 'loading' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'fast' | 'precise'>('fast');
  const [aiMode, setAIMode] = useState<'quick' | 'agentic'>('quick');
  const [generatedPipeline, setGeneratedPipeline] = useState<Pipeline | null>(null);
  const [searchSteps, setSearchSteps] = useState<any[]>([]);

  const handleGeneratePipeline = async () => {
    if (prompt.trim()) {
      setCurrentState('loading');
      setSearchSteps([]); // Reset search steps
      
      try {
        const response = await fetch('http://localhost:8000/generate-pipeline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: prompt.trim(),
            mode: aiMode
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Update search steps if they exist in the response
        if (data.search_steps) {
          setSearchSteps(data.search_steps);
        }

        const pipeline: Pipeline = {
          id: '1',  // We can generate this on the frontend for now
          name: data.name || 'ML Pipeline',
          description: data.description || 'Generated ML Pipeline',
          components: data.components.map((component: any) => ({
            id: component.id,
            type: component.type,
            name: component.name,
            description: component.description,
            inputs: component.inputs || [],
            outputs: component.outputs || [],
            parameters: component.parameters || {},
            position: component.position || { x: 0, y: 0 },
          })),
          connections: data.connections.map((connection: any) => ({
            id: connection.id,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
          })),
          totalModels: data.components.filter((c: any) => c.type === 'model').length,
          estimatedAccuracy: 0.9,  // Placeholder
          estimatedLatency: 100,   // Placeholder
        };

        setGeneratedPipeline(pipeline);
        setCurrentState('results');
      } catch (error) {
        console.error('Error generating pipeline:', error);
        // You might want to show an error message to the user here
        setCurrentState('landing');
      }
    }
  };

  return (
    <PipelineProvider>
      <div className="min-h-screen bg-white">
        {currentState === 'landing' && (
          <LandingPage
            prompt={prompt}
            setPrompt={setPrompt}
            mode={mode}
            setMode={setMode}
            onGenerate={handleGeneratePipeline}
            aiMode={aiMode}
            setAIMode={setAIMode}
          />
        )}
        {currentState === 'loading' && (
          <LoadingPage 
            prompt={prompt} 
            mode={mode} 
            aiMode={aiMode} 
            searchSteps={searchSteps}
          />
        )}
        {currentState === 'results' && generatedPipeline && (
          <ResultsPage
            pipeline={generatedPipeline}
            onBack={() => setCurrentState('landing')}
          />
        )}
      </div>
    </PipelineProvider>
  );
}

export default App;
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
  totalModels: number;
  estimatedAccuracy: number;
  estimatedLatency: number;
}

type AppState = 'landing' | 'loading' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'fast' | 'precise'>('fast');
  const [generatedPipeline, setGeneratedPipeline] = useState<Pipeline | null>(null);

  const handleGeneratePipeline = () => {
    if (prompt.trim()) {
      setCurrentState('loading');
      
      // Get components from catalog
      const standardScaler = componentCatalog.find(c => c.id === 'standard_scaler');
      const transformer = componentCatalog.find(c => c.id === 'transformer_model');
      const jsonExporter = componentCatalog.find(c => c.id === 'json_exporter');

      // Simulate API call
      setTimeout(() => {
        setGeneratedPipeline({
          id: '1',
          name: 'Energy Consumption Prediction Pipeline',
          description: 'Predicts energy consumption patterns from sensor data using time series analysis and deep learning',
          components: [
            {
              id: standardScaler!.id,
              name: standardScaler!.displayName,
              description: standardScaler!.description,
              type: 'preprocessing' as ComponentType,
              metrics: standardScaler!.metrics,
              requirements: standardScaler!.requirements,
              agentReasoning: {
                agentName: standardScaler!.agent.name,
                role: standardScaler!.agent.role,
                quote: standardScaler!.agent.quote,
                componentTitle: standardScaler!.displayName,
                description: standardScaler!.description,
                why: 'Sensor data often contains noise and varying scales. Standardization ensures reliable model training.',
                performanceImpact: {
                  accuracy: '+8.4%',
                  latency: '-40ms',
                  reliability: '+12%'
                },
                note: 'Optimized for real-time batch processing of sensor data streams',
                codeSnippet: standardScaler!.codeSnippet
              },
              flowNode: {
                stepId: standardScaler!.id,
                title: standardScaler!.displayName,
                nodeType: 'preprocessing',
                position: { x: 100, y: 100 },
                agent: standardScaler!.agent.name,
                shortSummary: 'Standardize sensor data',
                impactMetric: '+8.4% Accuracy',
                connections: [{ from: standardScaler!.id, to: transformer!.id }]
              },
              threeDNode: {
                title: standardScaler!.displayName,
                nodeType: 'preprocessing',
                agent: standardScaler!.agent.name,
                impact: '+8.4% accuracy',
                tooltip: standardScaler!.description,
                position3D: { x: -6, y: 0, z: 0 },
                modelAsset: standardScaler!.modelAsset
              }
            },
            {
              id: transformer!.id,
              name: transformer!.displayName,
              description: transformer!.description,
              type: 'model' as ComponentType,
              metrics: transformer!.metrics,
              parameters: transformer!.parameters,
              requirements: transformer!.requirements,
              agentReasoning: {
                agentName: transformer!.agent.name,
                role: transformer!.agent.role,
                quote: transformer!.agent.quote,
                componentTitle: transformer!.displayName,
                description: transformer!.description,
                why: 'Transformer architecture excels at modeling long-term dependencies and seasonal patterns in time series data.',
                performanceImpact: {
                  accuracy: '+15.2%',
                  latency: '+1.2s',
                  reliability: '+18%'
                },
                note: 'Uses attention mechanisms to focus on relevant time periods',
                codeSnippet: transformer!.codeSnippet
              },
              flowNode: {
                stepId: transformer!.id,
                title: transformer!.displayName,
                nodeType: 'model',
                position: { x: 400, y: 100 },
                agent: transformer!.agent.name,
                shortSummary: 'Process temporal patterns',
                impactMetric: '+15.2% Accuracy',
                connections: [{ from: transformer!.id, to: jsonExporter!.id }]
              },
              threeDNode: {
                title: transformer!.displayName,
                nodeType: 'model',
                agent: transformer!.agent.name,
                impact: '+15.2% accuracy',
                tooltip: transformer!.description,
                position3D: { x: 0, y: 0, z: 0 },
                modelAsset: transformer!.modelAsset
              }
            },
            {
              id: jsonExporter!.id,
              name: jsonExporter!.displayName,
              description: jsonExporter!.description,
              type: 'postprocessing' as ComponentType,
              metrics: jsonExporter!.metrics,
              requirements: jsonExporter!.requirements,
              agentReasoning: {
                agentName: jsonExporter!.agent.name,
                role: jsonExporter!.agent.role,
                quote: jsonExporter!.agent.quote,
                componentTitle: jsonExporter!.displayName,
                description: jsonExporter!.description,
                why: 'Structured JSON output enables seamless integration with downstream systems and APIs.',
                performanceImpact: {
                  accuracy: '+0%',
                  latency: '+0.1s',
                  reliability: '+15%'
                },
                note: 'Includes metadata and confidence scores',
                codeSnippet: jsonExporter!.codeSnippet
              },
              flowNode: {
                stepId: jsonExporter!.id,
                title: jsonExporter!.displayName,
                nodeType: 'postprocessing',
                position: { x: 700, y: 100 },
                agent: jsonExporter!.agent.name,
                shortSummary: 'Format predictions as JSON',
                impactMetric: '+15% Reliability',
                connections: []
              },
              threeDNode: {
                title: jsonExporter!.displayName,
                nodeType: 'postprocessing',
                agent: jsonExporter!.agent.name,
                impact: '+15% reliability',
                tooltip: jsonExporter!.description,
                position3D: { x: 6, y: 0, z: 0 },
                modelAsset: jsonExporter!.modelAsset
              }
            }
          ],
          totalModels: 1,
          estimatedAccuracy: transformer!.metrics?.accuracy || 0.92,
          estimatedLatency: (standardScaler!.metrics?.latency || 0) + 
                          (transformer!.metrics?.latency || 0) + 
                          (jsonExporter!.metrics?.latency || 0),
        });
        setCurrentState('results');
      }, 5000);
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
          />
        )}
        {currentState === 'loading' && (
          <LoadingPage prompt={prompt} mode={mode} />
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
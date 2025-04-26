import React, { createContext, useContext, useState } from 'react';
import { Pipeline } from '../App';

interface PipelineContextType {
  pipeline: Pipeline | null;
  setPipeline: (pipeline: Pipeline | null) => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);

  return (
    <PipelineContext.Provider value={{ pipeline, setPipeline }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
}
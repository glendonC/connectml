import React, { createContext, useContext, useState, useCallback } from 'react';
import { Pipeline } from '../App';

interface PipelineContextType {
  pipeline: Pipeline | null;
  setPipeline: (pipeline: Pipeline | null) => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [pipeline, setPipelineState] = useState<Pipeline | null>(null);

  const setPipeline = useCallback((newPipeline: Pipeline | null) => {
    setPipelineState(newPipeline);
  }, []);

  const value = React.useMemo(() => ({
    pipeline,
    setPipeline
  }), [pipeline, setPipeline]);

  return (
    <PipelineContext.Provider value={value}>
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
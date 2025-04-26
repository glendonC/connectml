import React, { useState, useEffect } from 'react';
import { Brain, Code, Database } from 'lucide-react';

const loadingSteps = [
  { id: 'analyze', title: 'Analyzing your request...', icon: Brain },
  { id: 'search', title: 'Searching for optimal models...', icon: Database },
  { id: 'assemble', title: 'Assembling pipeline components...', icon: Code },
];

const facts = [
  "ML pipelines can reduce model deployment time by up to 90%",
  "Automated ML pipelines help ensure reproducibility of results",
  "Well-designed pipelines can handle both structured and unstructured data",
  "Pipeline automation reduces human error in the ML workflow"
];

interface LoadingPageProps {
  prompt: string;
  mode: 'fast' | 'precise';
}

export function LoadingPage({ prompt, mode }: LoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, mode === 'fast' ? 30 : 50);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length);
    }, 2000);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % facts.length);
    }, 3000);

    return () => clearInterval(factInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-12">
        {/* Query Display */}
        <div className="text-center space-y-2">
          <p className="text-gray-600">Generating pipeline for</p>
          <p className="text-xl font-['Google_Sans'] text-gray-900">{prompt}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isPast = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  isActive ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-blue-100 text-blue-600' :
                  isPast ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-['Google_Sans'] ${
                  isActive ? 'text-blue-600' :
                  isPast ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-500">{progress}%</div>
        </div>

        {/* Did You Know */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Google_Sans'] text-gray-900 mb-1">Did you know?</h3>
              <p className="text-gray-600 animate-[gentle-fade_0.3s_ease-out]">
                {facts[factIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
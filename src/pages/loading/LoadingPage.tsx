import React, { useState, useEffect } from 'react';
import { Brain, Code, Database, Search, Check, Globe, Sparkles } from 'lucide-react';

const quickModeSteps = [
  { id: 'analyze', title: 'Analyzing your request...', icon: Brain },
  { id: 'search', title: 'Searching for optimal models...', icon: Database },
  { id: 'assemble', title: 'Assembling pipeline components...', icon: Code },
];

interface SearchStep {
  query: string;
  status: 'loading' | 'complete';
  timestamp: number;
  type: 'web' | 'think' | 'generate' | 'search';
}

interface LoadingPageProps {
  prompt: string;
  mode: 'fast' | 'precise';
  aiMode: 'quick' | 'agentic';
  searchSteps?: SearchStep[];
}

const facts = [
  "ML pipelines can reduce model deployment time by up to 90%",
  "Automated ML pipelines help ensure reproducibility of results",
  "Well-designed pipelines can handle both structured and unstructured data",
  "Pipeline automation reduces human error in the ML workflow"
];

export function LoadingPage({ prompt, mode, aiMode, searchSteps = [] }: LoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleStepCount, setVisibleStepCount] = useState(1);
  
  // Initialize steps immediately with the current prompt
  const [agenticSteps] = useState<SearchStep[]>([
    {
      query: `${prompt} overview and techniques`,
      status: 'loading',
      timestamp: Date.now(),
      type: 'web'
    },
    {
      query: `latest approaches for ${prompt}`,
      status: 'loading',
      timestamp: Date.now() + 1,
      type: 'web'
    },
    {
      query: `best practices for ${prompt}`,
      status: 'loading',
      timestamp: Date.now() + 2,
      type: 'web'
    },
    {
      query: 'Analyzing search results and planning approach',
      status: 'loading',
      timestamp: Date.now() + 3,
      type: 'think'
    },
    {
      query: 'Generating solution architecture',
      status: 'loading',
      timestamp: Date.now() + 4,
      type: 'generate'
    }
  ]);

  // Step progression
  useEffect(() => {
    if (aiMode === 'agentic') {
      const steps = searchSteps.length > 0 ? searchSteps : agenticSteps;
      let currentCount = 1;
      
      const stepInterval = setInterval(() => {
        if (currentCount < steps.length) {
          currentCount++;
          setVisibleStepCount(currentCount);
        } else {
          clearInterval(stepInterval);
        }
      }, 2000);

      return () => clearInterval(stepInterval);
    }
  }, [aiMode, searchSteps, agenticSteps]);

  // Reset visible step count when switching modes or when new steps arrive
  useEffect(() => {
    setVisibleStepCount(1);
  }, [aiMode, searchSteps.length]);

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, mode === 'fast' ? 30 : 50);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (aiMode === 'quick') {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % quickModeSteps.length);
      }, 2000);

      return () => clearInterval(stepInterval);
    }
  }, [aiMode]);

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
          <p className="text-gray-600">
            {aiMode === 'quick' ? 'Generating pipeline for' : 'Researching solution for'}
          </p>
          <p className="text-xl font-['Google_Sans'] text-gray-900">{prompt}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {aiMode === 'quick' ? (
            // Quick Mode Steps
            quickModeSteps.map((step, index) => {
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
            })
          ) : (
            // Agentic Mode Steps
            <div className="space-y-3">
              {(searchSteps.length > 0 ? searchSteps : agenticSteps)
                .slice(0, visibleStepCount)
                .map((step, index) => (
                <div 
                  key={`${step.type}-${step.timestamp}`}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center gap-2">
                    {step.type === 'web' ? (
                      <Globe className="w-5 h-5 text-blue-400" />
                    ) : step.type === 'think' ? (
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    ) : step.type === 'search' ? (
                      <Search className="w-5 h-5 text-green-500" />
                    ) : (
                      <Brain className="w-5 h-5 text-orange-500" />
                    )}
                    <span className="text-gray-600 font-['Google_Sans']">
                      {step.type === 'web' ? 'Searching the web:' :
                       step.type === 'think' ? 'Thinking:' :
                       step.type === 'search' ? 'Searching:' :
                       'Generating:'}
                    </span>
                  </div>
                  <div className="text-gray-500 pl-7">
                    "{step.query}"
                  </div>
                  {step.status === 'loading' && index === visibleStepCount - 1 ? (
                    <div className="pl-7 flex space-x-1.5 mt-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
                    </div>
                  ) : (
                    <div className="pl-7 mt-1">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
              <p className="text-gray-600 transition-opacity duration-300">
                {facts[factIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const bounceKeyframes = `
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = bounceKeyframes;
document.head.appendChild(styleSheet);
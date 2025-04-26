import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipeline } from '../../../App';
import { 
  Bot, 
  Brain,
  ChevronDown,
  Code,
  Database,
  ExternalLink,
  HelpCircle,
  LineChart,
  Sparkles,
  Zap,
  Timer,
  ShieldCheck
} from 'lucide-react';

interface AgentReasoningViewProps {
  pipeline: Pipeline;
}

interface AgentCardProps {
  component: any;
  index: number;
  pipeline: Pipeline;
}

interface ImpactTag {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const getImpactTags = (impact: { accuracy: string; latency: string; reliability: string }): ImpactTag[] => {
  const tags: ImpactTag[] = [];

  // Accuracy impact
  if (impact.accuracy.startsWith('+')) {
    tags.push({
      icon: <Brain className="w-4 h-4" />,
      label: 'Improves accuracy',
      color: 'bg-purple-50 text-purple-700'
    });
  }

  // Latency impact
  if (impact.latency.startsWith('-')) {
    tags.push({
      icon: <Timer className="w-4 h-4" />,
      label: 'Reduces latency',
      color: 'bg-green-50 text-green-700'
    });
  } else if (impact.latency.startsWith('+')) {
    tags.push({
      icon: <Timer className="w-4 h-4" />,
      label: 'Increases processing time',
      color: 'bg-yellow-50 text-yellow-700'
    });
  }

  // Reliability impact
  if (impact.reliability.startsWith('+')) {
    tags.push({
      icon: <ShieldCheck className="w-4 h-4" />,
      label: 'Enhances reliability',
      color: 'bg-blue-50 text-blue-700'
    });
  }

  return tags;
};

const getAgentColor = (type: string) => {
  switch (type) {
    case 'preprocessing': return 'bg-blue-50 text-blue-600';
    case 'model': return 'bg-purple-50 text-purple-600';
    case 'postprocessing': return 'bg-green-50 text-green-600';
    case 'feature': return 'bg-orange-50 text-orange-600';
    case 'transformation': return 'bg-rose-50 text-rose-600';
    case 'monitoring': return 'bg-cyan-50 text-cyan-600';
    case 'explainability': return 'bg-yellow-50 text-yellow-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

const AgentCard = ({ component, index, pipeline }: AgentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const reasoning = component.agentReasoning;
  const impactTags = getImpactTags(reasoning.performanceImpact);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'preprocessing': return <Database className="w-5 h-5" />;
      case 'model': return <Sparkles className="w-5 h-5" />;
      case 'postprocessing': return <Code className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div className={`rounded-xl border transition-all ${
        isExpanded ? 'bg-white shadow-lg' : 'bg-white/50 hover:bg-white hover:shadow-md'
      }`}>
        {/* Component Type Banner */}
        <div className="flex items-center justify-between px-6 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="font-['Google_Sans'] text-sm">Component: {component.name}</span>
          </div>
          <span className={`text-sm ${getAgentColor(component.type)}`}>
            {component.type.toLowerCase()}
          </span>
        </div>

        {/* Agent Header */}
        <div 
          className="p-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-4">
            {/* Agent Avatar */}
            <div className={`relative p-3 rounded-xl ${getAgentColor(component.type)}`}>
              {getAgentIcon(component.type)}
              <span className="absolute -bottom-1 -right-1 text-lg">
                {component.type === 'preprocessing' ? '🧹' :
                 component.type === 'model' ? '🧠' : '⚡️'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Agent Identity */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-['Google_Sans'] text-lg text-gray-900">
                  {reasoning.agentName}
                </h3>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  {reasoning.role}
                </span>
              </div>

              {/* Quote */}
              <p className="text-gray-600 italic">"{reasoning.quote}"</p>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-6">
                {/* Component Description */}
                <div>
                  <h4 className="text-sm font-['Google_Sans'] text-gray-900 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    Component Purpose
                  </h4>
                  <p className="text-gray-600">{reasoning.description}</p>
                </div>

                {/* Why This Component */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-['Google_Sans'] text-gray-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-500" />
                    Why This Choice?
                  </h4>
                  <p className="text-gray-600">{reasoning.why}</p>
                </div>

                {/* Performance Impact */}
                <div>
                  <h4 className="text-sm font-['Google_Sans'] text-gray-900 mb-3 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-green-500" />
                    Performance Impact
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {impactTags.map((tag, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tag.color}`}
                      >
                        {tag.icon}
                        <span className="text-sm">{tag.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4">
                  {reasoning.note && (
                    <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
                      <strong className="font-['Google_Sans']">Optimization Note:</strong> {reasoning.note}
                    </div>
                  )}

                  {reasoning.codeSnippet && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-['Google_Sans'] text-gray-900 flex items-center gap-2">
                          <Code className="w-4 h-4 text-orange-500" />
                          Implementation Preview
                        </h4>
                        <a
                          href="#"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          View Full Code
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-x-auto">
                        {reasoning.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Line */}
      {index < pipeline.components.length - 1 && (
        <div className="absolute left-[2.75rem] top-full h-8 w-px bg-gray-200" />
      )}
    </motion.div>
  );
};

export function AgentReasoningView({ pipeline }: AgentReasoningViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      {/* Overview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-['Google_Sans'] text-gray-900 mb-4">
              Pipeline Overview
            </h2>
            <div className="space-y-3">
              {pipeline.components.map((component, index) => (
                <div key={component.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      <span className="font-medium text-gray-900">{component.name}:</span>{' '}
                      {component.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-8">
        {pipeline.components.map((component, index) => (
          <AgentCard
            key={component.id}
            component={component}
            index={index}
            pipeline={pipeline}
          />
        ))}
      </div>
    </div>
  );
}
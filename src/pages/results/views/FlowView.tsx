import React from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import { motion } from 'framer-motion';
import { Pipeline } from '../../../App';
import { Database, Sparkles, Code, ExternalLink, Package, ChevronDown, GitBranch, ArrowLeftRight, Activity, LineChart } from 'lucide-react';
import 'reactflow/dist/style.css';

interface FlowViewProps {
  pipeline: Pipeline;
}

// Custom Node Component
const CustomNode = ({ data }: { data: any }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'preprocessing': return 'bg-blue-100 text-blue-600';
      case 'model': return 'bg-purple-100 text-purple-600';
      case 'postprocessing': return 'bg-green-100 text-green-600';
      case 'feature': return 'bg-orange-100 text-orange-600';
      case 'transformation': return 'bg-rose-100 text-rose-600';
      case 'monitoring': return 'bg-cyan-100 text-cyan-600';
      case 'explainability': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'preprocessing': return <Database className="w-5 h-5" />;
      case 'model': return <Sparkles className="w-5 h-5" />;
      case 'postprocessing': return <Code className="w-5 h-5" />;
      case 'feature': return <GitBranch className="w-5 h-5" />;
      case 'transformation': return <ArrowLeftRight className="w-5 h-5" />;
      case 'monitoring': return <Activity className="w-5 h-5" />;
      case 'explainability': return <LineChart className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 w-[300px]"
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${getNodeColor(data.type)}`}>
            {getNodeIcon(data.type)}
          </div>
          <div className="flex-1">
            <h3 className="font-['Google_Sans'] text-gray-900">{data.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{data.description}</p>
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
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Dependencies */}
          {data.requirements?.dependencies && (
            <div>
              <h4 className="text-sm font-['Google_Sans'] text-gray-900 mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-1">
                {data.requirements.dependencies.map((dep: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-600"
                  >
                    <Package className="w-3 h-3" />
                    {dep.split('>=')[0]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Environments */}
          {data.requirements?.environments && (
            <div>
              <h4 className="text-sm font-['Google_Sans'] text-gray-900 mb-2">Supported Environments</h4>
              <div className="flex flex-wrap gap-1">
                {data.requirements.environments.map((env: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-600"
                  >
                    {env}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Code Preview */}
          {data.codeSnippet && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-['Google_Sans'] text-gray-900">Code Preview</h4>
                <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Full <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-gray-300 font-mono">
                  {data.codeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export function FlowView({ pipeline }: FlowViewProps) {
  // Get unique component types from the pipeline
  const componentTypes = Array.from(new Set(pipeline.components.map(c => c.type)));

  // Update nodes and edges when pipeline changes
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    // Initialize nodes with updated positions
    const newNodes: Node[] = pipeline.components.map((component, index) => ({
      id: component.id,
      type: 'custom',
      position: { x: index * 400, y: 100 },
      data: component,
    }));

    // Initialize edges between components
    const newEdges: Edge[] = pipeline.components.slice(0, -1).map((component, index) => ({
      id: `e${component.id}-${pipeline.components[index + 1].id}`,
      source: component.id,
      target: pipeline.components[index + 1].id,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#94a3b8' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [pipeline.components, setNodes, setEdges]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'preprocessing': return 'bg-blue-100 text-blue-600';
      case 'model': return 'bg-purple-100 text-purple-600';
      case 'postprocessing': return 'bg-green-100 text-green-600';
      case 'feature': return 'bg-orange-100 text-orange-600';
      case 'transformation': return 'bg-rose-100 text-rose-600';
      case 'monitoring': return 'bg-cyan-100 text-cyan-600';
      case 'explainability': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preprocessing': return 'bg-blue-500';
      case 'model': return 'bg-purple-500';
      case 'postprocessing': return 'bg-green-500';
      case 'feature': return 'bg-orange-500';
      case 'transformation': return 'bg-rose-500';
      case 'monitoring': return 'bg-cyan-500';
      case 'explainability': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-[calc(100vh-128px)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const type = node.data.type;
            return type === 'preprocessing' ? '#93c5fd' :
                   type === 'model' ? '#c084fc' :
                   '#86efac';
          }}
          maskColor="rgba(243, 244, 246, 0.7)"
        />
        <Panel position="bottom-center" className="bg-white rounded-full shadow-sm border border-gray-100 px-8 py-3 mb-6">
          <div className="flex items-center gap-8">
            {componentTypes.map(type => (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${getTypeColor(type)}`} />
                <span className="text-sm text-gray-600">
                  {type.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
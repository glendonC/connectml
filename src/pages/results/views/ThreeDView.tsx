import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { Pipeline } from '../../../App';
import { ModelNode } from '../../../components/3d/ModelNode';
import { Database, Sparkles, Code, GitBranch, ArrowLeftRight, Activity, LineChart } from 'lucide-react';

interface ThreeDViewProps {
  pipeline: Pipeline;
  hideLabels?: boolean;
}

export function ThreeDView({ pipeline, hideLabels = false }: ThreeDViewProps) {
  // Get unique component types from the pipeline
  const componentTypes = Array.from(new Set(pipeline.components.map(c => c.type)));

  const getIconByType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'preprocessing': return <Database className="w-4 h-4 text-blue-600" />;
      case 'model': return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'postprocessing': return <Code className="w-4 h-4 text-green-600" />;
      case 'feature': return <GitBranch className="w-4 h-4 text-orange-600" />;
      case 'transformation': return <ArrowLeftRight className="w-4 h-4 text-rose-600" />;
      case 'monitoring': return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'explainability': return <LineChart className="w-4 h-4 text-yellow-600" />;
      default: return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'preprocessing': return 'bg-blue-100/80';
      case 'model': return 'bg-purple-100/80';
      case 'postprocessing': return 'bg-green-100/80';
      case 'feature': return 'bg-orange-100/80';
      case 'transformation': return 'bg-rose-100/80';
      case 'monitoring': return 'bg-cyan-100/80';
      case 'explainability': return 'bg-yellow-100/80';
      default: return 'bg-gray-100/80';
    }
  };

  return (
    <div className="relative h-[calc(100vh-128px)]">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
        <h3 className="text-sm font-['Google_Sans'] text-gray-900 mb-3">Pipeline Components</h3>
        <div className="space-y-2">
          {componentTypes.map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${getTypeColor(type)}`}>
                {getIconByType(type)}
              </div>
              <span className="text-sm text-gray-600">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
        <h3 className="text-sm font-['Google_Sans'] text-gray-900 mb-2">Controls</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>🖱️ Left Click + Drag to Rotate</p>
          <p>🖱️ Right Click + Drag to Pan</p>
          <p>🖱️ Scroll to Zoom</p>
        </div>
      </div>

      <Canvas>
        <color attach="background" args={['#f8fafc']} />
        <fog attach="fog" args={['#f8fafc', 20, 30]} />
        
        <PerspectiveCamera makeDefault position={[0, 2, 15]} fov={50} />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={0.5} />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
          
          <group position={[0, 0, 0]}>
            {pipeline.components.map((component, index) => {
              const x = (index - (pipeline.components.length - 1) / 2) * 6;
              return (
                <Float
                  key={component.id}
                  speed={1.5} 
                  rotationIntensity={0.2} 
                  floatIntensity={0.5}
                  floatingRange={[0, 0.5]}
                >
                  <ModelNode
                    type={component.type}
                    position={[x, 0, 0]}
                    isActive={false}
                    data={component}
                    hideLabels={hideLabels}
                  />
                </Float>
              );
            })}
          </group>
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
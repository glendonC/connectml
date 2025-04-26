import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, MeshTransmissionMaterial, Edges, Trail } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Database, Sparkles, Code, GitBranch, ArrowLeftRight, Activity, LineChart, Package, LucideIcon } from 'lucide-react';

type ComponentType = 'preprocessing' | 'model' | 'postprocessing' | 'feature' | 'transformation' | 'monitoring' | 'explainability';

interface ModelType {
  geometry: THREE.BufferGeometry;
  color: string;
  icon: LucideIcon;
  emissive: string;
}

const MODEL_TYPES: Record<ComponentType, ModelType> = {
  preprocessing: {
    geometry: new THREE.OctahedronGeometry(0.8, 2),
    color: '#3b82f6',  // blue-500
    icon: Database,
    emissive: '#2563eb'  // blue-600
  },
  model: {
    geometry: new THREE.TorusKnotGeometry(0.5, 0.2, 128, 32),
    color: '#8b5cf6',  // purple-500
    icon: Sparkles,
    emissive: '#7c3aed'  // purple-600
  },
  postprocessing: {
    geometry: new THREE.IcosahedronGeometry(0.7, 2),
    color: '#22c55e',  // green-500
    icon: Code,
    emissive: '#16a34a'  // green-600
  },
  feature: {
    geometry: new THREE.TetrahedronGeometry(0.8, 2),
    color: '#f97316',  // orange-500
    icon: GitBranch,
    emissive: '#ea580c'  // orange-600
  },
  transformation: {
    geometry: new THREE.DodecahedronGeometry(0.7, 1),
    color: '#f43f5e',  // rose-500
    icon: ArrowLeftRight,
    emissive: '#e11d48'  // rose-600
  },
  monitoring: {
    geometry: new THREE.CapsuleGeometry(0.5, 0.5, 4, 16),
    color: '#06b6d4',  // cyan-500
    icon: Activity,
    emissive: '#0891b2'  // cyan-600
  },
  explainability: {
    geometry: new THREE.SphereGeometry(0.7, 32, 32),
    color: '#facc15',  // yellow-400
    icon: LineChart,
    emissive: '#ca8a04'  // yellow-600
  }
};

interface ParticleCloudProps {
  color: string;
  count?: number;
  size?: number;
  spread?: number;
}

function ParticleCloud({ color, count = 20, size = 0.05, spread = 1 }: ParticleCloudProps) {
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        ] as [number, number, number],
        scale: Math.random() * 0.5 + 0.5
      });
    }
    return temp;
  }, [count, spread]);

  return (
    <group>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

interface GlowingRingProps {
  radius?: number;
  thickness?: number;
  color: string;
}

function GlowingRing({ radius = 1, thickness = 0.1, color }: GlowingRingProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 32, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

interface ModelNodeProps {
  type: ComponentType;
  position: [number, number, number];
  isActive: boolean;
  data: any;
  hideLabels?: boolean;
}

export function ModelNode({ type, position, isActive, data, hideLabels = false }: ModelNodeProps) {
  const modelConfig = MODEL_TYPES[type];
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.1;
      
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={modelConfig.geometry}
        onPointerOver={() => {
          setHovered(true);
          setShowDetails(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          setShowDetails(false);
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.5}
          chromaticAberration={0.3}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.3}
          temporalDistortion={0.1}
          iridescence={0.3}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color={modelConfig.color}
          emissive={modelConfig.emissive}
          emissiveIntensity={isActive ? 6 : 3}
          transmission={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          opacity={1}
        />
        <Edges color={modelConfig.emissive} scale={1.1} threshold={15} />
      </mesh>

      {/* Particle Effects */}
      {(isActive || hovered) && (
        <ParticleCloud color={modelConfig.emissive} count={30} spread={1.5} />
      )}

      {/* Glowing Rings */}
      <group>
        <GlowingRing radius={1.2} color={modelConfig.emissive} />
        {(isActive || hovered) && (
          <>
            <GlowingRing radius={1.4} color={modelConfig.emissive} />
            <GlowingRing radius={1.6} color={modelConfig.emissive} />
          </>
        )}
      </group>

      {/* Component Details */}
      {!hideLabels && (
        <Html position={[0, -2, 0]} center transform>
          <div className={`px-4 py-2 rounded-xl ${
            showDetails || isExpanded ? 'bg-white shadow-xl scale-105' : 'bg-white/80'
          } transition-all duration-200`}>
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                type === 'preprocessing' ? 'bg-blue-100 text-blue-600' :
                type === 'model' ? 'bg-purple-100 text-purple-600' :
                type === 'postprocessing' ? 'bg-green-100 text-green-600' :
                type === 'feature' ? 'bg-amber-100 text-amber-600' :
                type === 'transformation' ? 'bg-rose-100 text-rose-600' :
                type === 'monitoring' ? 'bg-cyan-100 text-cyan-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                <modelConfig.icon className="w-5 h-5" />
              </div>
              <span className="font-['Google_Sans'] text-gray-900">
                {data.name}
              </span>
            </div>

            {/* Expanded Content */}
            {(showDetails || isExpanded) && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">{data.description}</p>

                {/* Dependencies */}
                {data.requirements?.dependencies && (
                  <div className="flex flex-wrap gap-1">
                    {data.requirements.dependencies.map((dep: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        <Package className="w-3 h-3" />
                        {dep.split('>=')[0]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Environments */}
                {data.requirements?.environments && (
                  <div className="flex flex-wrap gap-1">
                    {data.requirements.environments.map((env: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {env}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
        />
      </EffectComposer>
    </group>
  );
}